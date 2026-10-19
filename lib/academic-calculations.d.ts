export type AttendanceCalculation = { valid: boolean; percentage: number | null; classesNeeded: number | null };
export type AttendanceForecast = { valid: boolean; projectedPercentage: number | null; maxClassesToSkip: number | null; classesToAttend: number | null };

export function calculateAttendance(input: { held: number; attended: number; target: number }): AttendanceCalculation;
export function calculateAttendanceForecast(input: { held: number; attended: number; target: number; futureClasses: number }): AttendanceForecast;
export function calculateSgpa(credits: number[], grades: number[]): number | null;
export function calculateCgpa(credits: number[], gradePoints: number[]): number | null;
