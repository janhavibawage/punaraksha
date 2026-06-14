import { all, run } from "./db.js";

export function getState() {
  return {
    grievances: all("SELECT * FROM grievances ORDER BY timestamp DESC").map(mapGrievance),
    actions: all("SELECT * FROM actions ORDER BY timestamp DESC").map(mapAction),
    interventions: all("SELECT * FROM interventions ORDER BY created_at DESC").map(mapIntervention),
  };
}

export function getStateForUser(user) {
  if (!user || user.role === "admin" || user.role === "officer") {
    return getState();
  }

  return {
    grievances: all("SELECT * FROM grievances WHERE user_id = ? ORDER BY timestamp DESC", [user.id]).map(mapGrievance),
    actions: all(
      `SELECT actions.* FROM actions
       INNER JOIN grievances ON grievances.id = actions.grievance_id
       WHERE grievances.user_id = ?
       ORDER BY actions.timestamp DESC`,
      [user.id],
    ).map(mapAction),
    interventions: [],
  };
}

export function insertGrievance(grievance) {
  run(
    `INSERT INTO grievances (
      id, user_id, text, ward_id, timestamp, category, severity, confidence, assigned_to,
      status, sla_deadline, notice_draft, evidence_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      grievance.id,
      grievance.userId ?? null,
      grievance.text,
      grievance.wardId,
      grievance.timestamp,
      grievance.category,
      grievance.severity,
      grievance.confidence,
      grievance.assignedTo,
      grievance.status,
      grievance.slaDeadline,
      grievance.noticeDraft,
      JSON.stringify(grievance.evidence ?? null),
    ],
  );
}

export function updateGrievanceStatus(id, status) {
  run("UPDATE grievances SET status = ? WHERE id = ?", [status, id]);
}

export function deleteGrievance(id) {
  run("DELETE FROM actions WHERE grievance_id = ?", [id]);
  run("DELETE FROM grievances WHERE id = ?", [id]);
}

export function insertAction(action) {
  run(
    `INSERT INTO actions (
      id, timestamp, agent, grievance_id, ward_id, action_type, detail, payload_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      action.id,
      action.timestamp,
      action.agent,
      action.grievanceId ?? null,
      action.wardId ?? null,
      action.actionType,
      action.detail,
      JSON.stringify(action.payload ?? null),
    ],
  );
}

export function insertIntervention(intervention) {
  run(
    `INSERT INTO interventions (
      id, ward_id, ward_name, trigger_aqi, trigger_day, proposed_actions_json, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      intervention.id,
      intervention.wardId,
      intervention.wardName,
      intervention.triggerAQI,
      intervention.triggerDay,
      JSON.stringify(intervention.proposedActions),
      intervention.status,
      intervention.createdAt,
    ],
  );
}

export function updateInterventionStatus(id, status) {
  run("UPDATE interventions SET status = ? WHERE id = ?", [status, id]);
}

export function interventionExistsForWard(wardId) {
  return all("SELECT id FROM interventions WHERE ward_id = ? LIMIT 1", [wardId]).length > 0;
}

export function resetAll() {
  run("DELETE FROM grievances");
  run("DELETE FROM actions");
  run("DELETE FROM interventions");
}

export function canAccessEvidence(user, storedFileName) {
  if (!storedFileName || !user) {
    return false;
  }

  if (user.role === "admin" || user.role === "officer") {
    return true;
  }

  const rows = all("SELECT evidence_json FROM grievances WHERE user_id = ?", [user.id]);
  return rows.some((row) => {
    const evidence = parseJson(row.evidence_json);
    return evidence?.storedFileName === storedFileName;
  });
}

function mapGrievance(row) {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    text: row.text,
    wardId: row.ward_id,
    timestamp: row.timestamp,
    category: row.category ?? undefined,
    severity: row.severity ?? undefined,
    confidence: row.confidence ?? undefined,
    assignedTo: row.assigned_to ?? undefined,
    status: row.status,
    slaDeadline: row.sla_deadline ?? undefined,
    noticeDraft: row.notice_draft ?? undefined,
    evidence: parseJson(row.evidence_json) ?? undefined,
  };
}

function mapAction(row) {
  return {
    id: row.id,
    timestamp: row.timestamp,
    agent: row.agent,
    grievanceId: row.grievance_id ?? undefined,
    wardId: row.ward_id ?? undefined,
    actionType: row.action_type,
    detail: row.detail,
    payload: parseJson(row.payload_json) ?? undefined,
  };
}

function mapIntervention(row) {
  return {
    id: row.id,
    wardId: row.ward_id,
    wardName: row.ward_name,
    triggerAQI: row.trigger_aqi,
    triggerDay: row.trigger_day,
    proposedActions: parseJson(row.proposed_actions_json) ?? [],
    status: row.status,
    createdAt: row.created_at,
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
