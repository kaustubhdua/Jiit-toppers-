'use client';

import { useMemo, useState } from 'react';
import { calculateAttendance, calculateAttendanceForecast, calculateCgpa, calculateSgpa } from '../lib/academic-calculations.mjs';

function parseNumbers(value: string) {
  if (!value.trim()) return [];
  return value.split(',').map(item => item.trim() === '' ? Number.NaN : Number(item.trim()));
}

export function AcademicCalculators() {
  const [held, setHeld] = useState('0');
  const [attended, setAttended] = useState('0');
  const [target, setTarget] = useState('75');
  const [futureClasses, setFutureClasses] = useState('8');
  const [semesterCredits, setSemesterCredits] = useState('');
  const [semesterGrades, setSemesterGrades] = useState('');
  const [cumulativeCredits, setCumulativeCredits] = useState('');
  const [cumulativeGrades, setCumulativeGrades] = useState('');

  const attendance = useMemo(
    () => calculateAttendance({
      held: held.trim() === '' ? Number.NaN : Number(held),
      attended: attended.trim() === '' ? Number.NaN : Number(attended),
      target: target.trim() === '' ? Number.NaN : Number(target),
    }),
    [held, attended, target],
  );
  const forecast = useMemo(
    () => calculateAttendanceForecast({
      held: held.trim() === '' ? Number.NaN : Number(held),
      attended: attended.trim() === '' ? Number.NaN : Number(attended),
      target: target.trim() === '' ? Number.NaN : Number(target),
      futureClasses: futureClasses.trim() === '' ? Number.NaN : Number(futureClasses),
    }),
    [held, attended, target, futureClasses],
  );
  const parsedSemesterCredits = useMemo(() => parseNumbers(semesterCredits), [semesterCredits]);
  const parsedSemesterGrades = useMemo(() => parseNumbers(semesterGrades), [semesterGrades]);
  const parsedCumulativeCredits = useMemo(() => parseNumbers(cumulativeCredits), [cumulativeCredits]);
  const parsedCumulativeGrades = useMemo(() => parseNumbers(cumulativeGrades), [cumulativeGrades]);
  const sgpa = useMemo(() => calculateSgpa(parsedSemesterCredits, parsedSemesterGrades), [parsedSemesterCredits, parsedSemesterGrades]);
  const cgpa = useMemo(() => calculateCgpa(parsedCumulativeCredits, parsedCumulativeGrades), [parsedCumulativeCredits, parsedCumulativeGrades]);

  return <section className="jt-calculators" aria-labelledby="academic-tools-title">
    <span className="jt-kicker">PERSONAL PLANNING TOOLS</span><h2 id="academic-tools-title">Academic calculators</h2>
    <p className="jt-lead">These tools calculate estimates from your inputs. They are not connected to JIIT records and do not represent official attendance or grades. Confirm the grading rules that apply to your programme.</p>
    <div className="jt-grid jt-two">
      <article className="jt-card"><h3>Attendance planner</h3><p>Estimate consecutive classes needed to reach your target, or how many upcoming classes you could miss while maintaining it.</p>
        <div className="jt-form-grid">
          <label>Classes held<input type="number" min="0" step="1" value={held} onChange={event => setHeld(event.target.value)} /></label>
          <label>Classes attended<input type="number" min="0" step="1" value={attended} onChange={event => setAttended(event.target.value)} /></label>
          <label>Target (%)<input type="number" min="0" max="100" step="0.1" value={target} onChange={event => setTarget(event.target.value)} /></label>
          <label>Upcoming classes<input type="number" min="0" step="1" value={futureClasses} onChange={event => setFutureClasses(event.target.value)} /></label>
        </div>
        <p className="jt-result" aria-live="polite">{!attendance.valid ? 'Enter whole-number class counts and a target from 0 to 100.' : attendance.percentage === null ? 'Enter classes held to calculate current attendance.' : 'Current attendance: ' + attendance.percentage.toFixed(1) + '%'}</p>
        {attendance.valid && attendance.percentage !== null && <p>{attendance.classesNeeded === null ? 'A 100% target requires attending every future class.' : attendance.classesNeeded === 0 ? 'You currently meet your target.' : 'Attend the next ' + attendance.classesNeeded + ' consecutive classes to reach your target.'}</p>}
        {forecast.valid && forecast.maxClassesToSkip !== null && <p className="jt-result">{forecast.maxClassesToSkip === 0 ? 'Attend all upcoming classes to maintain your target.' : 'You could miss up to ' + forecast.maxClassesToSkip + ' of the next ' + futureClasses + ' classes and still meet your target.'}</p>}
        {forecast.valid && forecast.maxClassesToSkip === null && <p role="status">Your target cannot be reached over this forecast window, even if you attend every upcoming class.</p>}
        {!attendance.valid && <p role="alert">Check that attended classes do not exceed classes held and all values are valid.</p>}
      </article>
      <article className="jt-card"><h3>SGPA estimator</h3><p>Enter comma-separated course credits and matching grade points for one semester.</p>
        <div className="jt-form-grid"><label>Course credits<input value={semesterCredits} onChange={event => setSemesterCredits(event.target.value)} placeholder="e.g. 4,3,3,2" /></label><label>Grade points<input value={semesterGrades} onChange={event => setSemesterGrades(event.target.value)} placeholder="e.g. 9,8,8,10" /></label></div>
        <small>Use positive credits and grade points from 0 to 10. Both lists must contain the same number of values.</small>
        <p className="jt-result" aria-live="polite">{sgpa === null ? 'Enter matching credits and grade points to calculate an estimate.' : 'Estimated SGPA: ' + sgpa.toFixed(2)}</p>
      </article>
      <article className="jt-card"><h3>CGPA estimator</h3><p>Enter all included courses across completed semesters. The calculation is credit-weighted.</p>
        <div className="jt-form-grid"><label>Cumulative course credits<input value={cumulativeCredits} onChange={event => setCumulativeCredits(event.target.value)} placeholder="e.g. 20,22,21" /></label><label>Cumulative grade points<input value={cumulativeGrades} onChange={event => setCumulativeGrades(event.target.value)} placeholder="e.g. 8.2,9,8.6" /></label></div>
        <small>Include every relevant course/term according to your programme's rules. This does not read an official grade card.</small>
        <p className="jt-result" aria-live="polite">{cgpa === null ? 'Enter matching cumulative credits and grade points to calculate an estimate.' : 'Estimated CGPA: ' + cgpa.toFixed(2)}</p>
      </article>
    </div>
  </section>;
}
