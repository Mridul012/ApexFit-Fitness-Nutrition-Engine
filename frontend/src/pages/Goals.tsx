import { useState, useEffect } from 'react';
import { createGoal, updateGoal, getGoals } from '../api/goals';
import { getProgressTrend } from '../api/progress';

interface Goal {
  goalType: string;
  targetWeightKg: number | null;
  targetDailyCalories: number | null;
}

interface ProgressEntry {
  weightKg: number;
  bodyFatPercentage: number;
  recordedAt: string;
}

interface TrendData {
  entries: ProgressEntry[];
  totalEntries: number;
  firstEntry: ProgressEntry | null;
  latestEntry: ProgressEntry | null;
  weightChange: number | null;
}

const GOAL_OPTIONS = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'maintenance', label: 'Maintenance' },
];

const goalDescriptions: Record<string, string> = {
  weight_loss: 'The engine will monitor your calorie intake and flag deficits that could harm your progress.',
  muscle_gain: 'The engine will check for calorie surplus and higher protein targets to support muscle growth.',
  maintenance: 'The engine will help you stay consistent with balanced nutrition and workout frequency.',
};

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

function Goals() {
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [loadingGoal, setLoadingGoal] = useState(true);
  const [trendData, setTrendData] = useState<TrendData | null>(null);

  const [goalType, setGoalType] = useState('weight_loss');
  const [targetWeightKg, setTargetWeightKg] = useState('');
  const [targetDailyCalories, setTargetDailyCalories] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [editing, setEditing] = useState(false);

  async function fetchData() {
    const [goalResult, trendResult] = await Promise.allSettled([getGoals(), getProgressTrend()]);
    if (goalResult.status === 'fulfilled') {
      const data = goalResult.value;
      if (data?.goalType) {
        setCurrentGoal(data);
        setGoalType(data.goalType);
        setTargetWeightKg(data.targetWeightKg?.toString() ?? '');
        setTargetDailyCalories(data.targetDailyCalories?.toString() ?? '');
      } else {
        setCurrentGoal(null);
      }
    } else {
      setCurrentGoal(null);
    }
    if (trendResult.status === 'fulfilled') setTrendData(trendResult.value as TrendData);
    setLoadingGoal(false);
  }

  useEffect(() => { void fetchData(); }, []);

  async function handleSubmit() {
    setFormError('');
    setSubmitting(true);
    try {
      const payload = {
        goalType,
        targetWeightKg: targetWeightKg ? Number(targetWeightKg) : undefined,
        targetDailyCalories: targetDailyCalories ? Number(targetDailyCalories) : undefined,
      };
      if (currentGoal) {
        await updateGoal(payload);
      } else {
        await createGoal({
          goalType,
          targetWeightKg: Number(targetWeightKg),
          targetDailyCalories: Number(targetDailyCalories),
        });
      }
      setEditing(false);
      void fetchData();
    } catch {
      setFormError('Failed to save goal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const goalLabel = (type: string) =>
    GOAL_OPTIONS.find((o) => o.value === type)?.label ?? type.replace('_', ' ');

  const progressSection = (() => {
    if (!currentGoal || !trendData || trendData.totalEntries < 1) return null;
    const { latestEntry, firstEntry } = trendData;
    if (!latestEntry) return null;
    const currentWeight = Number(latestEntry.weightKg);
    const targetWeight = currentGoal.targetWeightKg !== null ? Number(currentGoal.targetWeightKg) : null;
    const startWeight = firstEntry ? Number(firstEntry.weightKg) : currentWeight;
    let progress = 0;
    let remainingLabel = '';
    let remainingValue = '';
    if (targetWeight !== null) {
      const diff = Math.abs(currentWeight - targetWeight).toFixed(1);
      if (currentGoal.goalType === 'weight_loss') {
        progress = startWeight !== targetWeight
          ? ((startWeight - currentWeight) / (startWeight - targetWeight)) * 100 : 100;
        remainingLabel = 'Still to lose';
        remainingValue = currentWeight > targetWeight ? `${diff} kg` : 'Goal reached!';
      } else if (currentGoal.goalType === 'muscle_gain') {
        progress = targetWeight !== startWeight
          ? ((currentWeight - startWeight) / (targetWeight - startWeight)) * 100 : 100;
        remainingLabel = 'Still to gain';
        remainingValue = currentWeight < targetWeight ? `${diff} kg` : 'Goal reached!';
      } else {
        const withinRange = Math.abs(currentWeight - targetWeight) <= 1;
        progress = withinRange ? 100 : Math.max(0, 100 - Math.abs(currentWeight - targetWeight) * 10);
        remainingLabel = 'Difference from target';
        remainingValue = `${diff} kg`;
      }
      progress = Math.min(100, Math.max(0, progress));
    }
    return { currentWeight, targetWeight, startWeight, progress, remainingLabel, remainingValue };
  })();

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#0f172a', margin: '0 0 4px' }}>Goals</h1>
      <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 24px' }}>Set and track your fitness objectives</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Current Goal */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: '0 0 16px' }}>Current Goal</h2>

          {loadingGoal ? (
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>Loading...</p>
          ) : !currentGoal ? (
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>No goal set yet. Create one to get started.</p>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Goal Type</p>
                <p style={{ fontSize: '24px', fontWeight: 500, color: '#0f172a', margin: 0, textTransform: 'capitalize' }}>
                  {goalLabel(currentGoal.goalType)}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                {[
                  { label: 'Target Weight', value: currentGoal.targetWeightKg !== null ? `${Number(currentGoal.targetWeightKg).toFixed(1)} kg` : '—' },
                  { label: 'Daily Calories', value: currentGoal.targetDailyCalories !== null ? `${currentGoal.targetDailyCalories} kcal` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: '#f9fafb', borderRadius: '6px', padding: '14px', border: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>{label}</p>
                    <p style={{ fontSize: '20px', fontWeight: 500, color: '#0f172a', margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>

              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    width: '100%',
                    border: '1px solid #e5e7eb',
                    background: '#fff',
                    color: '#64748b',
                    borderRadius: '6px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Edit Goal
                </button>
              )}
            </>
          )}
        </div>


        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: '0 0 16px' }}>
            {currentGoal ? 'Edit Goal' : 'Set a Goal'}
          </h2>

          <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Goal Type</label>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value)}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#1d4ed8'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                style={inputStyle}
              >
                {GOAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '6px 0 0' }}>{goalDescriptions[goalType]}</p>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Target Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(e.target.value)}
                required={!currentGoal}
                placeholder="e.g. 75.0"
                onFocus={(e) => { e.currentTarget.style.borderColor = '#1d4ed8'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Daily Calorie Target</label>
              <input
                type="number"
                min="0"
                value={targetDailyCalories}
                onChange={(e) => setTargetDailyCalories(e.target.value)}
                required={!currentGoal}
                placeholder="e.g. 2000"
                onFocus={(e) => { e.currentTarget.style.borderColor = '#1d4ed8'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                style={inputStyle}
              />
            </div>

            {formError && <p style={{ fontSize: '13px', color: '#ef4444', margin: '0 0 8px' }}>{formError}</p>}

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
                  background: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? 'Saving...' : currentGoal ? 'Update Goal' : 'Set Goal'}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => { setEditing(false); setFormError(''); }}
                  style={{
                    flex: 1,
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    color: '#64748b',
                    borderRadius: '6px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

      </div>


      {progressSection && (
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px', marginTop: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: '0 0 16px' }}>Your Progress Towards Goal</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Current', value: `${progressSection.currentWeight.toFixed(1)} kg` },
              { label: 'Target', value: progressSection.targetWeight !== null ? `${progressSection.targetWeight.toFixed(1)} kg` : '—' },
              { label: progressSection.remainingLabel, value: progressSection.remainingValue },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: '#f9fafb', borderRadius: '6px', padding: '14px', border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>{label}</p>
                <p style={{ fontSize: '20px', fontWeight: 500, color: '#0f172a', margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>

          {progressSection.targetWeight !== null && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>
                <span>Progress</span>
                <span>{Math.round(progressSection.progress)}%</span>
              </div>
              <div style={{ width: '100%', background: '#f1f5f9', borderRadius: '9999px', height: '6px' }}>
                <div
                  style={{
                    width: `${progressSection.progress}%`,
                    height: '6px',
                    borderRadius: '9999px',
                    background: '#1d4ed8',
                  }}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Goals;
