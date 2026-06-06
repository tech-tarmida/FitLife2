import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Play, Pause, SkipForward, RotateCcw, X, Check,
  ChevronRight, Flame, Clock, Dumbbell, Trophy, ArrowLeft,
  Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Workout, WorkoutExercise, Exercise } from '../lib/supabase';
import ExerciseAnimation from '../components/ExerciseAnimation';
import ExerciseVideo from '../components/ExerciseVideo';
import CountdownTimer from '../components/CountdownTimer';

type SessionPhase = 'preview' | 'countdown' | 'exercising' | 'resting' | 'complete';

type Props = {
  workout: Workout;
  onNavigate: (page: string) => void;
  onComplete?: () => void;
};

export default function WorkoutSessionPage({ workout, onNavigate, onComplete }: Props) {
  const { user, profile } = useAuth();
  const isPremium = profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'pro';

  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<SessionPhase>('preview');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [countdownValue, setCountdownValue] = useState(3);
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set());
  const [skippedSet, setSkippedSet] = useState<Set<number>>(new Set());
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const calorieRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentWE = exercises[currentIndex];
  const currentExercise = currentWE?.exercises;

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('workout_exercises')
        .select('*, exercises(*)')
        .eq('workout_id', workout.id)
        .order('order_index', { ascending: true });

      if (data && data.length > 0) {
        setExercises(data);
      } else {
        const { data: all } = await supabase.from('exercises').select('*').limit(8);
        if (all) {
          const synth: WorkoutExercise[] = all.map((ex: Exercise, i: number) => ({
            id: ex.id,
            workout_id: workout.id,
            exercise_id: ex.id,
            sets: 3,
            reps: 12,
            duration_seconds: 30,
            rest_seconds: workout.duration_tier === 'short' ? 15 : workout.duration_tier === 'long' ? 45 : 30,
            order_index: i,
            exercises: ex,
          }));
          setExercises(synth);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [workout.id, workout.duration_tier]);

  // Global elapsed time counter
  useEffect(() => {
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    if (calorieRef.current) clearInterval(calorieRef.current);

    if (phase === 'exercising' && !isPaused) {
      elapsedRef.current = setInterval(() => setTotalElapsed(p => p + 1), 1000);
      const cpm = currentExercise?.calories_per_minute || 5;
      const perSec = cpm / 60;
      calorieRef.current = setInterval(() => setTotalCalories(p => p + perSec), 1000);
    }

    return () => {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      if (calorieRef.current) clearInterval(calorieRef.current);
    };
  }, [phase, isPaused, currentExercise?.calories_per_minute]);

  const createSession = useCallback(async () => {
    if (!user) return null;
    const { data } = await supabase
      .from('user_workout_sessions')
      .insert({ user_id: user.id, workout_id: workout.id, status: 'in_progress', current_exercise_index: 0 })
      .select('id')
      .maybeSingle();
    if (data) { setSessionId(data.id); return data.id; }
    return null;
  }, [user, workout.id]);

  const startSession = useCallback(async () => {
    await createSession();
    setPhase('countdown');
    setCountdownValue(3);
  }, [createSession]);

  // 3-2-1 countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdownValue <= 0) { setPhase('exercising'); return; }
    const t = setTimeout(() => setCountdownValue(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdownValue]);

  const exDuration = (we: WorkoutExercise) => we.duration_seconds || 30;
  const restDuration = () => currentWE?.rest_seconds || 30;

  const handleExerciseComplete = useCallback(() => {
    setCompletedSet(prev => new Set([...prev, currentIndex]));
    if (user && sessionId && currentExercise) {
      supabase.from('session_exercise_logs').insert({
        session_id: sessionId, exercise_id: currentExercise.id,
        order_index: currentIndex, duration_seconds: exDuration(currentWE!),
        reps_completed: currentWE?.reps || 0, sets_completed: currentWE?.sets || 1,
        skipped: false, completed_at: new Date().toISOString(),
      }).then(() => {});
    }
    if (currentIndex < exercises.length - 1) {
      setPhase('resting');
    } else {
      finishSession();
    }
  }, [currentIndex, exercises.length, user, sessionId, currentExercise, currentWE]);

  const handleRestComplete = useCallback(() => {
    setCurrentIndex(p => p + 1);
    setPhase('exercising');
  }, []);

  const handleSkip = () => {
    setSkippedSet(prev => new Set([...prev, currentIndex]));
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(p => p + 1);
      setPhase('exercising');
    } else {
      finishSession();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCompletedSet(new Set());
    setSkippedSet(new Set());
    setTotalElapsed(0);
    setTotalCalories(0);
    setPhase('preview');
  };

  const finishSession = async () => {
    setPhase('complete');
    if (!user) return;
    if (sessionId) {
      await supabase.from('user_workout_sessions').update({
        status: 'completed', completed_at: new Date().toISOString(),
        total_duration_seconds: totalElapsed, calories_burned: Math.round(totalCalories),
      }).eq('id', sessionId);
    }
    await supabase.from('user_workout_logs').insert({
      user_id: user.id, workout_id: workout.id, workout_title: workout.title,
      duration_minutes: Math.round(totalElapsed / 60), calories_burned: Math.round(totalCalories),
      completed_at: new Date().toISOString(),
    });
    const { data: existing } = await supabase.from('streaks').select('*').eq('user_id', user.id).maybeSingle();
    if (existing) {
      const lastDate = existing.last_workout_date;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newStreak = (lastDate === yesterday || lastDate === today) ? existing.current_streak + (lastDate === today ? 0 : 1) : 1;
      const longest = Math.max(existing.longest_streak, newStreak);
      await supabase.from('streaks').update({
        current_streak: newStreak, longest_streak: longest, last_workout_date: today, updated_at: new Date().toISOString(),
      }).eq('user_id', user.id);
    } else {
      await supabase.from('streaks').insert({
        user_id: user.id, current_streak: 1, longest_streak: 1, last_workout_date: new Date().toISOString().split('T')[0],
      });
    }
    if (onComplete) onComplete();
  };

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6">
        <div className="card text-center">
          <Dumbbell size={48} className="text-dark-700 mx-auto mb-4" />
          <p className="text-dark-400 mb-4">No exercises found for this workout</p>
          <button onClick={() => onNavigate('explore')} className="btn-primary">Back to Explore</button>
        </div>
      </div>
    );
  }

  // UPGRADE MODAL
  if (showUpgradeModal) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 animate-fade-in">
        <div className="card max-w-sm w-full text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
            <Crown size={28} className="text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Unlock Premium</h2>
          <p className="text-dark-400 text-sm mb-6">Get video demonstrations for every exercise, plus advanced analytics and unlimited workouts.</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => onNavigate('settings')} className="btn-primary w-full">Upgrade to Premium</button>
            <button onClick={() => setShowUpgradeModal(false)} className="btn-secondary w-full text-sm py-2.5">Continue with Animation</button>
          </div>
        </div>
      </div>
    );
  }

  // PREVIEW
  if (phase === 'preview') {
    return (
      <div className="min-h-screen bg-dark-950 pt-4 pb-8 px-4 sm:px-6 max-w-2xl mx-auto animate-fade-in">
        <button onClick={() => onNavigate('explore')} className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="card mb-6">
          <h1 className="text-2xl font-black text-white mb-2">{workout.title}</h1>
          <p className="text-dark-400 text-sm mb-5">{workout.description}</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: Clock, label: 'Duration', value: `${workout.duration_minutes} min` },
              { icon: Flame, label: 'Calories', value: `${workout.calories_burned} kcal` },
              { icon: Dumbbell, label: 'Exercises', value: `${exercises.length}` },
            ].map(s => (
              <div key={s.label} className="bg-dark-900/50 rounded-xl p-3 text-center">
                <s.icon size={16} className="text-primary-400 mx-auto mb-1" />
                <p className="text-white font-semibold text-sm">{s.value}</p>
                <p className="text-dark-400 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
          {workout.is_premium && !isPremium && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3">
              <Crown size={20} className="text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-yellow-400 font-medium text-sm">Premium Workout</p>
                <p className="text-dark-400 text-xs">You'll see animated guides. Upgrade for video demonstrations.</p>
              </div>
            </div>
          )}
        </div>
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-3">Exercise List</h2>
          <div className="space-y-2">
            {exercises.map((we, i) => (
              <div key={we.id || i} className="flex items-center gap-3 p-3 bg-dark-800/40 rounded-xl">
                <span className="w-7 h-7 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 text-xs font-bold flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{we.exercises?.name || 'Exercise'}</p>
                  <p className="text-dark-400 text-xs">{we.sets} sets x {we.reps} reps{we.duration_seconds ? ` - ${we.duration_seconds}s` : ''}</p>
                </div>
                <span className="text-dark-500 text-xs">{we.rest_seconds}s rest</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={startSession} className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4">
          <Play size={20} /> Start Workout
        </button>
      </div>
    );
  }

  // 3-2-1 COUNTDOWN
  if (phase === 'countdown') {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <p className="text-dark-400 text-sm uppercase tracking-widest font-medium">Get Ready</p>
          <div className={`w-32 h-32 flex items-center justify-center rounded-full border-4 ${countdownValue <= 1 ? 'border-primary-400' : 'border-dark-600'}`}>
            <span className="text-6xl font-black text-white animate-pulse">{countdownValue}</span>
          </div>
          <p className="text-dark-500 text-sm">{currentExercise?.name || 'Starting...'}</p>
        </div>
      </div>
    );
  }

  // EXERCISING
  if (phase === 'exercising') {
    const dur = exDuration(currentWE!);
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col animate-fade-in">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <button onClick={handleRestart} className="text-dark-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-dark-400 text-xs font-medium">{currentIndex + 1} / {exercises.length}</span>
            <div className="flex gap-0.5">
              {exercises.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-6 bg-primary-400' :
                  completedSet.has(i) ? 'w-3 bg-primary-600' :
                  skippedSet.has(i) ? 'w-3 bg-dark-600' : 'w-3 bg-dark-700'
                }`} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-dark-400">
            <span className="flex items-center gap-1"><Clock size={12} /> {fmtTime(totalElapsed)}</span>
            <span className="flex items-center gap-1"><Flame size={12} /> {Math.round(totalCalories)}</span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 gap-4">
          <div className="text-center">
            <h2 className="text-xl font-black text-white mb-1">{currentExercise?.name}</h2>
            <div className="flex items-center justify-center gap-3 text-xs text-dark-400">
              {currentWE?.sets && <span>{currentWE.sets} sets</span>}
              {currentWE?.reps && <span>x {currentWE.reps} reps</span>}
              {currentExercise?.muscle_group && (
                <span className="capitalize px-2 py-0.5 bg-dark-700 rounded-full text-dark-300">
                  {currentExercise.muscle_group.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>

          <CountdownTimer duration={dur} isPaused={isPaused} onComplete={handleExerciseComplete} size="lg" label="remaining" />

          {/* Animation / Video */}
          <div className="w-full max-w-xs h-48 sm:h-56">
            {isPremium && currentExercise?.video_url ? (
              <ExerciseVideo videoUrl={currentExercise.video_url} isActive={!isPaused} isPremium={isPremium} onUpgradeClick={() => setShowUpgradeModal(true)} />
            ) : currentExercise?.animation_data ? (
              <ExerciseAnimation animationData={currentExercise.animation_data} isActive={!isPaused} />
            ) : (
              <div className="w-full h-full bg-dark-800/40 rounded-2xl flex items-center justify-center p-4">
                <p className="text-dark-400 text-xs text-center">{currentExercise?.instructions || 'Follow along with the exercise'}</p>
              </div>
            )}
          </div>

          {currentExercise?.instructions && (
            <p className="text-dark-400 text-xs text-center max-w-xs leading-relaxed">{currentExercise.instructions}</p>
          )}
        </div>

        {/* Controls */}
        <div className="px-4 py-6 border-t border-white/5">
          <div className="flex items-center justify-center gap-4">
            <button onClick={handleRestart} className="w-12 h-12 rounded-xl bg-dark-700 hover:bg-dark-600 flex items-center justify-center transition-colors" title="Restart">
              <RotateCcw size={18} className="text-dark-300" />
            </button>
            <button onClick={() => setIsPaused(!isPaused)} className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30 transition-all duration-200 active:scale-95">
              {isPaused ? <Play size={24} className="text-white ml-1" /> : <Pause size={24} className="text-white" />}
            </button>
            <button onClick={handleSkip} className="w-12 h-12 rounded-xl bg-dark-700 hover:bg-dark-600 flex items-center justify-center transition-colors" title="Skip">
              <SkipForward size={18} className="text-dark-300" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RESTING
  if (phase === 'resting') {
    const nextEx = exercises[currentIndex + 1]?.exercises;
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4 animate-fade-in">
        <div className="flex flex-col items-center gap-5">
          <p className="text-primary-400 text-sm uppercase tracking-widest font-semibold">Rest Period</p>
          <CountdownTimer duration={restDuration()} isPaused={isPaused} onComplete={handleRestComplete} size="lg" label="rest" />
          <div className="text-center">
            <p className="text-dark-400 text-xs mb-2">Up Next</p>
            <p className="text-white font-bold text-lg">{nextEx?.name || 'Next Exercise'}</p>
            <p className="text-dark-400 text-xs mt-1">{exercises[currentIndex + 1]?.sets} sets x {exercises[currentIndex + 1]?.reps} reps</p>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <button onClick={() => setIsPaused(!isPaused)} className="w-12 h-12 rounded-xl bg-dark-700 hover:bg-dark-600 flex items-center justify-center transition-colors">
              {isPaused ? <Play size={18} className="text-white" /> : <Pause size={18} className="text-white" />}
            </button>
            <button onClick={handleRestComplete} className="px-6 py-3 bg-primary-500/10 border border-primary-500/20 rounded-xl text-primary-400 font-semibold text-sm hover:bg-primary-500/20 transition-colors flex items-center gap-2">
              Skip Rest <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // COMPLETE
  if (phase === 'complete') {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center px-4 py-8 animate-fade-in">
        <div className="max-w-sm w-full flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-primary-500/10 border-2 border-primary-400 flex items-center justify-center animate-bounce-subtle">
            <Trophy size={36} className="text-primary-400" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-white mb-2">Workout Complete!</h1>
            <p className="text-dark-400">{workout.title}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full">
            {[
              { icon: Clock, label: 'Time', value: fmtTime(totalElapsed) },
              { icon: Flame, label: 'Calories', value: `${Math.round(totalCalories)}` },
              { icon: Check, label: 'Completed', value: `${completedSet.size}/${exercises.length}` },
            ].map(s => (
              <div key={s.label} className="card text-center py-4">
                <s.icon size={18} className="text-primary-400 mx-auto mb-2" />
                <p className="text-white font-bold">{s.value}</p>
                <p className="text-dark-400 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
          {skippedSet.size > 0 && <p className="text-dark-500 text-xs">{skippedSet.size} exercise{skippedSet.size > 1 ? 's' : ''} skipped</p>}
          <div className="flex flex-col gap-3 w-full mt-2">
            <button onClick={() => onNavigate('dashboard')} className="btn-primary w-full flex items-center justify-center gap-2">Back to Dashboard</button>
            <button onClick={() => onNavigate('explore')} className="btn-secondary w-full flex items-center justify-center gap-2">Explore More Workouts</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
