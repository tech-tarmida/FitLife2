import React, { useEffect, useState } from 'react';
import {
  TrendingUp, Plus, Scale, Ruler, Calendar, Target, ChevronDown,
  BarChart2, Activity, Flame, Clock, Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, ProgressLog, WorkoutLog } from '../lib/supabase';

type Props = { onNavigate: (page: string) => void };

function SimpleBarChart({ data, label, color }: { data: { date: string; value: number }[]; label: string; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div>
      <div className="flex items-end gap-1 h-24">
        {data.slice(-14).map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-sm transition-all duration-500 ${color}`}
              style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
              title={`${d.date}: ${d.value} ${label}`}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-dark-500">{data.slice(-14)[0]?.date}</span>
        <span className="text-[10px] text-dark-500">Today</span>
      </div>
    </div>
  );
}

function SimpleLineChart({ data, label, color }: { data: { date: string; value: number }[]; label: string; color: string }) {
  if (data.length < 2) return (
    <div className="flex items-center justify-center h-24 text-dark-500 text-sm">Not enough data yet</div>
  );

  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 300;
  const height = 80;

  const points = data.slice(-14).map((d, i, arr) => {
    const x = (i / (arr.length - 1)) * width;
    const y = height - ((d.value - min) / range) * (height - 10) - 5;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: '96px' }}>
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#grad-${label})`} />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {data.slice(-14).map((d, i, arr) => {
          const x = (i / (arr.length - 1)) * width;
          const y = height - ((d.value - min) / range) * (height - 10) - 5;
          return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
        })}
      </svg>
      <div className="flex justify-between">
        <span className="text-[10px] text-dark-500">{data.slice(-14)[0]?.date}</span>
        <span className="text-[10px] text-dark-500">Today</span>
      </div>
    </div>
  );
}

function LogProgressModal({ onClose, onLogged }: { onClose: () => void; onLogged: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ weight_kg: '', body_fat_percent: '', chest_cm: '', waist_cm: '', hips_cm: '', bicep_cm: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const payload: any = { user_id: user.id, logged_at: new Date().toISOString().split('T')[0] };
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && k !== 'notes') payload[k] = parseFloat(v);
      else if (k === 'notes') payload.notes = v;
    });
    await supabase.from('progress_logs').insert(payload);
    setLoading(false);
    onLogged();
    onClose();
  };

  const fields = [
    { key: 'weight_kg', label: 'Weight (kg)', placeholder: '70.5' },
    { key: 'body_fat_percent', label: 'Body Fat %', placeholder: '15.0' },
    { key: 'chest_cm', label: 'Chest (cm)', placeholder: '95' },
    { key: 'waist_cm', label: 'Waist (cm)', placeholder: '80' },
    { key: 'hips_cm', label: 'Hips (cm)', placeholder: '95' },
    { key: 'bicep_cm', label: 'Bicep (cm)', placeholder: '35' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card w-full max-w-md animate-slide-up max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6">Log Progress</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-dark-300 mb-1">{f.label}</label>
                <input
                  type="number"
                  step="0.1"
                  value={(form as any)[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="input-field text-sm py-2"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-dark-300 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="How are you feeling?"
              rows={2}
              className="input-field resize-none text-sm"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 text-sm py-2">
              {loading ? '...' : 'Save Progress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BMICalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const bmi = weight && height ? parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2) : null;
  const getBMIInfo = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
    if (bmi < 25) return { label: 'Normal Weight', color: 'text-primary-400' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-400' };
    return { label: 'Obese', color: 'text-red-400' };
  };
  const bmiInfo = bmi ? getBMIInfo(bmi) : null;
  const bmiPct = bmi ? Math.min(Math.max(((bmi - 10) / 30) * 100, 0), 100) : 0;

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
          <Scale size={16} className="text-primary-400" />
        </div>
        <h3 className="font-semibold text-white">BMI Calculator</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs text-dark-400 mb-1">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="70"
            className="input-field text-sm py-2"
          />
        </div>
        <div>
          <label className="block text-xs text-dark-400 mb-1">Height (cm)</label>
          <input
            type="number"
            value={height}
            onChange={e => setHeight(e.target.value)}
            placeholder="175"
            className="input-field text-sm py-2"
          />
        </div>
      </div>
      {bmi && bmiInfo && (
        <div className="animate-slide-up">
          <div className="text-center mb-3">
            <p className={`text-3xl font-black ${bmiInfo.color}`}>{bmi.toFixed(1)}</p>
            <p className={`text-sm font-medium ${bmiInfo.color}`}>{bmiInfo.label}</p>
          </div>
          <div className="relative h-3 bg-gradient-to-r from-blue-500 via-primary-500 via-yellow-400 to-red-500 rounded-full overflow-hidden mb-1">
            <div
              className="absolute top-0 bottom-0 w-3 -translate-x-1/2 bg-white rounded-full shadow-lg transition-all duration-500"
              style={{ left: `${bmiPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-dark-500">
            <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
          </div>
        </div>
      )}
    </div>
  );
}

function CalorieCalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState('moderate');
  const [result, setResult] = useState<{ bmr: number; tdee: number; loss: number; gain: number } | null>(null);

  const ACTIVITY_MULT: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9
  };

  const calculate = () => {
    const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age);
    if (!w || !h || !a) return;
    const bmr = gender === 'male'
      ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a
      : 447.593 + 9.247 * w + 3.098 * h - 4.330 * a;
    const tdee = bmr * ACTIVITY_MULT[activity];
    setResult({ bmr: Math.round(bmr), tdee: Math.round(tdee), loss: Math.round(tdee - 500), gain: Math.round(tdee + 300) });
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-accent-500/20 rounded-lg flex items-center justify-center">
          <Flame size={16} className="text-accent-400" />
        </div>
        <h3 className="font-semibold text-white">Calorie Calculator</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs text-dark-400 mb-1">Weight (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" className="input-field text-sm py-2" />
        </div>
        <div>
          <label className="block text-xs text-dark-400 mb-1">Height (cm)</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175" className="input-field text-sm py-2" />
        </div>
        <div>
          <label className="block text-xs text-dark-400 mb-1">Age</label>
          <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="25" className="input-field text-sm py-2" />
        </div>
        <div>
          <label className="block text-xs text-dark-400 mb-1">Gender</label>
          <select value={gender} onChange={e => setGender(e.target.value)} className="input-field text-sm py-2">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-xs text-dark-400 mb-1">Activity Level</label>
        <select value={activity} onChange={e => setActivity(e.target.value)} className="input-field text-sm py-2 w-full">
          <option value="sedentary">Sedentary (little/no exercise)</option>
          <option value="light">Light (1-3 days/week)</option>
          <option value="moderate">Moderate (3-5 days/week)</option>
          <option value="active">Active (6-7 days/week)</option>
          <option value="very_active">Very Active (hard exercise daily)</option>
        </select>
      </div>
      <button onClick={calculate} className="btn-primary w-full text-sm py-2.5">Calculate Calories</button>

      {result && (
        <div className="mt-4 grid grid-cols-2 gap-2 animate-slide-up">
          {[
            { label: 'BMR', value: result.bmr, desc: 'Base metabolic rate', color: 'text-blue-400' },
            { label: 'Maintenance', value: result.tdee, desc: 'Daily total', color: 'text-primary-400' },
            { label: 'Weight Loss', value: result.loss, desc: '-0.5kg/week', color: 'text-yellow-400' },
            { label: 'Muscle Gain', value: result.gain, desc: '+0.3kg/week', color: 'text-accent-400' },
          ].map(r => (
            <div key={r.label} className="bg-dark-900/50 rounded-xl p-3 text-center">
              <p className={`text-lg font-bold ${r.color}`}>{r.value}</p>
              <p className="text-white text-xs font-medium">{r.label}</p>
              <p className="text-dark-400 text-[10px]">{r.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProgressPage({ onNavigate }: Props) {
  const { user } = useAuth();
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'weight' | 'calories' | 'duration'>('weight');

  const fetchData = async () => {
    if (!user) return;
    const [progressRes, workoutRes] = await Promise.all([
      supabase.from('progress_logs').select('*').eq('user_id', user.id).order('logged_at', { ascending: true }),
      supabase.from('user_workout_logs').select('*').eq('user_id', user.id).order('completed_at', { ascending: true }),
    ]);
    setProgressLogs(progressRes.data || []);
    setWorkoutLogs(workoutRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const weightData = progressLogs
    .filter(l => l.weight_kg)
    .map(l => ({ date: l.logged_at, value: l.weight_kg! }));

  const caloriesData = workoutLogs
    .reduce((acc: { date: string; value: number }[], log) => {
      const date = log.completed_at.split('T')[0];
      const existing = acc.find(d => d.date === date);
      if (existing) existing.value += log.calories_burned;
      else acc.push({ date, value: log.calories_burned });
      return acc;
    }, []);

  const durationData = workoutLogs
    .reduce((acc: { date: string; value: number }[], log) => {
      const date = log.completed_at.split('T')[0];
      const existing = acc.find(d => d.date === date);
      if (existing) existing.value += log.duration_minutes;
      else acc.push({ date, value: log.duration_minutes });
      return acc;
    }, []);

  const totalCalories = workoutLogs.reduce((s, l) => s + l.calories_burned, 0);
  const totalDuration = workoutLogs.reduce((s, l) => s + l.duration_minutes, 0);
  const avgCaloriesPerWorkout = workoutLogs.length > 0 ? Math.round(totalCalories / workoutLogs.length) : 0;

  const weightChange = weightData.length >= 2
    ? (weightData[weightData.length - 1].value - weightData[0].value).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 max-w-7xl mx-auto">
      {showLogModal && <LogProgressModal onClose={() => setShowLogModal(false)} onLogged={fetchData} />}

      {/* Header */}
      <div className="flex items-start justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Progress</h1>
          <p className="text-dark-400">Track your transformation journey</p>
        </div>
        <button onClick={() => setShowLogModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Log Progress
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
        {[
          {
            label: 'Total Workouts',
            value: workoutLogs.length,
            icon: Activity,
            color: 'text-primary-400',
            bg: 'bg-primary-500/10',
          },
          {
            label: 'Calories Burned',
            value: totalCalories.toLocaleString(),
            icon: Flame,
            color: 'text-accent-400',
            bg: 'bg-accent-500/10',
          },
          {
            label: 'Total Hours',
            value: `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`,
            icon: Clock,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Avg Calories/Workout',
            value: avgCaloriesPerWorkout,
            icon: Award,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
          },
        ].map((stat, i) => (
          <div key={stat.label} className="card animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-dark-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Charts */}
          <div className="card animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart2 size={18} className="text-primary-400" />
                <h2 className="text-lg font-bold text-white">Analytics</h2>
              </div>
              <div className="flex gap-2">
                {(['weight', 'calories', 'duration'] as const).map(chart => (
                  <button
                    key={chart}
                    onClick={() => setActiveChart(chart)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 capitalize ${
                      activeChart === chart
                        ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                        : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    {chart}
                  </button>
                ))}
              </div>
            </div>

            {activeChart === 'weight' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-dark-400">Weight Trend</p>
                    {weightData.length > 0 && (
                      <p className="text-2xl font-bold text-white">
                        {weightData[weightData.length - 1].value} kg
                      </p>
                    )}
                  </div>
                  {weightChange !== null && (
                    <div className={`px-3 py-1 rounded-xl text-sm font-semibold ${
                      parseFloat(weightChange) <= 0
                        ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange} kg
                    </div>
                  )}
                </div>
                <SimpleLineChart data={weightData} label="kg" color="#22c55e" />
              </div>
            )}
            {activeChart === 'calories' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-dark-400">Daily Calories Burned</p>
                    <p className="text-2xl font-bold text-white">{totalCalories.toLocaleString()} total</p>
                  </div>
                </div>
                <SimpleBarChart data={caloriesData} label="kcal" color="bg-accent-500" />
              </div>
            )}
            {activeChart === 'duration' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-dark-400">Daily Workout Duration</p>
                    <p className="text-2xl font-bold text-white">{totalDuration} min total</p>
                  </div>
                </div>
                <SimpleBarChart data={durationData} label="min" color="bg-blue-500" />
              </div>
            )}

            {(activeChart === 'weight' && weightData.length === 0) ||
              (activeChart === 'calories' && caloriesData.length === 0) ||
              (activeChart === 'duration' && durationData.length === 0) ? (
              <div className="text-center py-8">
                <TrendingUp size={32} className="text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400 text-sm">No data yet. Start logging to see your progress!</p>
              </div>
            ) : null}
          </div>

          {/* Workout Log History */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-primary-400" />
              <h2 className="text-lg font-bold text-white">Workout History</h2>
            </div>
            {workoutLogs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-dark-400 text-sm">No workouts logged yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {workoutLogs.slice().reverse().map(log => (
                  <div key={log.id} className="flex items-center gap-4 p-3 bg-dark-900/50 rounded-xl">
                    <div className="w-9 h-9 bg-primary-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Activity size={16} className="text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{log.workout_title || 'Workout'}</p>
                      <p className="text-xs text-dark-400">
                        {new Date(log.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-white">{log.duration_minutes}m</p>
                      <p className="text-xs text-accent-400">{log.calories_burned} kcal</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Body Measurements */}
          <div className="card animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Ruler size={16} className="text-blue-400" />
              </div>
              <h3 className="font-semibold text-white">Body Measurements</h3>
            </div>
            {progressLogs.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-dark-400 text-xs">No measurements logged yet.</p>
                <button onClick={() => setShowLogModal(true)} className="text-primary-400 text-xs mt-2 hover:text-primary-300 transition-colors">
                  Add first measurement
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { key: 'weight_kg', label: 'Weight', unit: 'kg' },
                  { key: 'body_fat_percent', label: 'Body Fat', unit: '%' },
                  { key: 'waist_cm', label: 'Waist', unit: 'cm' },
                  { key: 'chest_cm', label: 'Chest', unit: 'cm' },
                  { key: 'bicep_cm', label: 'Bicep', unit: 'cm' },
                ].map(m => {
                  const latest = progressLogs.slice().reverse().find(l => (l as any)[m.key]);
                  const first = progressLogs.find(l => (l as any)[m.key]);
                  if (!latest) return null;
                  const val = (latest as any)[m.key];
                  const firstVal = first ? (first as any)[m.key] : null;
                  const diff = firstVal ? (val - firstVal).toFixed(1) : null;
                  return (
                    <div key={m.key} className="flex items-center justify-between p-2.5 bg-dark-900/50 rounded-xl">
                      <span className="text-sm text-dark-400">{m.label}</span>
                      <div className="flex items-center gap-2">
                        {diff !== null && (
                          <span className={`text-xs ${parseFloat(diff) < 0 ? 'text-primary-400' : 'text-red-400'}`}>
                            {parseFloat(diff) > 0 ? '+' : ''}{diff}
                          </span>
                        )}
                        <span className="text-sm font-semibold text-white">{val} {m.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* BMI Calculator */}
          <BMICalculator />

          {/* Calorie Calculator */}
          <CalorieCalculator />
        </div>
      </div>
    </div>
  );
}
