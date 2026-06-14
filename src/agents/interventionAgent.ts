import { llmCall } from "./llmClient";
import type { AgentAction, Intervention, WardForecast } from "./types";
import { makeAction } from "./grievanceAgent";

export async function scanForInterventions(
  forecasts: WardForecast[],
  nowIso: string,
): Promise<{ interventions: Intervention[]; actions: AgentAction[] }> {
  const interventions: Intervention[] = [];
  const actions: AgentAction[] = [];

  for (const forecast of forecasts) {
    const earlyWindow = forecast.forecast7day.slice(0, 3);
    const maxValue = Math.max(...earlyWindow);
    const triggerIndex = earlyWindow.findIndex((value) => value === maxValue);

    if (maxValue <= 200 && forecast.trend !== "critical") {
      continue;
    }

    const prompt = `Ward ${forecast.wardName} AQI forecast shows ${maxValue} on day ${triggerIndex + 1} (currently ${forecast.currentAQI}). Propose 2-3 immediate civic actions to mitigate (e.g. dust control, traffic diversion, public advisory). Respond as a short bulleted list.`;
    const response = await llmCall(prompt);
    const proposedActions = response
      .split("\n")
      .map((line) => line.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean);

    const intervention: Intervention = {
      id: crypto.randomUUID(),
      wardId: forecast.wardId,
      wardName: forecast.wardName,
      triggerAQI: maxValue,
      triggerDay: triggerIndex + 1,
      proposedActions,
      status: "proposed",
      createdAt: nowIso,
    };

    interventions.push(intervention);
    actions.push(
      makeAction(
        {
          agent: "intervention",
          wardId: forecast.wardId,
          actionType: "intervention_proposed",
          detail: `${forecast.wardName}: AQI ${maxValue} projected within ${triggerIndex + 1} day(s). Mitigation plan generated.`,
          payload: { interventionId: intervention.id, proposedActions },
        },
        nowIso,
      ),
    );
  }

  return { interventions, actions };
}
