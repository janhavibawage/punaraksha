import crypto from "node:crypto";
import { all, run } from "./db.js";

const tokenSecret = process.env.AUTH_SECRET ?? (process.env.NODE_ENV === "production" ? undefined : "local-dev-punaraksha-secret-change-before-deploy");
const tokenTtlMs = 1000 * 60 * 60 * 24 * 7;
const cookieName = "punaraksha_session";

if (!tokenSecret) {
  throw new Error("AUTH_SECRET must be set in production");
}

export async function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey.toString("hex"));
    });
  });

  return { salt, hash };
}

export async function verifyPassword(password, user) {
  const { hash } = await hashPassword(password, user.password_salt);
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.password_hash, "hex"));
}

export function createUser({ name, email, passwordHash, passwordSalt, role }) {
  const user = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    role,
    createdAt: new Date().toISOString(),
  };

  run(
    `INSERT INTO users (id, name, email, password_hash, password_salt, role, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user.id, user.name, user.email, passwordHash, passwordSalt, user.role, user.createdAt],
  );

  return user;
}

export function findUserByEmail(email) {
  return all("SELECT * FROM users WHERE lower(email) = lower(?) LIMIT 1", [email])[0];
}

export function findUserById(id) {
  return all("SELECT * FROM users WHERE id = ? LIMIT 1", [id])[0];
}

export function countUsers() {
  return Number(all("SELECT COUNT(*) AS count FROM users")[0]?.count ?? 0);
}

export function listUsers() {
  return all("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC").map(mapPublicUser);
}

export function updateUserRole(id, role) {
  run("UPDATE users SET role = ? WHERE id = ?", [role, id]);
}

export function getUserSettings(userId) {
  const row = all("SELECT settings_json FROM user_settings WHERE user_id = ? LIMIT 1", [userId])[0];
  return normalizeSettings(parseJson(row?.settings_json));
}

export function updateUserSettings(userId, settings) {
  const next = normalizeSettings(settings);
  const now = new Date().toISOString();

  run(
    `INSERT INTO user_settings (user_id, settings_json, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET settings_json = excluded.settings_json, updated_at = excluded.updated_at`,
    [userId, JSON.stringify(next), now],
  );

  return next;
}

export function deleteUserAccount(userId) {
  run("DELETE FROM actions WHERE grievance_id IN (SELECT id FROM grievances WHERE user_id = ?)", [userId]);
  run("DELETE FROM grievances WHERE user_id = ?", [userId]);
  run("DELETE FROM user_settings WHERE user_id = ?", [userId]);
  run("DELETE FROM users WHERE id = ?", [userId]);
}

export function signToken(user) {
  const payload = {
    sub: user.id,
    role: user.role,
    exp: Date.now() + tokenTtlMs,
  };
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token) {
  if (!token || !token.includes(".")) {
    return undefined;
  }

  const [encodedPayload, signature] = token.split(".");
  if (signature !== sign(encodedPayload)) {
    return undefined;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!payload.exp || Date.now() > payload.exp) {
      return undefined;
    }

    const user = findUserById(payload.sub);
    return user ? mapPublicUser(user) : undefined;
  } catch {
    return undefined;
  }
}

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? readCookie(req, cookieName);
  const user = verifyToken(token);

  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  req.user = user;
  next();
}

export function requireRole(roles) {
  return (req, res, next) => {
    requireAuth(req, res, () => {
      if (!roles.includes(req.user.role)) {
        res.status(403).json({ error: "Insufficient permissions" });
        return;
      }

      next();
    });
  };
}

export function requireAdmin(req, res, next) {
  return requireRole(["admin"])(req, res, next);
}

export function setAuthCookie(res, token) {
  res.setHeader("Set-Cookie", serializeCookie(cookieName, token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: Math.floor(tokenTtlMs / 1000),
    path: "/",
  }));
}

export function clearAuthCookie(res) {
  res.setHeader("Set-Cookie", serializeCookie(cookieName, "", {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  }));
}

export function mapPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at ?? user.createdAt,
  };
}

function normalizeSettings(value = {}) {
  const settings = value && typeof value === "object" ? value : {};
  const notifications = settings.notifications && typeof settings.notifications === "object" ? settings.notifications : {};
  const permissions = settings.permissions && typeof settings.permissions === "object" ? settings.permissions : {};
  const privacy = settings.privacy && typeof settings.privacy === "object" ? settings.privacy : {};

  return {
    appearance: ["light", "dark", "system"].includes(settings.appearance) ? settings.appearance : "light",
    language: ["en", "mr", "hi"].includes(settings.language) ? settings.language : "en",
    mobileNumber: String(settings.mobileNumber ?? "").slice(0, 20),
    twoFactorEnabled: Boolean(settings.twoFactorEnabled),
    notifications: {
      sms: Boolean(notifications.sms),
      email: notifications.email !== false,
      push: Boolean(notifications.push),
      emergencyAlerts: notifications.emergencyAlerts !== false,
      safetyZoneAlerts: Boolean(notifications.safetyZoneAlerts),
      serviceUpdates: notifications.serviceUpdates !== false,
    },
    permissions: {
      location: permissions.location !== false,
      camera: permissions.camera !== false,
      evidenceStorage: permissions.evidenceStorage !== false,
      analytics: Boolean(permissions.analytics),
    },
    privacy: {
      shareProfileWithOfficers: privacy.shareProfileWithOfficers !== false,
      hidePhoneFromPublicView: privacy.hidePhoneFromPublicView !== false,
      allowEvidenceReview: privacy.allowEvidenceReview !== false,
    },
    suggestion: String(settings.suggestion ?? "").slice(0, 1000),
  };
}

function parseJson(value) {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function sign(value) {
  return crypto.createHmac("sha256", tokenSecret).update(value).digest("base64url");
}

function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function readCookie(req, name) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return undefined;
  }

  return cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function serializeCookie(name, value, options) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.path) {
    parts.push(`Path=${options.path}`);
  }

  if (options.httpOnly) {
    parts.push("HttpOnly");
  }

  if (options.secure) {
    parts.push("Secure");
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  return parts.join("; ");
}
