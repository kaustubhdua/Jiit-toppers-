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
  const [credits, setCredits] = useState('4,3,3,2');
  const [grades, setGrades] = useState('9,8,8,10');

  const counts = {
    held: held.trim() === '' ? Number.NaN : Number(held),
    attended: attended.trim() === '' ? Number.NaN : Number(attended),
    target: target.trim() === '' ? Number.NaN : Number(target),
  };
  const attendance = useMemo(
    () => calculateAttendance(counts),
    [held, attended, target],
  );
  const forecast = useMemo(
    () => calculateAttendanceForecast({ ...counts, futureClasses: futureClasses.trim() === '' ? Number.NaN : Number(futureClasses) }),
    [held, attended, target, futureClasses],
  );
  const parsedCredits = useMemo(() => parseNumbers(credits), [credits]);
  const parsedGrades = useMemo(() => parseNumbers(grades), [grades]);
  const sgpa = useMemo(() => calculateSgpa(parsedCredits, parsedGrades), [parsedCredits, parsedGrades]);
  const cgpa = useMemo(() => calculateCgpa(parsedCredits, parsedGrades), [parsedCredits, parsedGrades]);

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
        <div className="jt-form-grid"><label>Course credits<input value={credits} onChange={event => setCredits(event.target.value)} /></label><label>Grade points<input value={grades} onChange={event => setGrades(event.target.value)} /></label></div>
        <small>Example: 4,3,3,2 and 9,8,8,10</small>
        <p className="jt-result" aria-live="polite">{sgpa === null ? 'Enter matching positive credits and grade points from 0 to 10.' : 'Estimated SGPA: ' + sgpa.toFixed(2)}</p>
      </article>
      <article className="jt-card"><h3>CGPA estimator</h3><p>Use all included courses across completed semesters. The result is credit-weighted; enter the credits and grade points for each included course.</p>
        <p className="jt-result" aria-live="polite">{cgpa === null ? 'Enter matching positive credits and grade points from 0 to 10 in the inputs above.' : 'Estimated cumulative GPA from the same inputs: ' + cgpa.toFixed(2)}</p>
        <small>The SGPA and CGPA fields share the same inputs as a simple demonstration. For a real cumulative result, include every relevant course/term according to your programme's rules.</small>
      </article>
    </div>
  </section>;
}
