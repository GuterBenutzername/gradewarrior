import { Assignment } from "../types.ts";

export function gradeCalc(c: Assignment[]) {
  if (c.length === 0) return 0;
  let weightedSum = 0;
  let totalWeight = 0;
  for (const assignment of c) {
    weightedSum += assignment.grade * assignment.weight;
    totalWeight += assignment.weight;
  }
  if (totalWeight === 0) return 0;
  return weightedSum / totalWeight;
}
