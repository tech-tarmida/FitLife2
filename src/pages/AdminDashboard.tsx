import React, { useEffect, useState } from 'react';
import {
  Users, Dumbbell, TrendingUp, Activity, Plus, Edit3, Trash2,
  Check, X, Eye, Crown, Shield, BarChart2, Calendar, ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Workout } from '../lib/supabase';

type Props = { onNavigate: (page: string) => void };

const CATEGORIES = ['weight_loss', 'muscle_gain', 'home', 'cardio', 'yoga', 'strength'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

function WorkoutForm({ workout, onClose, onSaved }: {
  workout: Workout | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: workout?.title || '',
    description: workout?.description || '',
    category: workout?.category || 'strength',
    difficulty: workout?.difficulty || 'beginner',
    duration_minutes: workout?.duration_minutes?.toString() || '30',
    calories_burned: workout?.calories_burned?.toString() || '300',
    image_url: workout?.image_url || '',
    video_url: workout?.video_url || '',
    is_premium: workout?.is_premium || false,
    is_published: workout?.is_published !== false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...form,
      duration_minutes: parseInt(form.duration_minutes),
      calories_burned: parseInt(form.calories_burned),
      created_by: user?.id,
    };
    if (workout) {
      await supabase.from('workouts').update(payload).eq('id', workout.id);
    } else {
      await supabase.from('workouts').insert(payload);
    }
    setLoading(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card w-full max-w-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{workout ? 'Edit Workout' : 'Create Workout'}</h2>
          <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-dark-300 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                required
                className="input-field"
                placeholder="Workout title"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-dark-300 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={3}
                className="input-field resize-none"
                placeholder="Workout description"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input-field w-full">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty: e.target.value }))} className="input-field w-full">
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Duration (min)</label>
              <input type="number" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-300 mb-1">Calories</label>
              <input type="number" value={form.calories_burned} onChange={e => setForm(p => ({ ...p, calories_burned: e.target.value }))} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-dark-300 mb-1">Image URL</label>
              <input type="url" value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} className="input-field" placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-dark-300 mb-1">Video URL (optional)</label>
              <input type="url" value={form.video_url} onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))} className="input-field" placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setForm(p => ({ ...p, is_premium: !p.is_premium }))}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.is_premium ? 'bg-primary-500 border-primary-500' : 'border-white/20'}`}
              >
                {form.is_premium && <Check size={12} className="text-white" />}
              </div>
              <span className="text-sm text-dark-300">Premium Content</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setForm(p => ({ ...p, is_published: !p.is_published }))}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.is_published ? 'bg-primary-500 border-primary-500' : 'border-white/20'}`}
              >
                {form.is_published && <Check size={12} className="text-white" />}
              </div>
              <span className="text-sm text-dark-300">Published</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : workout ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard({ onNavigate }: Props) {
  const { profile } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalWorkouts: 0, totalLogs: 0, premiumUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'workouts' | 'users'>('overview');
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield size={48} className="text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400">Access denied. Admin privileges required.</p>
          <button onClick={() => onNavigate('dashboard')} className="btn-primary mt-4 text-sm">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const fetchData = async () => {
    const [workoutsRes, profilesRes, logsRes, premiumRes] = await Promise.all([
      supabase.from('workouts').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, username, full_name, subscription_tier, is_admin, created_at').order('created_at', { ascending: false }).limit(20),
      supabase.from('user_workout_logs').select('id', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' }).neq('subscription_tier', 'free'),
    ]);
    setWorkouts(workoutsRes.data || []);
    setUsers(profilesRes.data || []);
    setStats({
      totalUsers: profilesRes.data?.length || 0,
      totalWorkouts: workoutsRes.data?.length || 0,
      totalLogs: logsRes.count || 0,
      premiumUsers: premiumRes.count || 0,
    });
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const deleteWorkout = async (id: string) => {
    if (!confirm('Delete this workout? This action cannot be undone.')) return;
    await supabase.from('workouts').delete().eq('id', id);
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const togglePublish = async (workout: Workout) => {
    await supabase.from('workouts').update({ is_published: !workout.is_published }).eq('id', workout.id);
    setWorkouts(prev => prev.map(w => w.id === workout.id ? { ...w, is_published: !w.is_published } : w));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 max-w-7xl mx-auto">
      {(showWorkoutForm || editingWorkout) && (
        <WorkoutForm
          workout={editingWorkout}
          onClose={() => { setShowWorkoutForm(false); setEditingWorkout(null); }}
          onSaved={fetchData}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={20} className="text-primary-400" />
            <span className="text-primary-400 text-sm font-medium">Admin Panel</span>
          </div>
          <h1 className="text-3xl font-black text-white">Dashboard</h1>
        </div>
        <button
          onClick={() => setShowWorkoutForm(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> New Workout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Workout Plans', value: stats.totalWorkouts, icon: Dumbbell, color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { label: 'Workouts Logged', value: stats.totalLogs, icon: Activity, color: 'text-accent-400', bg: 'bg-accent-500/10' },
          { label: 'Premium Users', value: stats.premiumUsers, icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['overview', 'workouts', 'users'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 capitalize ${
              activeTab === tab
                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                : 'text-dark-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {/* Recent Workouts */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Dumbbell size={18} className="text-primary-400" /> Recent Workouts
              </h2>
              <button onClick={() => setActiveTab('workouts')} className="text-primary-400 hover:text-primary-300 text-xs transition-colors">View all</button>
            </div>
            <div className="space-y-2">
              {workouts.slice(0, 5).map(w => (
                <div key={w.id} className="flex items-center gap-3 p-2.5 bg-dark-900/50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-dark-700">
                    <img src={w.image_url} alt={w.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{w.title}</p>
                    <p className="text-xs text-dark-400 capitalize">{w.category.replace('_', ' ')} • {w.difficulty}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${w.is_published ? 'bg-primary-500' : 'bg-dark-500'}`} />
                    {w.is_premium && <Crown size={12} className="text-yellow-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-primary-400" /> Recent Users
              </h2>
              <button onClick={() => setActiveTab('users')} className="text-primary-400 hover:text-primary-300 text-xs transition-colors">View all</button>
            </div>
            <div className="space-y-2">
              {users.slice(0, 5).map(u => (
                <div key={u.id} className="flex items-center gap-3 p-2.5 bg-dark-900/50 rounded-xl">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500/60 to-accent-500/60 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(u.full_name || u.username || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{u.full_name || u.username}</p>
                    <p className="text-xs text-dark-400">{new Date(u.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {u.is_admin && <Shield size={12} className="text-primary-400" />}
                    {u.subscription_tier !== 'free' && <Crown size={12} className="text-yellow-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Workouts Management */}
      {activeTab === 'workouts' && (
        <div className="card animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">All Workouts ({workouts.length})</h2>
            <button onClick={() => setShowWorkoutForm(true)} className="btn-primary text-sm py-2 flex items-center gap-2">
              <Plus size={14} /> Add Workout
            </button>
          </div>
          <div className="space-y-2">
            {workouts.map(w => (
              <div key={w.id} className="flex items-center gap-4 p-3 bg-dark-900/50 rounded-xl hover:bg-dark-900/70 transition-colors">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-dark-700">
                  <img src={w.image_url} alt={w.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{w.title}</p>
                    {w.is_premium && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full text-[10px] border border-yellow-500/20">
                        <Crown size={8} /> Premium
                      </span>
                    )}
                    <span className={`w-2 h-2 rounded-full ${w.is_published ? 'bg-primary-500' : 'bg-dark-500'}`} />
                    <span className="text-[10px] text-dark-500">{w.is_published ? 'Published' : 'Draft'}</span>
                  </div>
                  <p className="text-xs text-dark-400 capitalize">{w.category.replace('_', ' ')} • {w.difficulty} • {w.duration_minutes}min</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => togglePublish(w)}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      w.is_published
                        ? 'bg-primary-500/10 text-primary-400 hover:bg-primary-500/20'
                        : 'bg-dark-700 text-dark-400 hover:bg-dark-600 hover:text-white'
                    }`}
                    title={w.is_published ? 'Unpublish' : 'Publish'}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => setEditingWorkout(w)}
                    className="p-1.5 rounded-lg bg-dark-700 text-dark-400 hover:bg-dark-600 hover:text-white transition-all duration-200"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => deleteWorkout(w.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Management */}
      {activeTab === 'users' && (
        <div className="card animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">All Users ({users.length})</h2>
          </div>
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-4 p-3 bg-dark-900/50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/60 to-accent-500/60 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(u.full_name || u.username || 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{u.full_name || u.username || 'Anonymous'}</p>
                    {u.is_admin && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-primary-500/10 text-primary-400 rounded-full text-[10px] border border-primary-500/20">
                        <Shield size={8} /> Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-dark-400">
                    Joined {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    u.subscription_tier === 'premium'
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      : u.subscription_tier === 'pro'
                      ? 'bg-primary-500/10 text-primary-400 border-primary-500/20'
                      : 'bg-dark-700 text-dark-400 border-white/5'
                  } capitalize`}>
                    {u.subscription_tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
