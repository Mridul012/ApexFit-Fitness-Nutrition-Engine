import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { logProgress, getProgressTrend, deleteProgressEntry } from '../api/progress';

interface ProgressEntry {
  id: string;
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

const inputStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '13px',
  color: '#0f172a',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#374151',
  display: 'block',
  marginBottom: '4px',
};

function Progress() {
  const [weightKg, setWeightKg] = useState('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loadingTrend, setLoadingTrend] = useState(true);

  async function fetchTrend() {
    try {
      const data = await getProgressTrend();
      setTrendData(data);
    } catch { /* silently ignore */ }
    finally { setLoadingTrend(false); }
  }

  useEffect(() => { void fetchTrend(); }, []);

  async function handleSubmit() {
    setFormError('');
    setSubmitting(true);
    try {
      await logProgress({
        weightKg: Number(weightKg),
        bodyFatPercentage: Number(bodyFatPercentage),
      });
      setWeightKg('');
      setBodyFatPercentage('');
      void fetchTrend();
    } catch {
      setFormError('Failed to log progress. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const weightChangeDisplay = () => {
    if (trendData?.weightChange === null || trendData?.weightChange === undefined) return null;
    const change = trendData.weightChange;
    const sign = change > 0 ? '+' : '';
    const color = change < 0 ? '#059669' : change > 0 ? '#ef4444' : '#64748b';
    return <span style={{ color, fontWeight: 500 }}>{sign}{change.toFixed(1)} kg</span>;
  };

  const chartData = trendData?.entries.map((entry) => ({
    date: new Date(entry.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: parseFloat(entry.weightKg.toString()),
    bodyFat: parseFloat(entry.bodyFatPercentage.toString()),
  })) ?? [];

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#0f172a', margin: '0 0 4px' }}>Progress</h1>
      <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 24px' }}>Track your weight and body composition over time</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Log Progress */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: '0 0 16px' }}>Log Today's Progress</h2>

          <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                required
                onFocus={(e) => { e.currentTarget.style.borderColor = '#1d4ed8'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Body Fat (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={bodyFatPercentage}
                onChange={(e) => setBodyFatPercentage(e.target.value)}
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
              {submitting ? 'Logging...' : 'Log Progress'}
            </button>
          </form>
        </div>

        {/* Overview */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: '0 0 16px' }}>Progress Overview</h2>

          {loadingTrend ? (
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>Loading...</p>
          ) : !trendData || trendData.totalEntries === 0 ? (
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>No progress entries yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#f9fafb', borderRadius: '6px', padding: '14px', border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Current Weight</p>
                <p style={{ fontSize: '24px', fontWeight: 500, color: '#0f172a', margin: 0 }}>
                  {Number(trendData.latestEntry?.weightKg).toFixed(1)} kg
                </p>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: '6px', padding: '14px', border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Body Fat</p>
                <p style={{ fontSize: '24px', fontWeight: 500, color: '#0f172a', margin: 0 }}>
                  {Number(trendData.latestEntry?.bodyFatPercentage).toFixed(1)}%
                </p>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: '6px', padding: '14px', border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>Weight Change</p>
                <p style={{ fontSize: '24px', fontWeight: 500, color: '#0f172a', margin: 0 }}>
                  {trendData.weightChange !== null ? weightChangeDisplay() : '—'}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Weight Trend Chart */}
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: '0 0 16px' }}>Weight Trend</h2>

        {!trendData || trendData.totalEntries < 2 ? (
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>Log at least 2 entries to see your weight trend.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#9ca3af' }} width={40} />
              <Tooltip
                formatter={(value) => [`${value} kg`, 'Weight']}
                contentStyle={{ fontSize: 13, borderRadius: 6, border: '1px solid #e5e7eb' }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#1d4ed8"
                strokeWidth={2}
                dot={{ r: 4, fill: '#1d4ed8' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Entry history */}
      {trendData && trendData.totalEntries > 0 && (
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: '0 0 16px' }}>Entry History</h2>
          {[...trendData.entries].reverse().map((entry, idx, arr) => (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '10px',
                marginBottom: '10px',
                borderBottom: idx < arr.length - 1 ? '1px solid #e5e7eb' : 'none',
              }}
            >
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                {new Date(entry.recordedAt).toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric',
                })}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a', margin: '0 0 2px' }}>
                    {Number(entry.weightKg).toFixed(1)} kg
                  </p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                    {Number(entry.bodyFatPercentage).toFixed(1)}% fat
                  </p>
                </div>
                <button
                  onClick={() => void deleteProgressEntry(entry.id).then(() => fetchTrend())}
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

export default Progress;
