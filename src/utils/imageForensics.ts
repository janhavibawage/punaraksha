import type { EvidenceAnalysis, EvidenceSignal, EvidenceVerdict } from "../agents/types";

interface ExifData {
  exifFound: boolean;
  capturedAt?: string;
  modifiedAt?: string;
  cameraMake?: string;
  cameraModel?: string;
  software?: string;
  orientation?: number;
  gpsPresent: boolean;
}

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

export async function analyzeEvidenceImage(file: File): Promise<EvidenceAnalysis> {
  const [dimensions, buffer] = await Promise.all([readImageDimensions(file), file.arrayBuffer()]);
  const exif = parseExif(buffer);
  const previewUrl = URL.createObjectURL(file);
  const mimeMatchesExtension = checkMimeExtension(file);
  const checkedAt = new Date().toISOString();
  const fileLastModified = file.lastModified ? new Date(file.lastModified).toISOString() : undefined;
  const signals: EvidenceSignal[] = [];
  let score = 55;

  if (mimeMatchesExtension) {
    score += 7;
    signals.push({
      label: "File signature",
      detail: "File type and extension look consistent.",
      severity: "good",
    });
  } else {
    score -= 30;
    signals.push({
      label: "File mismatch",
      detail: "The MIME type does not match the file extension.",
      severity: "bad",
    });
  }

  if (exif.exifFound) {
    score += 16;
    signals.push({
      label: "EXIF found",
      detail: "Camera metadata is present in the image.",
      severity: "good",
    });
  } else {
    score -= 30;
    signals.push({
      label: "EXIF missing",
      detail: "Camera metadata is absent or stripped. This is a strong fake/edited-image risk and needs officer review.",
      severity: "bad",
    });
  }

  if (exif.cameraMake || exif.cameraModel) {
    score += 8;
    signals.push({
      label: "Camera identity",
      detail: [exif.cameraMake, exif.cameraModel].filter(Boolean).join(" ") || "Camera metadata detected.",
      severity: "good",
    });
  } else {
    score -= 8;
    signals.push({
      label: "No camera identity",
      detail: "The image does not show a camera make/model, which is common in screenshots, edited exports, or AI-generated files.",
      severity: "warn",
    });
  }

  if (exif.capturedAt) {
    const captured = new Date(exif.capturedAt);
    const ageDays = (Date.now() - captured.getTime()) / 864e5;

    if (Number.isFinite(ageDays) && ageDays < -1) {
      score -= 24;
      signals.push({
        label: "Future timestamp",
        detail: "The capture time is in the future.",
        severity: "bad",
      });
    } else if (Number.isFinite(ageDays) && ageDays > 90) {
      score -= 8;
      signals.push({
        label: "Old capture",
        detail: "The photo appears older than 90 days.",
        severity: "warn",
      });
    } else {
      score += 6;
      signals.push({
        label: "Capture time",
        detail: `Captured ${formatDate(exif.capturedAt)}.`,
        severity: "good",
      });
    }
  } else if (exif.exifFound) {
    score -= 5;
    signals.push({
      label: "No capture time",
      detail: "EXIF exists, but original capture time is missing.",
      severity: "warn",
    });
  } else if (fileLastModified) {
    signals.push({
      label: "File modified",
      detail: `Device/browser reports file modified ${formatDate(fileLastModified)}.`,
      severity: "info",
    });
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
      detail: "GPS metadata is present and can support location review.",
      severity: "good",
    });
  } else {
    score -= 3;
    signals.push({
      label: "No GPS",
      detail: "Location metadata is not present. This is common on privacy-protected phones.",
      severity: "info",
    });
  }

  if (dimensions.width && dimensions.height) {
    if (dimensions.width < 640 || dimensions.height < 480) {
      score -= 10;
      signals.push({
        label: "Low resolution",
        detail: `${dimensions.width} x ${dimensions.height}px may be too small for verification.`,
        severity: "warn",
      });
    } else {
      score += 4;
      signals.push({
        label: "Resolution",
        detail: `${dimensions.width} x ${dimensions.height}px is usable for review.`,
        severity: "good",
      });
    }
  }

  const authenticityScore = clamp(Math.round(score), 5, 96);
  const verdict: EvidenceVerdict =
    authenticityScore >= 75 ? "likely_original" : authenticityScore >= 50 ? "needs_review" : "suspicious";

  return {
    fileName: file.name,
    fileType: file.type || "unknown",
    fileSize: file.size,
    previewUrl,
    checkedAt,
    fileLastModified,
    imageWidth: dimensions.width,
    imageHeight: dimensions.height,
    exifFound: exif.exifFound,
    mimeMatchesExtension,
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
  };
}

function parseExif(buffer: ArrayBuffer): ExifData {
  const fallback: ExifData = { exifFound: false, gpsPresent: false };
  const view = new DataView(buffer);

  try {
    if (view.byteLength < 6 || view.getUint16(0, false) !== 0xffd8) {
      return fallback;
    }

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

function parseTiff(view: DataView, tiffStart: number): ExifData {
  const littleEndian = view.getUint16(tiffStart, false) === 0x4949;
  const get16 = (position: number) => view.getUint16(position, littleEndian);
  const get32 = (position: number) => view.getUint32(position, littleEndian);
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

function readIfd(view: DataView, tiffStart: number, ifdOffset: number, littleEndian: boolean) {
  const get16 = (position: number) => view.getUint16(position, littleEndian);
  const get32 = (position: number) => view.getUint32(position, littleEndian);
  const entries = get16(ifdOffset);
  const values = new Map<number, string | number | number[]>();

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

function readExifValue(view: DataView, offset: number, type: number, count: number, littleEndian: boolean) {
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

function typeSize(type: number) {
  if (type === 1 || type === 2 || type === 7) {
    return 1;
  }

  if (type === 3) {
    return 2;
  }

  if (type === 4 || type === 9) {
    return 4;
  }

  if (type === 5 || type === 10) {
    return 8;
  }

  return 1;
}

function readAscii(view: DataView, offset: number, length: number) {
  let output = "";
  for (let index = 0; index < length && offset + index < view.byteLength; index += 1) {
    output += String.fromCharCode(view.getUint8(offset + index));
  }
  return output;
}

function parseExifDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const match = /^(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/.exec(value);
  if (!match) {
    return undefined;
  }

  const [, year, month, day, hour, minute, second] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)).toISOString();
}

function checkMimeExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const type = file.type.toLowerCase();

  if (!extension || !type) {
    return true;
  }

  const expected: Record<string, string[]> = {
    jpg: ["image/jpeg"],
    jpeg: ["image/jpeg"],
    png: ["image/png"],
    webp: ["image/webp"],
    heic: ["image/heic", "image/heif"],
    heif: ["image/heif", "image/heic"],
  };

  return expected[extension]?.includes(type) ?? type.startsWith("image/");
}

function readImageDimensions(file: File): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve({});
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function numberValue(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
