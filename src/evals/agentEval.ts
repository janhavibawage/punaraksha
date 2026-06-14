import { routeGrievance } from "../agents/grievanceAgent";
import type { GrievanceCategory } from "../agents/types";
import { labeledComplaints } from "./evalData";

export interface AgentCategoryAccuracy {
  category: GrievanceCategory;
  accuracy: number;
  total: number;
}

export interface AgentEvalResult {
  overallAccuracy: number;
  total: number;
  byCategory: AgentCategoryAccuracy[];
}

export function runAgentEval(): AgentEvalResult {
  const rows = labeledComplaints.map((entry) => {
    const assignedDepartment = routeGrievance(entry.trueCategory, entry.wardId);
    return {
      ...entry,
      assignedDepartment,
      correct: assignedDepartment === entry.correctDepartment,
    };
  });

  const categories = Array.from(new Set(labeledComplaints.map((entry) => entry.trueCategory)));
  const byCategory = categories.map((category) => {
    const categoryRows = rows.filter((row) => row.trueCategory === category);
    const correct = categoryRows.filter((row) => row.correct).length;
    return {
      category,
      accuracy: correct / categoryRows.length,
      total: categoryRows.length,
    };
  });

  return {
    overallAccuracy: rows.filter((row) => row.correct).length / rows.length,
    total: rows.length,
    byCategory,
  };
}
