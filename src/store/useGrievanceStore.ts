import { create } from "zustand";
import { sampleComplaints, wardForecasts } from "../data/mock";
import {
  classifyGrievance,
  draftNotice,
  getSlaDeadline,
  getSlaHours,
  makeAction,
  routeGrievance,
} from "../agents/grievanceAgent";
import { scanForInterventions } from "../agents/interventionAgent";
import type { AgentAction, EvidenceAnalysis, Grievance, Intervention } from "../agents/types";
import {
  createBackendGrievance,
  fetchBackendState,
  notifyBackendIntervention,
  resetBackendDemo,
  scanBackendInterventions,
  updateBackendGrievanceStatus,
} from "../services/api";

interface GrievanceState {
  grievances: Grievance[];
  actions: AgentAction[];
  interventions: Intervention[];
  simulatedNow: string;
  isProcessing: boolean;
  sampleIndex: number;
  loadBackendState: () => Promise<void>;
  submitComplaint: (text: string, wardId: string, evidence?: EvidenceAnalysis, evidenceFile?: File) => Promise<void>;
  feedSampleComplaint: () => Promise<void>;
  tickRealTime: () => void;
  advanceSimulation: (hours: number) => void;
  checkEscalations: () => void;
  scanInterventions: () => Promise<void>;
  notifyIntervention: (interventionId: string) => void;
  resolveGrievance: (grievanceId: string) => void;
  resetDemo: () => void;
}

const initialNow = new Date().toISOString();

export const useGrievanceStore = create<GrievanceState>((set, get) => ({
  grievances: [],
  actions: [],
  interventions: [],
  simulatedNow: initialNow,
  isProcessing: false,
  sampleIndex: 0,

  loadBackendState: async () => {
    try {
      const state = await fetchBackendState();
      set({
        grievances: state.grievances,
        actions: state.actions,
        interventions: state.interventions,
      });
    } catch {
      // The app can still run offline with the local demo store.
    }
  },

  submitComplaint: async (text, wardId, evidence, evidenceFile) => {
    set({ isProcessing: true });

    try {
      const state = await createBackendGrievance({
        text,
        wardId,
        evidence,
        evidenceFile,
      });
      set({
        grievances: state.grievances,
        actions: state.actions,
        interventions: state.interventions,
        isProcessing: false,
      });
      return;
    } catch {
      // Fall back to browser-only processing if the API is not running.
    }

    const now = new Date().toISOString();
    const grievance: Grievance = {
      id: crypto.randomUUID(),
      text: text.trim(),
      wardId,
      timestamp: now,
      evidence,
      status: "new",
    };

    set((state) => ({
      grievances: [grievance, ...state.grievances],
      actions: evidence
        ? [
            makeAction(
              {
                agent: "grievance",
                grievanceId: grievance.id,
                wardId,
                actionType: "evidence_checked",
                detail: `Evidence metadata checked: ${evidence.authenticityScore}/100, ${evidence.verdict.replace("_", " ")}.`,
                payload: {
                  authenticityScore: evidence.authenticityScore,
                  verdict: evidence.verdict,
                  exifFound: evidence.exifFound,
                  gpsPresent: evidence.gpsPresent,
                },
              },
              now,
            ),
            ...state.actions,
          ]
        : state.actions,
    }));

    const classification = await classifyGrievance(grievance);
    const classifiedAt = new Date().toISOString();

    set((state) => ({
      grievances: state.grievances.map((item) =>
        item.id === grievance.id
          ? {
              ...item,
              ...classification,
              status: "triaged",
            }
          : item,
      ),
      actions: [
        makeAction(
          {
            agent: "grievance",
            grievanceId: grievance.id,
            wardId,
            actionType: "classified",
            detail: `Complaint classified as ${classification.category.replace("_", " ")} with ${classification.severity} severity (${Math.round(
              classification.confidence * 100,
            )}% confidence).`,
            payload: { ...classification },
          },
          classifiedAt,
        ),
        ...state.actions,
      ],
    }));

    const assignedTo = routeGrievance(classification.category, wardId);
    const routedAt = new Date().toISOString();

    set((state) => ({
      grievances: state.grievances.map((item) =>
        item.id === grievance.id
          ? {
              ...item,
              assignedTo,
            }
          : item,
      ),
      actions: [
        makeAction(
          {
            agent: "grievance",
            grievanceId: grievance.id,
            wardId,
            actionType: "routed",
            detail: `Routed to ${assignedTo}.`,
            payload: { assignedTo },
          },
          routedAt,
        ),
        ...state.actions,
      ],
    }));

    const current = get().grievances.find((item) => item.id === grievance.id);
    if (!current?.severity) {
      set({ isProcessing: false });
      return;
    }

    const severity = current.severity;
    const slaHours = getSlaHours(severity);
    const noticeDraft = await draftNotice(current, assignedTo, slaHours);
    const noticeAt = new Date().toISOString();
    const slaDeadline = getSlaDeadline(new Date(noticeAt), severity);

    set((state) => ({
      grievances: state.grievances.map((item) =>
        item.id === grievance.id
          ? {
              ...item,
              noticeDraft,
              slaDeadline,
              status: "notified",
            }
          : item,
      ),
      actions: [
        makeAction(
          {
            agent: "grievance",
            grievanceId: grievance.id,
            wardId,
            actionType: "sla_set",
            detail: `${severity.toUpperCase()} SLA set for ${slaHours} hour(s).`,
            payload: { slaHours, slaDeadline },
          },
          noticeAt,
        ),
        makeAction(
          {
            agent: "grievance",
            grievanceId: grievance.id,
            wardId,
            actionType: "notice_drafted",
            detail: `Formal notice drafted for ${assignedTo}.`,
            payload: { noticeDraft },
          },
          noticeAt,
        ),
        ...state.actions,
      ],
      isProcessing: false,
    }));
  },

  feedSampleComplaint: async () => {
    const state = get();
    const sample = sampleComplaints[state.sampleIndex % sampleComplaints.length];
    set({ sampleIndex: state.sampleIndex + 1 });
    await get().submitComplaint(sample.text, sample.wardId);
  },

  tickRealTime: () => {
    set({ simulatedNow: new Date().toISOString() });
    get().checkEscalations();
  },

  advanceSimulation: (hours) => {
    const next = new Date(get().simulatedNow);
    next.setHours(next.getHours() + hours);
    set({ simulatedNow: next.toISOString() });
    get().checkEscalations();
  },

  checkEscalations: () => {
    const now = new Date(get().simulatedNow).getTime();
    const breached = get().grievances.filter((grievance) => {
      return (
        grievance.status === "notified" &&
        grievance.slaDeadline &&
        new Date(grievance.slaDeadline).getTime() <= now
      );
    });

    if (breached.length === 0) {
      return;
    }

    const escalationActions = breached.map((grievance) =>
      makeAction(
        {
          agent: "grievance",
          grievanceId: grievance.id,
          wardId: grievance.wardId,
          actionType: "escalated",
          detail: `SLA breached for ${grievance.assignedTo}. Escalated to Assistant Municipal Commissioner.`,
          payload: { nextAuthority: "Assistant Municipal Commissioner" },
        },
        get().simulatedNow,
      ),
    );

    set((state) => ({
      grievances: state.grievances.map((grievance) =>
        breached.some((item) => item.id === grievance.id)
          ? {
              ...grievance,
              status: "escalated",
            }
          : grievance,
      ),
      actions: [...escalationActions, ...state.actions],
    }));
  },

  scanInterventions: async () => {
    try {
      const state = await scanBackendInterventions();
      set({
        grievances: state.grievances,
        actions: state.actions,
        interventions: state.interventions,
      });
      return;
    } catch {
      // The local scanner keeps the page useful during frontend-only demos.
    }

    const knownWardIds = new Set(get().interventions.map((intervention) => intervention.wardId));
    const candidates = wardForecasts.filter((forecast) => !knownWardIds.has(forecast.wardId));
    const { interventions, actions } = await scanForInterventions(candidates, get().simulatedNow);

    if (interventions.length === 0) {
      return;
    }

    set((state) => ({
      interventions: [...interventions, ...state.interventions],
      actions: [...actions.reverse(), ...state.actions],
    }));
  },

  notifyIntervention: (interventionId) => {
    void notifyBackendIntervention(interventionId)
      .then((state) =>
        set({
          grievances: state.grievances,
          actions: state.actions,
          interventions: state.interventions,
        }),
      )
      .catch(() => undefined);

    const intervention = get().interventions.find((item) => item.id === interventionId);
    if (!intervention) {
      return;
    }

    set((state) => ({
      interventions: state.interventions.map((item) =>
        item.id === interventionId
          ? {
              ...item,
              status: "notified",
            }
          : item,
      ),
      actions: [
        makeAction(
          {
            agent: "intervention",
            wardId: intervention.wardId,
            actionType: "officer_notified",
            detail: `${intervention.wardName} ward officer notified about preventive AQI actions.`,
            payload: { interventionId },
          },
          state.simulatedNow,
        ),
        ...state.actions,
      ],
    }));
  },

  resolveGrievance: (grievanceId) => {
    void updateBackendGrievanceStatus(grievanceId, "resolved")
      .then((state) =>
        set({
          grievances: state.grievances,
          actions: state.actions,
          interventions: state.interventions,
        }),
      )
      .catch(() => undefined);

    set((state) => ({
      grievances: state.grievances.map((grievance) =>
        grievance.id === grievanceId
          ? {
              ...grievance,
              status: "resolved",
            }
          : grievance,
      ),
    }));
  },

  resetDemo: () => {
    void resetBackendDemo()
      .then((state) =>
        set({
          grievances: state.grievances,
          actions: state.actions,
          interventions: state.interventions,
        }),
      )
      .catch(() => undefined);

    set({
      grievances: [],
      actions: [],
      interventions: [],
      simulatedNow: new Date().toISOString(),
      isProcessing: false,
      sampleIndex: 0,
    });
  },
}));
