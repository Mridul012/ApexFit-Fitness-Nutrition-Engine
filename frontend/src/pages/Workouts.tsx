import { useState, useEffect } from 'react';
import { logWorkout, getWeeklyWorkouts, deleteWorkout } from '../api/workouts';

interface Workout {
  id: string;
  workoutType: string;
  durationMins: number;
  caloriesBurned: number;
  loggedAt: string;
}

const WORKOUT_OPTIONS = [
  { value: 'cardio', label: 'Cardio' },
  { value: 'strength', label: 'Strength' },
  { value: 'flexibility', label: 'Flexibility' },
];

interface WeeklyData {
  workouts: Workout[];
  workoutCount: number;
  totalCaloriesBurned: number;
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '13px',
  color: '#0f172a',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#374151',
  display: 'block',
  marginBottom: '4px',
};

function Workouts() {
  const [workoutType, setWorkoutType] = useState('cardio');
  const [durationMins, setDurationMins] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);

  async function fetchWorkouts() {
    try {
      const data = await getWeeklyWorkouts();
      setWeeklyData(data);
    } catch { /* silently ignore */ }
    finally { setLoadingWorkouts(false); }
  }

  useEffect(() => { void fetchWorkouts(); }, []);

  async function handleSubmit() {
    setFormError('');
    setSubmitting(true);
    try {
      await logWorkout({
        workoutType,
        durationMins: Number(durationMins),
        caloriesBurned: Number(caloriesBurned),
      });
      setWorkoutType('cardio');
      setDurationMins('');
      setCaloriesBurned('');
      void fetchWorkouts();
    } catch {
      setFormError('Failed to log workout. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const totalDurationMins = weeklyData?.workouts.reduce((sum, w) => sum + w.durationMins, 0) ?? 0;

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#0f172a', margin: '0 0 4px' }}>Workouts</h1>
      <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 24px' }}>Log and review your weekly sessions</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>


        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: '0 0 16px' }}>Log a Workout</h2>

          <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Workout Type</label>
              <select
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#1d4ed8'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                style={inputStyle}
              >
                {WORKOUT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Duration (mins)</label>
              <input
                type="number"
                min="1"
                value={durationMins}
                onChange={(e) => setDurationMins(e.target.value)}
                required
                onFocus={(e) => { e.currentTarget.style.borderColor = '#1d4ed8'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Calories Burned</label>
              <input
                type="number"
                min="0"
                value={caloriesBurned}
                onChange={(e) => setCaloriesBurned(e.target.value)}
                required
                onFocus={(e) => { e.currentTarget.style.borderColor = '#1d4ed8'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                style={inputStyle}
              />
            </div>

            {formError && <p style={{ fontSize: '13px', color: '#ef4444', margin: '0 0 8px' }}>{formError}</p>}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                background: '#0f172a',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
                marginTop: '8px',
              }}
            >
              {submitting ? 'Logging...' : 'Log Workout'}
            </button>
          </form>
        </div>


        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: '0 0 16px' }}>Weekly Summary</h2>

          {loadingWorkouts ? (
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>Loading...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Sessions', value: String(weeklyData?.workoutCount ?? 0) },
                { label: 'Total Duration', value: `${totalDurationMins} mins` },
                { label: 'Calories Burned', value: `${Math.round(weeklyData?.totalCaloriesBurned ?? 0)} kcal` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    background: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <p style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    {label}
                  </p>
                  <p style={{ fontSize: '20px', fontWeight: 500, color: '#0f172a', margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>


      {weeklyData && weeklyData.workouts.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px', marginTop: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: '0 0 16px' }}>This Week's Sessions</h2>
          {weeklyData.workouts.map((w) => (
            <div
              key={w.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '12px',
                marginBottom: '12px',
              }}
            >
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a', margin: '0 0 2px', textTransform: 'capitalize' }}>
                  {w.workoutType}
                </p>
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                  {new Date(w.loggedAt).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric',
                  })}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '13px', color: '#0f172a', margin: '0 0 2px' }}>{w.durationMins} mins</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{w.caloriesBurned} kcal burned</p>
                </div>
                <button
                  onClick={() => void deleteWorkout(w.id).then(() => fetchWorkouts())}
                  style={{ background: 'none', border: 'none', color: '#d1d5db', fontSize: '18px', cursor: 'pointer', lineHeight: 1, padding: 0 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#d1d5db'; }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Workouts;
