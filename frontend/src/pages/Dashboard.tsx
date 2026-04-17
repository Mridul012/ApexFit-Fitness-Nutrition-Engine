import { useState, useEffect } from 'react';
import { getDailyMeals } from '../api/meals';
import { getWeeklyWorkouts } from '../api/workouts';
import { getGoals } from '../api/goals';
import { getUnreadRecommendations, generateRecommendations, markAsRead } from '../api/recommendations';

interface Recommendation {
  id: string;
  message: string;
  recType: string;
  generatedAt: string;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const today = new Date();
const dateLabel = today.toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

function IconZap() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function IconActivity() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function IconTarget() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function StatIconBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: '26px',
        height: '26px',
        borderRadius: '6px',
        background: '#eff6ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

function Dashboard() {
  const fullName = localStorage.getItem('fullName') || '';
  const firstName = fullName.split(' ')[0] || 'there';

  const [loading, setLoading] = useState(true);
  const [todayCalories, setTodayCalories] = useState(0);
  const [targetCalories, setTargetCalories] = useState<number | null>(null);
  const [weeklyWorkoutCount, setWeeklyWorkoutCount] = useState(0);
  const [activeGoal, setActiveGoal] = useState('None set');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      const d = new Date();
      const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const [mealsData, workoutsData, goalData, recsData] = await Promise.allSettled([
        getDailyMeals(todayStr),
        getWeeklyWorkouts(),
        getGoals(),
        getUnreadRecommendations(),
      ]);
      if (mealsData.status === 'fulfilled') {
        const meals = mealsData.value?.meals ?? [];
        setTodayCalories(Math.round(meals.reduce((sum: number, m: { calories: number }) => sum + m.calories, 0)));
      }
      if (workoutsData.status === 'fulfilled') setWeeklyWorkoutCount(workoutsData.value?.workoutCount ?? 0);
      if (goalData.status === 'fulfilled' && goalData.value?.goalType) {
        setActiveGoal(goalData.value.goalType.replace('_', ' '));
        if (goalData.value.targetDailyCalories) setTargetCalories(Number(goalData.value.targetDailyCalories));
      }
      if (recsData.status === 'fulfilled' && Array.isArray(recsData.value)) {
        setRecommendations(recsData.value as Recommendation[]);
      }
      setLoading(false);
    }
    void fetchAll();
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateRecommendations();
      const fresh = await getUnreadRecommendations();
      if (Array.isArray(fresh)) setRecommendations(fresh as Recommendation[]);
    } catch {  }
    finally { setGenerating(false); }
  }

  async function handleMarkAsRead(id: string) {
    try {
      await markAsRead(id);
      setRecommendations((prev) => prev.filter((r) => r.id !== id));
    } catch {  }
  }

  const seen = new Set<string>();
  const uniqueRecs = recommendations.filter((rec) => {
    if (seen.has(rec.message)) return false;
    seen.add(rec.message);
    return true;
  });

  const caloriePercent = targetCalories
    ? Math.min(100, Math.round((todayCalories / targetCalories) * 100))
    : null;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '64px', color: '#9ca3af', fontSize: '14px' }}>
        Loading dashboard...
      </div>
    );
  }

  const workoutDots = Array.from({ length: 7 }, (_, i) => i < weeklyWorkoutCount);

  return (
    <div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#0f172a', margin: 0 }}>
            {getGreeting()}, {firstName}
          </h1>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '3px 0 0' }}>Your daily snapshot</p>
        </div>
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '5px 12px',
            fontSize: '12px',
            color: '#64748b',
          }}
        >
          {dateLabel}
        </div>
      </div>


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>

        <div style={{ background: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Today's Calories
            </p>
            <StatIconBox><IconZap /></StatIconBox>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 500, color: '#0f172a', margin: '0 0 2px' }}>{todayCalories}</p>
          {targetCalories ? (
            <>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px' }}>
                {todayCalories} / {targetCalories} kcal
              </p>
              <div style={{ width: '100%', background: '#f1f5f9', borderRadius: '9999px', height: '3px' }}>
                <div
                  style={{
                    width: `${caloriePercent}%`,
                    height: '3px',
                    borderRadius: '9999px',
                    background: '#1d4ed8',
                  }}
                />
              </div>
            </>
          ) : (
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px' }}>kcal consumed</p>
          )}
        </div>


        <div style={{ background: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Workouts This Week
            </p>
            <StatIconBox><IconActivity /></StatIconBox>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 500, color: '#0f172a', margin: '0 0 2px' }}>{weeklyWorkoutCount}</p>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px' }}>sessions logged</p>
          <div style={{ display: 'flex', gap: '4px' }}>
            {workoutDots.map((filled, i) => (
              <div
                key={i}
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: filled ? '#1d4ed8' : '#e5e7eb',
                }}
              />
            ))}
          </div>
        </div>


        <div style={{ background: '#fff', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Active Goal
            </p>
            <StatIconBox><IconTarget /></StatIconBox>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 500, color: '#0f172a', margin: '0 0 2px', textTransform: 'capitalize' }}>
            {activeGoal}
          </p>
          {activeGoal !== 'None set' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1d4ed8', display: 'inline-block' }} />
              <span style={{ fontSize: '12px', color: '#16a34a' }}>On track</span>
            </div>
          )}
        </div>
      </div>


      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: '0 0 2px' }}>Recommendations</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{uniqueRecs.length} unread</p>
          </div>
          <button
            onClick={() => void handleGenerate()}
            disabled={generating}
            style={{
              background: '#0f172a',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: generating ? 'not-allowed' : 'pointer',
              opacity: generating ? 0.6 : 1,
            }}
          >
            {generating ? 'Generating...' : 'Generate new'}
          </button>
        </div>

        {uniqueRecs.length === 0 ? (
          <div
            style={{
              background: '#fff',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              padding: '40px 24px',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: '0 0 6px' }}>You're all caught up</p>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
              Click "Generate new" to get personalized recommendations based on your recent activity
            </p>
          </div>
        ) : (
          uniqueRecs.map((rec) => {
            const isDiet = rec.recType === 'diet_adjustment';
            return (
              <div
                key={rec.id}
                style={{
                  background: '#fff',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  border: '1px solid #e5e7eb',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span
                    style={{
                      background: isDiet ? '#fffbeb' : '#eff6ff',
                      color: isDiet ? '#92400e' : '#1d4ed8',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 500,
                    }}
                  >
                    {rec.recType?.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '11px', color: '#d1d5db' }}>
                    {new Date(rec.generatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.5, margin: '0 0 8px' }}>{rec.message}</p>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => void handleMarkAsRead(rec.id)}
                    style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      padding: '3px 10px',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Mark as read
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Dashboard;
