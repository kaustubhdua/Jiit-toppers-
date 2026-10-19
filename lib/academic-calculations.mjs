/** Pure, dependency-free academic planning calculations.
 * Outputs are estimates, never official JIIT records.
 */

function isValidCount(value) {
  return Number.isInteger(value) && value >= 0;
}

function isValidTarget(value) {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

function weightedGradeAverage(credits, gradePoints) {
  if (!Array.isArray(credits) || !Array.isArray(gradePoints) || credits.length === 0 || credits.length !== gradePoints.length) return null;
  if (credits.some((credit) => !Number.isFinite(credit) || credit <= 0) || gradePoints.some((grade) => !Number.isFinite(grade) || grade < 0 || grade > 10)) return null;
  const totalCredits = credits.reduce((sum, credit) => sum + credit, 0);
  if (!Number.isFinite(totalCredits) || totalCredits <= 0) return null;
  const weightedPoints = gradePoints.reduce((sum, grade, index) => sum + grade * credits[index], 0);
  return Number.isFinite(weightedPoints) ? weightedPoints / totalCredits : null;
}

/**
 * Calculates current attendance and the number of consecutive classes needed
 * to reach a target, assuming every future class is attended.
 */
export function calculateAttendance({ held, attended, target }) {
  if (!isValidCount(held) || !isValidCount(attended) || attended > held || !isValidTarget(target)) {
    return { valid: false, percentage: null, classesNeeded: null };
  }
  const percentage = held === 0 ? null : (attended / held) * 100;
  const classesNeeded = target === 100
    ? (attended === held ? 0 : null)
    : Math.max(0, Math.ceil((target * held - 100 * attended) / (100 - target)));
  return { valid: true, percentage, classesNeeded };
}

/**
 * Forecasts attendance after a specified number of upcoming classes.
 * maxClassesToSkip is null when the target cannot be maintained even by
 * attending every upcoming class. Otherwise it is an integer from 0 to
 * futureClasses. This is a mathematical estimate, not a university rule.
 */
export function calculateAttendanceForecast({ held, attended, target, futureClasses }) {
  if (!isValidCount(held) || !isValidCount(attended) || attended > held || !isValidTarget(target) || !isValidCount(futureClasses)) {
    return { valid: false, projectedPercentage: null, maxClassesToSkip: null, classesToAttend: null };
  }

  const totalAfter = held + futureClasses;
  if (futureClasses === 0) {
    return {
      valid: true,
      projectedPercentage: held === 0 ? null : (attended / held) * 100,
      maxClassesToSkip: held === 0 || (attended / held) * 100 >= target ? 0 : null,
      classesToAttend: 0,
    };
  }

  const minimumAttendanceCount = Math.ceil((target / 100) * totalAfter - Number.EPSILON);
  const classesToAttend = Math.max(0, minimumAttendanceCount - attended);
  const canReachTarget = classesToAttend <= futureClasses;
  const maxClassesToSkip = canReachTarget
    ? Math.max(0, Math.min(futureClasses, futureClasses - classesToAttend))
    : null;

  return {
    valid: true,
    projectedPercentage: (attended / totalAfter) * 100,
    maxClassesToSkip,
    classesToAttend: canReachTarget ? classesToAttend : null,
  };
}

/** Credit-weighted semester grade-point average (SGPA) estimate. */
export function calculateSgpa(credits, grades) {
  return weightedGradeAverage(credits, grades);
}

/** Credit-weighted cumulative grade-point average (CGPA) estimate.
 * Pass all included course/term credits and grade points; follow the grading
 * rules applicable to the student's programme before treating it as official.
 */
export function calculateCgpa(credits, gradePoints) {
  return weightedGradeAverage(credits, gradePoints);
}
