import { Assignment } from "../types.ts";

export function gradeCalc(c: Assignment[]) {
    const uniqueWeights = new Set(c.map((a) => a.weight));
    const totalWeight = Array.from(uniqueWeights).reduce((a, b) => a + b, 0);
    const weightedGrades = c.map((a) => a.grade * (a.weight / totalWeight));
    const finalGrade = weightedGrades.reduce((a, b) => a + b, 0);
    return finalGrade;
    
}