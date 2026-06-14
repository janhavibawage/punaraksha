import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import cors from "cors";
import express from "express";
import multer from "multer";
import { dbInfo, initDb } from "./db.js";
import {
  countUsers,
  createUser,
  findUserByEmail,
  getUserSettings,
  hashPassword,
  listUsers,
  mapPublicUser,
  requireAdmin,
  requireAuth,
  requireRole,
  clearAuthCookie,
  setAuthCookie,
  signToken,
  deleteUserAccount,
  updateUserSettings,
  updateUserRole,
  verifyPassword,
} from "./auth.js";
import { analyzeUploadedEvidence, isAllowedUpload, safeEvidencePath } from "./imageForensics.js";
import {
  buildIntervention,
  classifyText,
  draftNotice,
  getSlaDeadline,
  makeAction,
  routeGrievance,
  wardForecasts,
} from "./logic.js";
import {
  getState,
  getStateForUser,
  insertAction,
  insertGrievance,
  insertIntervention,
  interventionExistsForWard,
  deleteGrievance,
  resetAll,
  updateGrievanceStatus,
  updateInterventionStatus,
  canAccessEvidence,
} from "./repository.js";

const port = Number(process.env.PORT ?? 8787);
const uploadDir = path.resolve(process.env.UPLOAD_DIR ?? "server/uploads/evidence");
const app = express();

fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDir),
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname) || ".jpg";
      callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!isAllowedUpload(file)) {
      callback(new Error("Only JPEG, PNG, and WebP evidence images are allowed"));
      return;
    }

    callback(null, true);
  },
});

await initDb();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "PunaRaksha API",
    database: dbInfo().dbPath,
    uploadDir,
  });
});

app.get("/api/state", requireAuth, (req, res) => {
  res.json(getStateForUser(req.user));
});

app.post("/api/auth/signup", async (req, res) => {
  const name = String(req.body.name ?? "").trim();
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");
  const requestedRole = String(req.body.role ?? "citizen");
  const adminCode = String(req.body.adminCode ?? "");

  if (!name || !email || password.length < 8) {
    res.status(400).json({ error: "Name, email, and an 8+ character password are required" });
    return;
  }

  if (findUserByEmail(email)) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const firstUser = countUsers() === 0;
  const canCreateAdmin = firstUser || (process.env.ADMIN_INVITE_CODE && adminCode === process.env.ADMIN_INVITE_CODE);
  const role = requestedRole === "admin" && canCreateAdmin ? "admin" : "citizen";
  const { hash, salt } = await hashPassword(password);
  const user = createUser({ name, email, passwordHash: hash, passwordSalt: salt, role });
  const token = signToken(user);
  setAuthCookie(res, token);

  res.status(201).json({ user, token, firstUser });
});

app.post("/api/auth/signin", async (req, res) => {
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");
  const user = findUserByEmail(email);

  if (!user || !(await verifyPassword(password, user))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const publicUser = mapPublicUser(user);
  const token = signToken(publicUser);
  setAuthCookie(res, token);
  res.json({ user: publicUser, token });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.post("/api/auth/signout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

app.get("/api/me/settings", requireAuth, (req, res) => {
  res.json({ settings: getUserSettings(req.user.id) });
});

app.patch("/api/me/settings", requireAuth, (req, res) => {
  res.json({ settings: updateUserSettings(req.user.id, req.body.settings ?? req.body) });
});

app.delete("/api/me", requireAuth, (req, res) => {
  deleteUserAccount(req.user.id);
  clearAuthCookie(res);
  res.json({ ok: true });
});

app.get("/api/admin/users", requireAdmin, (_req, res) => {
  res.json({ users: listUsers() });
});

app.patch("/api/admin/users/:id/role", requireAdmin, (req, res) => {
  const role = String(req.body.role ?? "");
  if (!["citizen", "officer", "admin"].includes(role)) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }

  updateUserRole(req.params.id, role);
  res.json({ users: listUsers() });
});

app.get("/api/admin/summary", requireAdmin, (_req, res) => {
  const state = getState();
  res.json({
    users: listUsers(),
    grievanceCount: state.grievances.length,
    unresolvedCount: state.grievances.filter((item) => item.status !== "resolved").length,
    interventionCount: state.interventions.length,
  });
});

app.get("/api/files/evidence/:filename", requireAuth, (req, res) => {
  const safe = safeEvidencePath(uploadDir, req.params.filename);
  if (!safe || !canAccessEvidence(req.user, safe.fileName)) {
    res.status(404).json({ error: "Evidence file not found" });
    return;
  }

  if (!fs.existsSync(safe.filePath)) {
    res.status(404).json({ error: "Evidence file not found" });
    return;
  }

  res.sendFile(safe.filePath);
});

app.post("/api/grievances", requireAuth, upload.single("evidenceFile"), (req, res) => {
  const text = String(req.body.text ?? "").trim();
  const wardId = String(req.body.wardId ?? "").trim();

  if (!text || !wardId) {
    res.status(400).json({ error: "text and wardId are required" });
    return;
  }

  const now = new Date().toISOString();
  const classification = classifyText(text);
  const assignedTo = routeGrievance(classification.category, wardId);
  const baseEvidence = parseJson(req.body.evidence);
  let evidence;

  if (req.file) {
    const result = analyzeUploadedEvidence(req.file, baseEvidence);
    if (!result.valid) {
      fs.unlinkSync(req.file.path);
      res.status(400).json({ error: result.reason });
      return;
    }

    evidence = result.analysis;
  }

  const grievance = {
    id: crypto.randomUUID(),
    userId: req.user.id,
    text,
    wardId,
    timestamp: now,
    evidence,
    ...classification,
    assignedTo,
    status: "notified",
    slaDeadline: getSlaDeadline(now, classification.severity),
  };

  grievance.noticeDraft = draftNotice(grievance, assignedTo);

  insertGrievance(grievance);

  const actions = [
    evidence
      ? makeAction(
          {
            agent: "grievance",
            grievanceId: grievance.id,
            wardId,
            actionType: "evidence_checked",
            detail: `Evidence saved and checked: ${evidence.authenticityScore}/100, ${String(evidence.verdict).replace("_", " ")}.`,
            payload: {
              authenticityScore: evidence.authenticityScore,
              verdict: evidence.verdict,
              storedUrl: evidence.storedUrl,
            },
          },
          now,
        )
      : undefined,
    makeAction(
      {
        agent: "grievance",
        grievanceId: grievance.id,
        wardId,
        actionType: "classified",
        detail: `Complaint classified as ${classification.category.replace("_", " ")} with ${classification.severity} severity (${Math.round(
          classification.confidence * 100,
        )}% confidence).`,
        payload: classification,
      },
      now,
    ),
    makeAction(
      {
        agent: "grievance",
        grievanceId: grievance.id,
        wardId,
        actionType: "routed",
        detail: `Routed to ${assignedTo}.`,
        payload: { assignedTo },
      },
      now,
    ),
    makeAction(
      {
        agent: "grievance",
        grievanceId: grievance.id,
        wardId,
        actionType: "notice_drafted",
        detail: `Formal notice drafted for ${assignedTo}.`,
        payload: { noticeDraft: grievance.noticeDraft },
      },
      now,
    ),
    makeAction(
      {
        agent: "grievance",
        grievanceId: grievance.id,
        wardId,
        actionType: "sla_set",
        detail: `${classification.severity.toUpperCase()} SLA set until ${grievance.slaDeadline}.`,
        payload: { slaDeadline: grievance.slaDeadline },
      },
      now,
    ),
  ].filter(Boolean);

  actions.forEach(insertAction);
  res.status(201).json(getStateForUser(req.user));
});

app.patch("/api/grievances/:id/status", requireRole(["officer", "admin"]), (req, res) => {
  const status = String(req.body.status ?? "");
  if (!status) {
    res.status(400).json({ error: "status is required" });
    return;
  }

  updateGrievanceStatus(req.params.id, status);
  res.json(getStateForUser(req.user));
});

app.delete("/api/grievances/:id", requireAdmin, (req, res) => {
  deleteGrievance(req.params.id);
  res.json(getStateForUser(req.user));
});

app.post("/api/interventions/scan", requireRole(["officer", "admin"]), (req, res) => {
  for (const forecast of wardForecasts) {
    if (interventionExistsForWard(forecast.wardId)) {
      continue;
    }

    const intervention = buildIntervention(forecast);
    if (!intervention) {
      continue;
    }

    insertIntervention(intervention);
    insertAction(
      makeAction({
        agent: "intervention",
        wardId: intervention.wardId,
        actionType: "intervention_proposed",
        detail: `${intervention.wardName}: AQI ${intervention.triggerAQI} projected within ${intervention.triggerDay} day(s). Mitigation plan generated.`,
        payload: { interventionId: intervention.id, proposedActions: intervention.proposedActions },
      }),
    );
  }

  res.json(getStateForUser(req.user));
});

app.post("/api/interventions/:id/notify", requireRole(["officer", "admin"]), (req, res) => {
  updateInterventionStatus(req.params.id, "notified");
  insertAction(
    makeAction({
      agent: "intervention",
      actionType: "officer_notified",
      detail: "Ward officer notified about preventive AQI actions.",
      payload: { interventionId: req.params.id },
    }),
  );
  res.json(getStateForUser(req.user));
});

app.delete("/api/demo/reset", requireAdmin, (req, res) => {
  resetAll();
  res.json(getStateForUser(req.user));
});

app.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError || error.message?.includes("evidence images")) {
    res.status(400).json({ error: error.message });
    return;
  }

  next(error);
});

const distDir = path.resolve("dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`PunaRaksha API running on http://127.0.0.1:${port}`);
});

function parseJson(value) {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(String(value));
  } catch {
    return undefined;
  }
}
