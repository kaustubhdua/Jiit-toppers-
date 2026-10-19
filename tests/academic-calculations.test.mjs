import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateAttendance, calculateAttendanceForecast, calculateCgpa, calculateSgpa } from '../lib/academic-calculations.mjs';

test('attendance percentage and consecutive classes are calculated', () => {
  assert.deepEqual(calculateAttendance({ held: 10, attended: 6, target: 75 }), { valid: true, percentage: 60, classesNeeded: 6 });
});
test('attendance handles a target already met', () => {
  assert.equal(calculateAttendance({ held: 4, attended: 4, target: 75 }).classesNeeded, 0);
});
test('attendance handles 100 percent target', () => {
  assert.equal(calculateAttendance({ held: 4, attended: 3, target: 100 }).classesNeeded, null);
  assert.equal(calculateAttendance({ held: 4, attended: 4, target: 100 }).classesNeeded, 0);
});
test('attendance rejects invalid counts and targets', () => {
  for (const input of [{ held: 2, attended: 3, target: 75 }, { held: -1, attended: 0, target: 75 }, { held: 2.5, attended: 1, target: 75 }, { held: 2, attended: 1, target: 101 }]) {
    assert.equal(calculateAttendance(input).valid, false);
  }
});
test('SGPA uses credit-weighted grade points', () => {
  assert.equal(calculateSgpa([4, 3, 3, 2], [9, 8, 8, 10]), 8.666666666666666);
});
test('CGPA uses credit-weighted points across included courses', () => {
  assert.equal(calculateCgpa([20, 22], [8.2, 9]), 8.619047619047619);
});
test('grade averages reject mismatched, empty, or invalid inputs', () => {
  for (const calculate of [calculateSgpa, calculateCgpa]) {
    assert.equal(calculate([], []), null);
    assert.equal(calculate([3], [8, 9]), null);
    assert.equal(calculate([0], [8]), null);
    assert.equal(calculate([3], [11]), null);
    assert.equal(calculate([-1], [8]), null);
  }
});
test('attendance forecast calculates maximum absences while maintaining target', () => {
  assert.deepEqual(calculateAttendanceForecast({ held: 20, attended: 16, target: 75, futureClasses: 8 }), {
    valid: true, projectedPercentage: 57.14285714285714, maxClassesToSkip: 3, classesToAttend: 5,
  });
  assert.equal(calculateAttendanceForecast({ held: 20, attended: 18, target: 75, futureClasses: 8 }).maxClassesToSkip, 5);
});
test('attendance forecast handles 100 percent, no upcoming classes, and impossible targets', () => {
  assert.equal(calculateAttendanceForecast({ held: 4, attended: 4, target: 100, futureClasses: 3 }).maxClassesToSkip, 0);
  assert.equal(calculateAttendanceForecast({ held: 4, attended: 2, target: 90, futureClasses: 1 }).maxClassesToSkip, null);
  assert.equal(calculateAttendanceForecast({ held: 0, attended: 0, target: 75, futureClasses: 0 }).projectedPercentage, null);
});
test('attendance forecast rejects invalid inputs', () => {
  assert.equal(calculateAttendanceForecast({ held: 3, attended: 4, target: 75, futureClasses: 2 }).valid, false);
  assert.equal(calculateAttendanceForecast({ held: 3, attended: 2, target: 75, futureClasses: -1 }).valid, false);
});
