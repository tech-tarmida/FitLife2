import React, { useEffect, useState } from 'react';
import {
  Flame, Zap, Trophy, Droplets, Target, TrendingUp, Play, Plus, ChevronRight,
  Calendar, Star, Crown, Check, Award, Dumbbell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Workout, WorkoutLog, Streak, DailyChallenge } from '../lib/supabase';

type Props = { onNavigate: (page: string) => void };

const MOTIVATIONAL_QUOTES = [
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Unknown" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "Fitness is not about being better than someone else. It's about being better than you used to be.", author: "Khloe Kardashian" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
  { text: "An hour of working out is 4% of your day. No excuses.", author: "Unknown" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  weight_loss: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  muscle_gain: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  home: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  cardio: { bg: 'bg-primary-500/10', text: 'text-primary-400', border: 'border-primary-500/20' },
  yoga: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  strength: { bg: 'bg-accent-500/10', text: 'text-accent-400', border: 'border-accent-500/20' },
};

function WaterTracker({ userId }: { userId: string }) {
  const [intakeMl, setIntakeMl] = useState(0);
  const [adding, setAdding] = useState(false);
  const goalMl = 3000;
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    supabase
      .from('water_intake')
      .select('amount_ml')
      .eq('user_id', userId)
      .eq('logged_at', today)
      .then(({ data }) => {
        if (data) setIntakeMl(data.reduce((s, r) => s + r.amount_ml, 0));
      });
  }, [userId, today]);

  const addWater = async (ml: number) => {
    setAdding(true);
    await supabase.from('water_intake').insert({ user_id: userId, amount_ml: ml, logged_at: today });
    setIntakeMl(prev => prev + ml);
    setAdding(false);
  };

  const pct = Math.min((intakeMl / goalMl) * 100, 100);
  const glasses = Math.round(intakeMl / 250);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Droplets size={16} className="text-blue-400" />
          </div>
          <h3 className="font-semibold text-white">Water Intake</h3>
        </div>
        <span className="text-xs text-dark-400">{(intakeMl / 1000).toFixed(1)}L / {goalMl / 1000}L</span>
      </div>

      <div className="flex items-end gap-1 mb-3">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-all duration-300 ${
              i < Math.floor(pct / 10) ? 'bg-blue-500' : 'bg-dark-700'
            }`}
            style={{ height: `${20 + i * 3}px` }}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-dark-400">{glasses} glasses</span>
        <div className="progress-bar flex-1 mx-3">
          <div className="progress-fill bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-sm text-blue-400 font-medium">{Math.round(pct)}%</span>
      </div>

      <div className="flex gap-2">
        {[250, 500, 750].map(ml => (
          <button
            key={ml}
            onClick={() => addWater(ml)}
            disabled={adding}
            className="flex-1 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-blue-400 text-xs font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
          >
            +{ml}ml
          </button>
        ))}
      </div>
    </div>
  );
}

function LogWorkoutModal({ onClose, onLogged }: { onClose: () => void; onLogged: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('30');
  const [calories, setCalories] = useState('300');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    await supabase.from('user_workout_logs').insert({
      user_id: user.id,
      workout_title: title,
      duration_minutes: parseInt(duration),
      calories_burned: parseInt(calories),
      notes,
      completed_at: new Date().toISOString(),
    });

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const { data: streak } = await supabase.from('streaks').select('*').eq('user_id', user.id).maybeSingle();
    if (streak) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const isConsecutive = streak.last_workout_date === yesterday || streak.last_workout_date === today;
      const newStreak = isConsecutive && streak.last_workout_date !== today ? streak.current_streak + 1 : 1;
      await supabase.from('streaks').update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, streak.longest_streak),
        last_workout_date: today,
        updated_at: new Date().toISOString(),
      }).eq('user_id', user.id);
    }

    setLoading(false);
    onLogged();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card w-full max-w-md animate-slide-up">
        <h2 className="text-xl font-bold text-white mb-6">Log Workout</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Workout Name</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Morning Run, Push Day"
              required
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Duration (min)</label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)} min="1" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Calories Burned</label>
              <input type="number" value={calories} onChange={e => setCalories(e.target.value)} min="0" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How did it feel?"
              rows={3}
              className="input-field resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Log Workout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }: Props) {
  const { user, profile } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [recentLogs, setRecentLogs] = useState<WorkoutLog[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [weeklyCalories, setWeeklyCalories] = useState(0);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(0);
  const [loading, setLoading] = useState(true);

  const quote = MOTIVATIONAL_QUOTES[new Date().getDay() % MOTIVATIONAL_QUOTES.length];
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchData = async () => {
    if (!user) return;

    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const today = new Date().toISOString().split('T')[0];

    const [workoutsRes, logsRes, streakRes, challengesRes, completedRes] = await Promise.all([
      supabase.from('workouts').select('*').eq('is_published', true).limit(6),
      supabase.from('user_workout_logs').select('*').eq('user_id', user.id).gte('completed_at', weekAgo).order('completed_at', { ascending: false }),
      supabase.from('streaks').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('daily_challenges').select('*').eq('challenge_date', today).eq('is_active', true),
      supabase.from('user_challenge_completions').select('challenge_id').eq('user_id', user.id),
    ]);

    setWorkouts(workoutsRes.data || []);
    setRecentLogs(logsRes.data || []);
    setStreak(streakRes.data);
    setChallenges(challengesRes.data || []);
    setCompletedChallenges((completedRes.data || []).map((c: { challenge_id: string }) => c.challenge_id));

    if (logsRes.data) {
      setWeeklyCalories(logsRes.data.reduce((s, l) => s + (l.calories_burned || 0), 0));
      setWeeklyWorkouts(logsRes.data.length);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const completeChallenge = async (challengeId: string) => {
    if (!user || completedChallenges.includes(challengeId)) return;
    await supabase.from('user_challenge_completions').insert({ user_id: user.id, challenge_id: challengeId });
    setCompletedChallenges(prev => [...prev, challengeId]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-3 sm:px-6 max-w-7xl mx-auto mobile-section">
      {showLogModal && (
        <LogWorkoutModal
          onClose={() => setShowLogModal(false)}
          onLogged={fetchData}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 animate-fade-in gap-3">
        <div className="min-w-0">
          <p className="text-dark-400 text-xs sm:text-sm mb-1">{greeting()},</p>
          <h1 className="text-2xl sm:text-3xl font-black text-white truncate">
            {profile?.full_name?.split(' ')[0] || profile?.username || 'Athlete'} 👊
          </h1>
          <p className="text-dark-400 mt-1 italic text-xs sm:text-sm line-clamp-2">"{quote.text}"</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLogModal(true)}
            className="btn-primary flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Log</span> Workout
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
        {[
          {
            label: 'Current Streak',
            value: streak?.current_streak || 0,
            unit: 'days',
            icon: Flame,
            color: 'text-accent-400',
            bg: 'bg-accent-500/10',
            border: 'border-accent-500/20',
          },
          {
            label: 'Weekly Calories',
            value: weeklyCalories.toLocaleString(),
            unit: 'kcal',
            icon: Zap,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/20',
          },
          {
            label: 'Workouts This Week',
            value: weeklyWorkouts,
            unit: 'sessions',
            icon: Target,
            color: 'text-primary-400',
            bg: 'bg-primary-500/10',
            border: 'border-primary-500/20',
          },
          {
            label: 'Best Streak',
            value: streak?.longest_streak || 0,
            unit: 'days',
            icon: Trophy,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
          },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`card border ${stat.border} animate-slide-up`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-dark-400">{stat.unit}</p>
            <p className="text-sm text-dark-300 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recommended Workouts */}
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Recommended Workouts</h2>
              <button
                onClick={() => onNavigate('explore')}
                className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1 transition-colors"
              >
                View all <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workouts.slice(0, 4).map(workout => {
                const cat = CATEGORY_COLORS[workout.category] || CATEGORY_COLORS.strength;
                return (
                  <div key={workout.id} className="card-hover group overflow-hidden">
                    <div className="relative h-36 -mx-6 -mt-6 mb-4 overflow-hidden">
                      <img
                        src={workout.image_url || 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg'}
                        alt={workout.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {workout.is_premium && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-medium">
                            <Crown size={10} /> Premium
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white text-sm leading-tight flex-1 pr-2">{workout.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0 ${cat.bg} ${cat.text} ${cat.border}`}>
                        {workout.category.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-dark-400">
                      <span>{workout.duration_minutes} min</span>
                      <span>•</span>
                      <span>{workout.calories_burned} kcal</span>
                      <span>•</span>
                      <span className="capitalize">{workout.difficulty}</span>
                    </div>
                    <button
                      onClick={() => setShowLogModal(true)}
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 rounded-xl text-primary-400 text-xs font-medium transition-all duration-200"
                    >
                      <Play size={12} /> Start Workout
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              <button
                onClick={() => onNavigate('progress')}
                className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1 transition-colors"
              >
                View all <ChevronRight size={14} />
              </button>
            </div>
            <div className="card">
              {recentLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Dumbbell size={32} className="text-dark-600 mx-auto mb-3" />
                  <p className="text-dark-400 text-sm">No workouts logged this week.</p>
                  <button
                    onClick={() => setShowLogModal(true)}
                    className="mt-3 text-primary-400 hover:text-primary-300 text-sm transition-colors"
                  >
                    Log your first workout
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentLogs.slice(0, 5).map((log, i) => (
                    <div key={log.id} className="flex items-center gap-4 p-3 bg-dark-900/50 rounded-xl">
                      <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Dumbbell size={18} className="text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{log.workout_title || 'Workout'}</p>
                        <p className="text-xs text-dark-400">
                          {new Date(log.completed_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-white">{log.duration_minutes} min</p>
                        <p className="text-xs text-accent-400">{log.calories_burned} kcal</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Water Tracker */}
          {user && <WaterTracker userId={user.id} />}

          {/* Daily Challenges */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <Star size={16} className="text-primary-400" />
              </div>
              <h3 className="font-semibold text-white">Daily Challenges</h3>
            </div>
            {challenges.length === 0 ? (
              <p className="text-dark-400 text-sm text-center py-4">No challenges today. Check back tomorrow!</p>
            ) : (
              <div className="space-y-2">
                {challenges.map(ch => {
                  const done = completedChallenges.includes(ch.id);
                  return (
                    <div
                      key={ch.id}
                      className={`p-3 rounded-xl border transition-all duration-200 ${
                        done
                          ? 'bg-primary-500/10 border-primary-500/20'
                          : 'bg-dark-900/50 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${done ? 'text-primary-400' : 'text-white'}`}>
                            {ch.title}
                          </p>
                          <p className="text-xs text-dark-400 mt-0.5">{ch.description}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${
                              ch.difficulty === 'easy' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' :
                              ch.difficulty === 'hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            }`}>
                              {ch.difficulty}
                            </span>
                            <span className="text-xs text-dark-400">{ch.points} pts</span>
                          </div>
                        </div>
                        <button
                          onClick={() => completeChallenge(ch.id)}
                          disabled={done}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                            done
                              ? 'bg-primary-500 text-white'
                              : 'bg-dark-700 hover:bg-dark-600 text-dark-400'
                          }`}
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weekly Progress */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-accent-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-accent-400" />
              </div>
              <h3 className="font-semibold text-white">Weekly Progress</h3>
            </div>
            {(() => {
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              const today = new Date().getDay();
              const workoutDays = new Set(
                recentLogs.map(l => {
                  const d = new Date(l.completed_at).getDay();
                  return d === 0 ? 6 : d - 1;
                })
              );
              return (
                <div className="flex items-end justify-between gap-1">
                  {days.map((day, i) => {
                    const isToday = (today === 0 ? 6 : today - 1) === i;
                    const hasWorkout = workoutDays.has(i);
                    return (
                      <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                        <div
                          className={`w-full rounded-lg transition-all duration-300 ${
                            hasWorkout ? 'bg-primary-500' : isToday ? 'bg-dark-600 border-2 border-primary-500/50' : 'bg-dark-700'
                          }`}
                          style={{ height: hasWorkout ? '48px' : '24px' }}
                        />
                        <span className={`text-[10px] ${isToday ? 'text-primary-400 font-semibold' : 'text-dark-500'}`}>{day}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
              <span className="text-xs text-dark-400">Goal: 5 days/week</span>
              <span className="text-xs text-primary-400 font-medium">{weeklyWorkouts}/5 done</span>
            </div>
          </div>

          {/* Subscription Banner */}
          {profile?.subscription_tier === 'free' && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500/10 via-dark-800/60 to-accent-500/10 border border-primary-500/20 p-4 animate-fade-in" style={{ animationDelay: '0.25s' }}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={16} className="text-yellow-400" />
                  <span className="text-sm font-bold text-white">Upgrade to Premium</span>
                </div>
                <p className="text-dark-400 text-xs mb-3">Unlock AI coaching, unlimited workouts, and advanced analytics.</p>
                <button
                  onClick={() => onNavigate('settings')}
                  className="w-full py-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Upgrade for $12/mo
                </button>
              </div>
            </div>
          )}

          {/* AI Recommendation */}
          <div className="card border-primary-500/10 bg-gradient-to-br from-primary-500/5 to-transparent animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <Award size={16} className="text-primary-400" />
              </div>
              <h3 className="font-semibold text-white text-sm">AI Recommendation</h3>
              <span className="px-1.5 py-0.5 bg-primary-500/20 text-primary-400 rounded text-[10px] font-medium ml-auto">AI</span>
            </div>
            <p className="text-dark-400 text-xs leading-relaxed">
              {weeklyWorkouts >= 3
                ? "You're crushing it! Based on your activity, try adding a mobility session today to enhance recovery and flexibility."
                : weeklyWorkouts === 0
                ? "Start strong this week! I recommend a 30-minute beginner cardio session to build momentum."
                : "Keep up the momentum! A strength training session focused on compound movements would complement your recent workouts."}
            </p>
            <button
              onClick={() => onNavigate('explore')}
              className="mt-3 w-full py-2 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 rounded-xl text-primary-400 text-xs font-medium transition-all duration-200"
            >
              Find Recommended Workout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
