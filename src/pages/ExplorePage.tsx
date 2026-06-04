import React, { useEffect, useState } from 'react';
import {
  Search, Filter, X, Crown, Clock, Flame, ChevronDown, Bookmark,
  Play, BookmarkCheck, Dumbbell, Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Workout } from '../lib/supabase';

type Props = { onNavigate: (page: string) => void };

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'weight_loss', label: 'Weight Loss' },
  { id: 'muscle_gain', label: 'Muscle Gain' },
  { id: 'home', label: 'Home' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'strength', label: 'Strength' },
];

const DIFFICULTIES = ['all', 'beginner', 'intermediate', 'advanced'];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  weight_loss: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  muscle_gain: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  home: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  cardio: { bg: 'bg-primary-500/10', text: 'text-primary-400', border: 'border-primary-500/20' },
  yoga: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  strength: { bg: 'bg-accent-500/10', text: 'text-accent-400', border: 'border-accent-500/20' },
};

const DIFFICULTY_STYLE: Record<string, string> = {
  beginner: 'text-primary-400 bg-primary-500/10 border-primary-500/20',
  intermediate: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  advanced: 'text-red-400 bg-red-500/10 border-red-500/20',
};

function WorkoutDetailModal({ workout, onClose, onLog, isSaved, onToggleSave }: {
  workout: Workout;
  onClose: () => void;
  onLog: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const cat = CATEGORY_STYLES[workout.category] || CATEGORY_STYLES.strength;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="relative h-52 -mx-6 -mt-6 mb-6 overflow-hidden rounded-t-2xl">
          <img
            src={workout.image_url || 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg'}
            alt={workout.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-dark-900/80 rounded-xl flex items-center justify-center hover:bg-dark-800 transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
          {workout.is_premium && (
            <span className="absolute top-4 left-4 flex items-center gap-1 px-2.5 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-medium">
              <Crown size={10} /> Premium
            </span>
          )}
        </div>

        <div className="flex items-start justify-between mb-3">
          <h2 className="text-xl font-bold text-white flex-1 pr-4">{workout.title}</h2>
          <button onClick={onToggleSave} className="text-dark-400 hover:text-primary-400 transition-colors flex-shrink-0">
            {isSaved ? <BookmarkCheck size={20} className="text-primary-400" /> : <Bookmark size={20} />}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${cat.bg} ${cat.text} ${cat.border}`}>
            {workout.category.replace('_', ' ')}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${DIFFICULTY_STYLE[workout.difficulty]}`}>
            {workout.difficulty}
          </span>
        </div>

        <p className="text-dark-300 text-sm leading-relaxed mb-6">{workout.description}</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Clock, label: 'Duration', value: `${workout.duration_minutes} min` },
            { icon: Flame, label: 'Calories', value: `${workout.calories_burned} kcal` },
            { icon: Star, label: 'Level', value: workout.difficulty },
          ].map(stat => (
            <div key={stat.label} className="bg-dark-900/50 rounded-xl p-3 text-center">
              <stat.icon size={16} className="text-primary-400 mx-auto mb-1" />
              <p className="text-white font-semibold text-sm">{stat.value}</p>
              <p className="text-dark-400 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => { onLog(); onClose(); }}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Play size={16} /> Start & Log Workout
        </button>
      </div>
    </div>
  );
}

export default function ExplorePage({ onNavigate }: Props) {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [tab, setTab] = useState<'workouts' | 'exercises'>('workouts');

  useEffect(() => {
    const fetchAll = async () => {
      const [workoutsRes, exercisesRes] = await Promise.all([
        supabase.from('workouts').select('*').eq('is_published', true).order('created_at', { ascending: false }),
        supabase.from('exercises').select('*').order('name'),
      ]);
      setWorkouts(workoutsRes.data || []);
      setExercises(exercisesRes.data || []);

      if (user) {
        const { data: saved } = await supabase
          .from('saved_workouts')
          .select('workout_id')
          .eq('user_id', user.id);
        setSavedIds((saved || []).map((s: { workout_id: string }) => s.workout_id));
      }
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  const filteredWorkouts = workouts.filter(w => {
    const matchesSearch = w.title.toLowerCase().includes(search.toLowerCase()) ||
      w.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'all' || w.category === category;
    const matchesDiff = difficulty === 'all' || w.difficulty === difficulty;
    return matchesSearch && matchesCat && matchesDiff;
  });

  const filteredExercises = exercises.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.muscle_group.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSave = async (workoutId: string) => {
    if (!user) { onNavigate('login'); return; }
    if (savedIds.includes(workoutId)) {
      await supabase.from('saved_workouts').delete().eq('user_id', user.id).eq('workout_id', workoutId);
      setSavedIds(prev => prev.filter(id => id !== workoutId));
    } else {
      await supabase.from('saved_workouts').insert({ user_id: user.id, workout_id: workoutId });
      setSavedIds(prev => [...prev, workoutId]);
    }
  };

  const LogModal = () => {
    const [title, setTitle] = useState(selectedWorkout?.title || '');
    const [duration, setDuration] = useState(selectedWorkout?.duration_minutes?.toString() || '30');
    const [calories, setCalories] = useState(selectedWorkout?.calories_burned?.toString() || '300');
    const [submitting, setSubmitting] = useState(false);

    const handleLog = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      setSubmitting(true);
      await supabase.from('user_workout_logs').insert({
        user_id: user.id,
        workout_id: selectedWorkout?.id,
        workout_title: title,
        duration_minutes: parseInt(duration),
        calories_burned: parseInt(calories),
        completed_at: new Date().toISOString(),
      });
      setSubmitting(false);
      setShowLogModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="card w-full max-w-sm animate-slide-up">
          <h2 className="text-lg font-bold text-white mb-4">Log Workout</h2>
          <form onSubmit={handleLog} className="space-y-4">
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input-field" required />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="input-field" placeholder="Minutes" />
              <input type="number" value={calories} onChange={e => setCalories(e.target.value)} className="input-field" placeholder="Calories" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowLogModal(false)} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1 text-sm py-2">
                {submitting ? '...' : 'Log'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 max-w-7xl mx-auto">
      {selectedWorkout && (
        <WorkoutDetailModal
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
          onLog={() => { setShowLogModal(true); }}
          isSaved={savedIds.includes(selectedWorkout.id)}
          onToggleSave={() => toggleSave(selectedWorkout.id)}
        />
      )}
      {showLogModal && <LogModal />}

      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-black text-white mb-1">Explore</h1>
        <p className="text-dark-400">Discover workouts and exercises tailored to your goals</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-up">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search workouts, exercises..."
            className="input-field pl-10 w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-medium ${
            showFilters || category !== 'all' || difficulty !== 'all'
              ? 'bg-primary-500/10 border-primary-500/20 text-primary-400'
              : 'btn-secondary'
          }`}
        >
          <Filter size={16} />
          Filters
          {(category !== 'all' || difficulty !== 'all') && (
            <span className="w-4 h-4 bg-primary-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {(category !== 'all' ? 1 : 0) + (difficulty !== 'all' ? 1 : 0)}
            </span>
          )}
          <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card mb-6 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-2 uppercase tracking-wider">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
                      category === cat.id
                        ? 'bg-primary-500/20 text-primary-400 border-primary-500/30'
                        : 'bg-dark-800 text-dark-400 border-white/5 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-2 uppercase tracking-wider">Difficulty</label>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 capitalize ${
                      difficulty === d
                        ? 'bg-primary-500/20 text-primary-400 border-primary-500/30'
                        : 'bg-dark-800 text-dark-400 border-white/5 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    {d === 'all' ? 'All Levels' : d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['workouts', 'exercises'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 capitalize ${
              tab === t
                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                : 'text-dark-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t} {t === 'workouts' ? `(${filteredWorkouts.length})` : `(${filteredExercises.length})`}
          </button>
        ))}
      </div>

      {/* Category Pills */}
      {tab === 'workouts' && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                category === cat.id
                  ? 'bg-primary-500/10 text-primary-400 border-primary-500/20'
                  : 'text-dark-400 border-white/5 hover:text-white hover:border-white/10 bg-dark-800/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : tab === 'workouts' ? (
        filteredWorkouts.length === 0 ? (
          <div className="text-center py-20">
            <Dumbbell size={48} className="text-dark-700 mx-auto mb-4" />
            <p className="text-dark-400 text-lg mb-2">No workouts found</p>
            <p className="text-dark-500 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in">
            {filteredWorkouts.map((workout, i) => {
              const cat = CATEGORY_STYLES[workout.category] || CATEGORY_STYLES.strength;
              const isSaved = savedIds.includes(workout.id);
              return (
                <div
                  key={workout.id}
                  className="card-hover group overflow-hidden cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${i * 0.03}s` }}
                  onClick={() => setSelectedWorkout(workout)}
                >
                  <div className="relative h-44 -mx-6 -mt-6 mb-4 overflow-hidden">
                    <img
                      src={workout.image_url || 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg'}
                      alt={workout.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent" />
                    <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
                      {workout.is_premium ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-[10px] font-medium">
                          <Crown size={8} /> Premium
                        </span>
                      ) : <div />}
                      <button
                        onClick={e => { e.stopPropagation(); toggleSave(workout.id); }}
                        className="w-7 h-7 bg-dark-900/70 rounded-lg flex items-center justify-center hover:bg-dark-800 transition-all duration-200"
                      >
                        {isSaved ? (
                          <BookmarkCheck size={14} className="text-primary-400" />
                        ) : (
                          <Bookmark size={14} className="text-dark-400" />
                        )}
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${cat.bg} ${cat.text} ${cat.border}`}>
                          {workout.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2">{workout.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-dark-400 mb-3">
                    <Clock size={11} />
                    <span>{workout.duration_minutes}m</span>
                    <span>•</span>
                    <Flame size={11} />
                    <span>{workout.calories_burned} kcal</span>
                    <span>•</span>
                    <span className={`capitalize font-medium ${DIFFICULTY_STYLE[workout.difficulty]?.split(' ')[0] || 'text-dark-400'}`}>
                      {workout.difficulty}
                    </span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedWorkout(workout); }}
                    className="w-full py-2 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 rounded-xl text-primary-400 text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5"
                  >
                    <Play size={11} /> Start
                  </button>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {filteredExercises.map((exercise, i) => (
            <div key={exercise.id} className="card-hover animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-dark-700">
                  <img
                    src={exercise.image_url || 'https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg'}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm mb-1">{exercise.name}</h3>
                  <p className="text-xs text-dark-400 mb-2 line-clamp-2">{exercise.description}</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-dark-700 rounded-full text-[10px] text-dark-300 capitalize">{exercise.muscle_group.replace('_', ' ')}</span>
                    <span className="px-2 py-0.5 bg-dark-700 rounded-full text-[10px] text-dark-300 capitalize">{exercise.equipment}</span>
                  </div>
                </div>
              </div>
              {exercise.instructions && (
                <p className="mt-3 text-xs text-dark-500 border-t border-white/5 pt-3 line-clamp-2">{exercise.instructions}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
