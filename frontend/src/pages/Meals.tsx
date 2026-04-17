import { useState, useEffect } from 'react';
import { logMeal, getDailyMeals, deleteMeal } from '../api/meals';

interface Meal {
  id: string;
  mealName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

interface DailyData {
  meals: Meal[];
  totalCalories: number;
}

interface FoodItem {
  description: string;
  foodNutrients: { nutrientName: string; value: number }[];
}

interface SelectedFood {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

const USDA_API_KEY = 'SatZkRTbgC7EEFDkQjZbEF6shn2Qy04Ejf1zdAnJ';

const getNutrient = (nutrients: { nutrientName: string; value: number }[], name: string): number => {
  const found = nutrients.find((n) => n.nutrientName === name);
  return found ? found.value : 0;
};

const scale = (per100g: number, grams: number): string =>
  String(Math.round((per100g * grams) / 100));

const today = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();

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

function Meals() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedFood, setSelectedFood] = useState<SelectedFood | null>(null);
  const [weightGrams, setWeightGrams] = useState('100');

  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [proteinG, setProteinG] = useState('');
  const [carbsG, setCarbsG] = useState('');
  const [fatG, setFatG] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const [isLoadingMeals, setIsLoadingMeals] = useState(true);

  async function fetchMeals() {
    try {
      const data = await getDailyMeals(today);
      setDailyData(data);
    } catch { /* silently ignore */ }
    finally { setIsLoadingMeals(false); }
  }

  useEffect(() => { void fetchMeals(); }, []);

  useEffect(() => {
    if (!selectedFood) return;
    const grams = Number(weightGrams);
    if (!weightGrams || grams <= 0) return;
    setMealName(`${selectedFood.name} (${weightGrams}g)`);
    setCalories(scale(selectedFood.caloriesPer100g, grams));
    setProteinG(scale(selectedFood.proteinPer100g, grams));
    setCarbsG(scale(selectedFood.carbsPer100g, grams));
    setFatG(scale(selectedFood.fatPer100g, grams));
  }, [weightGrams, selectedFood]);

  async function handleSearch() {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);
    setSelectedFood(null);
    setHasSearched(true);
    try {
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(trimmed)}&api_key=${USDA_API_KEY}&pageSize=8`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('API error');
      const data = await response.json() as { foods: FoodItem[] };
      setSearchResults((data.foods ?? []).filter((f) => f.description?.trim()));
    } catch {
      setSearchError('Search failed. Check your connection.');
    } finally {
      setIsSearching(false);
    }
  }

  function selectFood(item: FoodItem) {
    setSelectedFood({
      name: item.description,
      caloriesPer100g: getNutrient(item.foodNutrients, 'Energy'),
      proteinPer100g: getNutrient(item.foodNutrients, 'Protein'),
      carbsPer100g: getNutrient(item.foodNutrients, 'Carbohydrate, by difference'),
      fatPer100g: getNutrient(item.foodNutrients, 'Total lipid (fat)'),
    });
    setWeightGrams('100');
    setSearchResults([]);
  }

  async function handleSubmit() {
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await logMeal({
        mealName,
        calories: Number(calories),
        proteinG: Number(proteinG),
        carbsG: Number(carbsG),
        fatG: Number(fatG),
      });
      setSearchQuery(''); setSearchResults([]); setSelectedFood(null);
      setWeightGrams('100'); setHasSearched(false);
      setMealName(''); setCalories(''); setProteinG(''); setCarbsG(''); setFatG('');
      void fetchMeals();
    } catch (err) {
      setSubmitError((err as any)?.response?.data?.message || 'Failed to log meal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const grams = Number(weightGrams);
  const previewCalories = selectedFood && grams > 0 ? Math.round((selectedFood.caloriesPer100g * grams) / 100) : 0;
  const previewProtein = selectedFood && grams > 0 ? Math.round((selectedFood.proteinPer100g * grams) / 100) : 0;
  const previewCarbs = selectedFood && grams > 0 ? Math.round((selectedFood.carbsPer100g * grams) / 100) : 0;
  const previewFat = selectedFood && grams > 0 ? Math.round((selectedFood.fatPer100g * grams) / 100) : 0;

  const meals = dailyData?.meals ?? [];
  const totalCalories = Math.round(meals.reduce((sum, m) => sum + m.calories, 0));
  const totalProtein = Math.round(meals.reduce((sum, m) => sum + m.proteinG, 0));
  const totalCarbs = Math.round(meals.reduce((sum, m) => sum + m.carbsG, 0));
  const totalFat = Math.round(meals.reduce((sum, m) => sum + m.fatG, 0));

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#0f172a', margin: '0 0 4px' }}>Meals</h1>
      <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 24px' }}>Log your daily food intake</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Log a Meal */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: '0 0 16px' }}>Log a Meal</h2>

          {/* Search */}
          <div style={{ marginBottom: '8px' }}>
            <label style={labelStyle}>Search Food</label>
            <div style={{ display: 'flex' }}>
              <input
                type="text"
                placeholder="e.g. chicken breast, banana"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleSearch(); } }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#1d4ed8'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                style={{ ...inputStyle, borderRadius: '6px 0 0 6px', borderRight: 'none' }}
              />
              <button
                type="button"
                onClick={() => void handleSearch()}
                disabled={isSearching}
                style={{
                  background: '#0f172a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0 6px 6px 0',
                  padding: '0 14px',
                  fontSize: '13px',
                  cursor: isSearching ? 'not-allowed' : 'pointer',
                  opacity: isSearching ? 0.6 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {isSearching ? '...' : 'Search'}
              </button>
            </div>

            {searchError && <p style={{ fontSize: '13px', color: '#ef4444', marginTop: '6px' }}>{searchError}</p>}
            {!searchError && hasSearched && !isSearching && searchResults.length === 0 && !selectedFood && (
              <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '6px' }}>No results found. Try a different search.</p>
            )}

            {searchResults.map((item, index) => (
              <div
                key={index}
                onClick={() => selectFood(item)}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  marginTop: '6px',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
              >
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a', margin: '0 0 3px' }}>{item.description}</p>
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                  Cal: {Math.round(getNutrient(item.foodNutrients, 'Energy'))} &nbsp;|&nbsp;
                  P: {Math.round(getNutrient(item.foodNutrients, 'Protein'))}g &nbsp;|&nbsp;
                  C: {Math.round(getNutrient(item.foodNutrients, 'Carbohydrate, by difference'))}g &nbsp;|&nbsp;
                  F: {Math.round(getNutrient(item.foodNutrients, 'Total lipid (fat)'))}g
                  <span style={{ color: '#d1d5db' }}> per 100g</span>
                </p>
              </div>
            ))}

            {selectedFood && (
              <>
                <div style={{ marginTop: '12px' }}>
                  <label style={labelStyle}>Amount (grams)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 100"
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(e.target.value)}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#1d4ed8'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                    style={inputStyle}
                  />
                </div>
                <div style={{ background: '#f9fafb', borderRadius: '6px', padding: '12px', marginTop: '10px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a', margin: '0 0 8px' }}>{selectedFood.name}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                    {[
                      { val: previewCalories, unit: 'kcal' },
                      { val: `${previewProtein}g`, unit: 'protein' },
                      { val: `${previewCarbs}g`, unit: 'carbs' },
                      { val: `${previewFat}g`, unit: 'fat' },
                    ].map(({ val, unit }) => (
                      <div key={unit}>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a', margin: '0 0 2px' }}>{val}</p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{unit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', margin: '16px 0' }} />

          {/* Form */}
          <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}>
            {[
              { label: 'Meal Name', value: mealName, setter: setMealName, type: 'text' },
              { label: 'Calories', value: calories, setter: setCalories, type: 'number' },
              { label: 'Protein (g)', value: proteinG, setter: setProteinG, type: 'number' },
              { label: 'Carbs (g)', value: carbsG, setter: setCarbsG, type: 'number' },
              { label: 'Fat (g)', value: fatG, setter: setFatG, type: 'number' },
            ].map(({ label, value, setter, type }) => (
              <div key={label} style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>{label}</label>
                <input
                  type={type}
                  min={type === 'number' ? '0' : undefined}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  required
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#1d4ed8'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  style={inputStyle}
                />
              </div>
            ))}

            {submitError && <p style={{ fontSize: '13px', color: '#ef4444', margin: '0 0 8px' }}>{submitError}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                background: '#0f172a',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
                marginTop: '8px',
              }}
            >
              {isSubmitting ? 'Logging...' : 'Log Meal'}
            </button>
          </form>
        </div>

        {/* Daily Summary */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: '0 0 16px' }}>Daily Summary</h2>

          {isLoadingMeals ? (
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>Loading...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Calories', value: `${totalCalories} kcal` },
                { label: 'Protein', value: `${totalProtein}g` },
                { label: 'Carbs', value: `${totalCarbs}g` },
                { label: 'Fat', value: `${totalFat}g` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{ background: '#f9fafb', borderRadius: '6px', padding: '14px', border: '1px solid #e5e7eb' }}
                >
                  <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>
                    {label}
                  </p>
                  <p style={{ fontSize: '20px', fontWeight: 500, color: '#0f172a', margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Meal list */}
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '20px', marginTop: '20px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: '0 0 16px' }}>Today's Meals</h2>

        {isLoadingMeals ? (
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>Loading...</p>
        ) : !dailyData || dailyData.meals.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>No meals logged today.</p>
        ) : (
          <>
            {dailyData.meals.map((meal) => (
              <div
                key={meal.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #f1f5f9',
                  padding: '12px 0',
                }}
              >
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a', margin: '0 0 3px' }}>{meal.mealName}</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                    P: {meal.proteinG}g &nbsp; C: {meal.carbsG}g &nbsp; F: {meal.fatG}g
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a', margin: 0, whiteSpace: 'nowrap' }}>
                    {meal.calories} kcal
                  </p>
                  <button
                    onClick={() => void deleteMeal(meal.id).then(() => fetchMeals())}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '18px',
                      color: '#d1d5db',
                      cursor: 'pointer',
                      lineHeight: 1,
                      padding: 0,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#d1d5db'; }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', marginTop: '4px', borderTop: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a' }}>Total</span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a' }}>{totalCalories} kcal</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Meals;
