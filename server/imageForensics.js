import fs from "node:fs";
import path from "node:path";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const suspiciousSoftware = [
  "photoshop",
  "lightroom",
  "snapseed",
  "canva",
  "gimp",
  "picsart",
  "facetune",
  "midjourney",
  "stable diffusion",
  "dall",
  "firefly",
  "generative",
  "ai",
];

export function isAllowedUpload(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  return allowedTypes.has(file.mimetype) && allowedExtensions.has(extension);
}

export function analyzeUploadedEvidence(file, clientEvidence = {}) {
  const buffer = fs.readFileSync(file.path);
  const detectedType = detectImageType(buffer);

  if (!detectedType || detectedType !== file.mimetype) {
    return {
      valid: false,
      reason: "Uploaded file content does not match its declared image type.",
    };
  }

  const stat = fs.statSync(file.path);
  const exif = detectedType === "image/jpeg" ? parseExif(buffer) : { exifFound: false, gpsPresent: false };
  const signals = [];
  let score = 55;

  score += 12;
  signals.push({
    label: "File signature",
    detail: `Backend verified ${detectedType} file bytes.`,
    severity: "good",
  });

  if (exif.exifFound) {
    score += 16;
    signals.push({
      label: "EXIF found",
      detail: "Backend found camera metadata in the uploaded image.",
      severity: "good",
    });
  } else {
    score -= 30;
    signals.push({
      label: "EXIF missing",
      detail: "Backend did not find camera metadata. This is a strong fake/edited-image risk and needs officer review.",
      severity: "bad",
    });
  }

  if (exif.cameraMake || exif.cameraModel) {
    score += 8;
    signals.push({
      label: "Camera identity",
      detail: [exif.cameraMake, exif.cameraModel].filter(Boolean).join(" "),
      severity: "good",
    });
  } else {
    score -= 8;
    signals.push({
      label: "No camera identity",
      detail: "Backend did not find camera make/model. This is common in screenshots, edited exports, or AI-generated files.",
      severity: "warn",
    });
  }

  if (exif.capturedAt) {
    const captured = new Date(exif.capturedAt);
    const ageDays = (Date.now() - captured.getTime()) / 864e5;

    if (Number.isFinite(ageDays) && ageDays < -1) {
      score -= 24;
      signals.push({ label: "Future timestamp", detail: "Backend found a capture time in the future.", severity: "bad" });
    } else if (Number.isFinite(ageDays) && ageDays > 90) {
      score -= 8;
      signals.push({ label: "Old capture", detail: "Backend found a capture time older than 90 days.", severity: "warn" });
    } else {
      score += 6;
      signals.push({ label: "Capture time", detail: `Captured ${formatDate(exif.capturedAt)}.`, severity: "good" });
    }
  }

  if (exif.software) {
    const software = exif.software.toLowerCase();
    const suspicious = suspiciousSoftware.some((keyword) => software.includes(keyword));
    score += suspicious ? -28 : -4;
    signals.push({
      label: suspicious ? "Editing software" : "Software tag",
      detail: exif.software,
      severity: suspicious ? "bad" : "info",
    });
  }

  if (exif.gpsPresent) {
    score += 7;
    signals.push({
      label: "Location metadata",
      detail: "Backend found GPS metadata.",
      severity: "good",
    });
  } else {
    score -= 3;
    signals.push({
      label: "No GPS",
      detail: "Backend did not find GPS metadata.",
      severity: "info",
    });
  }

  const authenticityScore = clamp(Math.round(score), 5, 96);
  const verdict = authenticityScore >= 75 ? "likely_original" : authenticityScore >= 50 ? "needs_review" : "suspicious";

  return {
    valid: true,
    analysis: {
      fileName: file.originalname,
      fileType: detectedType,
      fileSize: file.size,
      previewUrl: "",
      storedUrl: `/api/files/evidence/${file.filename}`,
      storedFileName: file.filename,
      checkedAt: new Date().toISOString(),
      fileLastModified: stat.mtime.toISOString(),
      imageWidth: clientEvidence.imageWidth,
      imageHeight: clientEvidence.imageHeight,
      exifFound: exif.exifFound,
      mimeMatchesExtension: true,
      capturedAt: exif.capturedAt,
      modifiedAt: exif.modifiedAt,
      cameraMake: exif.cameraMake,
      cameraModel: exif.cameraModel,
      software: exif.software,
      orientation: exif.orientation,
      gpsPresent: exif.gpsPresent,
      authenticityScore,
      verdict,
      signals,
    },
  };
}

export function safeEvidencePath(uploadDir, requestedName) {
  const fileName = path.basename(requestedName);
  const filePath = path.resolve(uploadDir, fileName);

  if (!filePath.startsWith(path.resolve(uploadDir))) {
    return undefined;
  }

  return { fileName, filePath };
}

function detectImageType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }

  return undefined;
}

function parseExif(buffer) {
  const fallback = { exifFound: false, gpsPresent: false };
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  try {
    let offset = 2;
    while (offset < view.byteLength - 4) {
      if (view.getUint8(offset) !== 0xff) {
        break;
      }

      const marker = view.getUint8(offset + 1);
      const segmentLength = view.getUint16(offset + 2, false);
      const segmentStart = offset + 4;

      if (marker === 0xe1 && readAscii(view, segmentStart, 6) === "Exif\0\0") {
        return parseTiff(view, segmentStart + 6);
      }

      offset += 2 + segmentLength;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function parseTiff(view, tiffStart) {
  const littleEndian = view.getUint16(tiffStart, false) === 0x4949;
  const get32 = (position) => view.getUint32(position, littleEndian);
  const firstIfdOffset = tiffStart + get32(tiffStart + 4);
  const ifd0 = readIfd(view, tiffStart, firstIfdOffset, littleEndian);
  const exifPointer = ifd0.get(0x8769);
  const gpsPointer = ifd0.get(0x8825);
  const exifIfd = typeof exifPointer === "number" ? readIfd(view, tiffStart, tiffStart + exifPointer, littleEndian) : new Map();
  const gpsIfd = typeof gpsPointer === "number" ? readIfd(view, tiffStart, tiffStart + gpsPointer, littleEndian) : new Map();

  return {
    exifFound: true,
    gpsPresent: gpsIfd.has(0x0002) && gpsIfd.has(0x0004),
    cameraMake: stringValue(ifd0.get(0x010f)),
    cameraModel: stringValue(ifd0.get(0x0110)),
    software: stringValue(ifd0.get(0x0131)),
    orientation: numberValue(ifd0.get(0x0112)),
    modifiedAt: parseExifDate(stringValue(ifd0.get(0x0132))),
    capturedAt: parseExifDate(stringValue(exifIfd.get(0x9003)) ?? stringValue(exifIfd.get(0x9004))),
  };
}

function readIfd(view, tiffStart, ifdOffset, littleEndian) {
  const get16 = (position) => view.getUint16(position, littleEndian);
  const get32 = (position) => view.getUint32(position, littleEndian);
  const entries = get16(ifdOffset);
  const values = new Map();

  for (let index = 0; index < entries; index += 1) {
    const entryOffset = ifdOffset + 2 + index * 12;
    const tag = get16(entryOffset);
    const type = get16(entryOffset + 2);
    const count = get32(entryOffset + 4);
    const valueSize = typeSize(type) * count;
    const valueOffset = valueSize <= 4 ? entryOffset + 8 : tiffStart + get32(entryOffset + 8);

    values.set(tag, readExifValue(view, valueOffset, type, count, littleEndian));
  }

  return values;
}

function readExifValue(view, offset, type, count, littleEndian) {
  if (type === 2) {
    return readAscii(view, offset, count).replace(/\0+$/, "").trim();
  }

  if (type === 3) {
    return count === 1
      ? view.getUint16(offset, littleEndian)
      : Array.from({ length: count }, (_, index) => view.getUint16(offset + index * 2, littleEndian));
  }

  if (type === 4) {
    return count === 1
      ? view.getUint32(offset, littleEndian)
      : Array.from({ length: count }, (_, index) => view.getUint32(offset + index * 4, littleEndian));
  }

  if (type === 5) {
    return Array.from({ length: count }, (_, index) => {
      const position = offset + index * 8;
      const numerator = view.getUint32(position, littleEndian);
      const denominator = view.getUint32(position + 4, littleEndian);
      return denominator === 0 ? 0 : numerator / denominator;
    });
  }

  return "";
}

function typeSize(type) {
  if (type === 1 || type === 2 || type === 7) return 1;
  if (type === 3) return 2;
  if (type === 4 || type === 9) return 4;
  if (type === 5 || type === 10) return 8;
  return 1;
}

function readAscii(view, offset, length) {
  let output = "";
  for (let index = 0; index < length && offset + index < view.byteLength; index += 1) {
    output += String.fromCharCode(view.getUint8(offset + index));
  }
  return output;
}

function parseExifDate(value) {
  if (!value) return undefined;
  const match = /^(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/.exec(value);
  if (!match) return undefined;
  const [, year, month, day, hour, minute, second] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)).toISOString();
}

function stringValue(value) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function numberValue(value) {
  return typeof value === "number" ? value : undefined;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatDate(iso) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
