import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Bot, Camera, FastForward, Loader2, Play, RefreshCcw, Send, Square } from "lucide-react";
import type { EvidenceAnalysis } from "../agents/types";
import { EvidenceForensicsCard } from "../components/agents/EvidenceForensicsCard";
import { AgentTimeline } from "../components/agents/AgentTimeline";
import { GrievanceCard } from "../components/agents/GrievanceCard";
import { InterventionCard } from "../components/agents/InterventionCard";
import { sampleComplaints, wards } from "../data/mock";
import { useGrievanceStore } from "../store/useGrievanceStore";
import { analyzeEvidenceImage } from "../utils/imageForensics";

export function AgentsPage() {
  const [text, setText] = useState(sampleComplaints[0].text);
  const [wardId, setWardId] = useState(sampleComplaints[0].wardId);
  const [autoplay, setAutoplay] = useState(false);
  const [evidence, setEvidence] = useState<EvidenceAnalysis | undefined>();
  const [evidenceFile, setEvidenceFile] = useState<File | undefined>();
  const [evidenceError, setEvidenceError] = useState("");
  const [isAnalyzingEvidence, setIsAnalyzingEvidence] = useState(false);

  const grievances = useGrievanceStore((state) => state.grievances);
  const actions = useGrievanceStore((state) => state.actions);
  const interventions = useGrievanceStore((state) => state.interventions);
  const simulatedNow = useGrievanceStore((state) => state.simulatedNow);
  const isProcessing = useGrievanceStore((state) => state.isProcessing);
  const loadBackendState = useGrievanceStore((state) => state.loadBackendState);
  const submitComplaint = useGrievanceStore((state) => state.submitComplaint);
  const feedSampleComplaint = useGrievanceStore((state) => state.feedSampleComplaint);
  const advanceSimulation = useGrievanceStore((state) => state.advanceSimulation);
  const scanInterventions = useGrievanceStore((state) => state.scanInterventions);
  const notifyIntervention = useGrievanceStore((state) => state.notifyIntervention);
  const resolveGrievance = useGrievanceStore((state) => state.resolveGrievance);
  const resetDemo = useGrievanceStore((state) => state.resetDemo);

  useEffect(() => {
    void loadBackendState();
    void scanInterventions();
  }, [loadBackendState, scanInterventions]);

  useEffect(() => {
    const clock = window.setInterval(() => {
      useGrievanceStore.getState().tickRealTime();
    }, 1000);

    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    if (!autoplay) {
      return undefined;
    }

    const feeder = window.setInterval(() => {
      const state = useGrievanceStore.getState();
      if (!state.isProcessing) {
        void state.feedSampleComplaint();
      }
    }, 5600);

    return () => window.clearInterval(feeder);
  }, [autoplay]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim()) {
      return;
    }

    await submitComplaint(text, wardId, evidence, evidenceFile);
    setEvidence(undefined);
    setEvidenceFile(undefined);
    setEvidenceError("");
  }

  async function handleEvidenceChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setEvidenceError("Please select an image file.");
      return;
    }

    setIsAnalyzingEvidence(true);
    setEvidenceError("");

    try {
      const result = await analyzeEvidenceImage(file);
      setEvidence(result);
      setEvidenceFile(file);
    } catch {
      setEvidenceError("Could not read image metadata from this file.");
    } finally {
      setIsAnalyzingEvidence(false);
      event.target.value = "";
    }
  }

  function clearEvidence() {
    if (evidence?.previewUrl) {
      URL.revokeObjectURL(evidence.previewUrl);
    }
    setEvidence(undefined);
    setEvidenceFile(undefined);
    setEvidenceError("");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-civic">
            <Bot className="h-4 w-4" aria-hidden="true" />
            Autonomous response workspace
          </div>
          <h1 className="mt-2 text-4xl font-semibold text-slate-950">Agentic civic action loop</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Complaints become classified cases, routed notices, SLA timers, escalations, and AQI interventions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAutoplay((value) => !value)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-civic hover:text-civic"
          >
            {autoplay ? <Square className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            {autoplay ? "Stop demo" : "Autoplay demo"}
          </button>
          <button
            type="button"
            onClick={() => advanceSimulation(25)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-amber-400 hover:text-amber-700"
          >
            <FastForward className="h-4 w-4" aria-hidden="true" />
            Simulate 25h
          </button>
          <button
            type="button"
            onClick={resetDemo}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.82fr_1.15fr_0.9fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">File a Complaint</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Complaint</span>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                className="mt-2 min-h-40 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-civic focus:bg-white focus:ring-4 focus:ring-teal-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Ward</span>
              <select
                value={wardId}
                onChange={(event) => setWardId(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-civic focus:bg-white focus:ring-4 focus:ring-teal-100"
              >
                {wards.map((ward) => (
                  <option key={ward.wardId} value={ward.wardId}>
                    {ward.wardName} ({ward.wardId})
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Evidence photo</span>
              <span className="mt-2 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition hover:border-civic hover:bg-white hover:text-civic">
                {isAnalyzingEvidence ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Camera className="h-4 w-4" aria-hidden="true" />
                )}
                {isAnalyzingEvidence ? "Checking metadata" : "Take or upload image"}
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(event) => void handleEvidenceChange(event)}
                className="sr-only"
              />
            </label>

            {evidenceError ? (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{evidenceError}</p>
            ) : null}

            {evidence ? <EvidenceForensicsCard analysis={evidence} onClear={clearEvidence} /> : null}

            <button
              type="submit"
              disabled={isProcessing}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-civic px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-wait disabled:bg-slate-300"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {isProcessing ? "Agent working" : "Submit Complaint"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => void feedSampleComplaint()}
            disabled={isProcessing}
            className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-civic hover:text-civic disabled:cursor-wait disabled:opacity-50"
          >
            Load Sample Complaint
          </button>
        </section>

        <section className="min-h-[520px] rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Active Grievances</h2>
              <p className="text-sm text-slate-500">{grievances.length} cases in this demo session</p>
            </div>
            <button
              type="button"
              onClick={() => void scanInterventions()}
              className="min-h-10 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-civic"
            >
              Scan AQI
            </button>
          </div>

          {grievances.length === 0 ? (
            <div className="flex min-h-[410px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              Submit a complaint or load a sample to start the agent pipeline.
            </div>
          ) : (
            <div className="space-y-4">
              {grievances.map((grievance) => (
                <GrievanceCard
                  key={grievance.id}
                  grievance={grievance}
                  now={simulatedNow}
                  onResolve={resolveGrievance}
                />
              ))}
            </div>
          )}
        </section>

        <AgentTimeline actions={actions} />
      </div>

      <section className="mt-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Predictive Interventions</h2>
            <p className="mt-1 text-sm text-slate-500">Preventive action plans for AQI spikes in the next three days.</p>
          </div>
        </div>
        {interventions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
            No intervention triggers are active.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {interventions.map((intervention) => (
              <InterventionCard key={intervention.id} intervention={intervention} onNotify={notifyIntervention} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
