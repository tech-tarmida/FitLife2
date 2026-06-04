import React, { useState, useEffect } from 'react';
import {
  User, Camera, Scale, Ruler, Target, Activity, Award, Calendar,
  Trophy, Flame, Bookmark, Edit3, Check, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Props = { onNavigate: (page: string) => void };

export default function ProfilePage({ onNavigate }: Props) {
  const { user, profile, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    fitness_goal: '',
    activity_level: '',
    weight_kg: '',
    height_cm: '',
    gender: '',
    date_of_birth: '',
  });
  const [badges, setBadges] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalCalories: 0, savedWorkouts: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        fitness_goal: profile.fitness_goal || 'general_fitness',
        activity_level: profile.activity_level || 'moderate',
        weight_kg: profile.weight_kg?.toString() || '',
        height_cm: profile.height_cm?.toString() || '',
        gender: profile.gender || '',
        date_of_birth: profile.date_of_birth || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('user_badges').select('*, badges(*)').eq('user_id', user.id),
      supabase.from('user_workout_logs').select('calories_burned').eq('user_id', user.id),
      supabase.from('saved_workouts').select('id').eq('user_id', user.id),
    ]).then(([badgesRes, logsRes, savedRes]) => {
      setBadges(badgesRes.data || []);
      const logs = logsRes.data || [];
      setStats({
        totalWorkouts: logs.length,
        totalCalories: logs.reduce((s: number, l: any) => s + (l.calories_burned || 0), 0),
        savedWorkouts: (savedRes.data || []).length,
      });
    });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    const updates: any = { ...form };
    if (form.weight_kg) updates.weight_kg = parseFloat(form.weight_kg);
    if (form.height_cm) updates.height_cm = parseFloat(form.height_cm);
    await updateProfile(updates);
    setSaving(false);
    setEditing(false);
  };

  const FITNESS_GOALS = [
    { id: 'weight_loss', label: 'Weight Loss' },
    { id: 'muscle_gain', label: 'Muscle Gain' },
    { id: 'general_fitness', label: 'General Fitness' },
    { id: 'endurance', label: 'Endurance' },
    { id: 'flexibility', label: 'Flexibility' },
    { id: 'strength', label: 'Strength' },
  ];

  const ACTIVITY_LEVELS = [
    { id: 'sedentary', label: 'Sedentary' },
    { id: 'light', label: 'Light Activity' },
    { id: 'moderate', label: 'Moderate' },
    { id: 'active', label: 'Active' },
    { id: 'very_active', label: 'Very Active' },
  ];

  const bmi = form.weight_kg && form.height_cm
    ? (parseFloat(form.weight_kg) / Math.pow(parseFloat(form.height_cm) / 100, 2)).toFixed(1)
    : null;

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <h1 className="text-3xl font-black text-white">Profile</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Edit3 size={16} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-dark-400 hover:text-white hover:bg-white/5 text-sm transition-all"
            >
              <X size={16} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2 text-sm py-2"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="card mb-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-primary-500/20 overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                (profile?.full_name || profile?.username || 'U')[0].toUpperCase()
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center hover:bg-primary-400 transition-colors shadow-lg">
              <Camera size={12} className="text-white" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                    className="input-field text-sm py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs text-dark-400 mb-1">Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                    className="input-field text-sm py-2"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white">{profile?.full_name || 'Anonymous'}</h2>
                <p className="text-dark-400">@{profile?.username || 'user'}</p>
              </div>
            )}

            {editing ? (
              <div className="mt-3">
                <label className="block text-xs text-dark-400 mb-1">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell us about your fitness journey..."
                  rows={2}
                  className="input-field text-sm resize-none"
                />
              </div>
            ) : (
              profile?.bio && (
                <p className="text-dark-300 text-sm mt-2">{profile.bio}</p>
              )
            )}
          </div>

          {/* Stats */}
          <div className="flex sm:flex-col gap-4 sm:gap-2 sm:border-l sm:border-white/5 sm:pl-6">
            {[
              { label: 'Workouts', value: stats.totalWorkouts, icon: Activity, color: 'text-primary-400' },
              { label: 'Calories', value: stats.totalCalories.toLocaleString(), icon: Flame, color: 'text-accent-400' },
              { label: 'Saved', value: stats.savedWorkouts, icon: Bookmark, color: 'text-blue-400' },
            ].map(s => (
              <div key={s.label} className="text-center sm:text-right">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-dark-400 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fitness Details */}
        <div className="card animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-primary-400" />
            <h3 className="font-semibold text-white">Fitness Details</h3>
          </div>
          <div className="space-y-4">
            {/* Body Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-dark-400 mb-1">Weight (kg)</label>
                {editing ? (
                  <input
                    type="number"
                    step="0.1"
                    value={form.weight_kg}
                    onChange={e => setForm(p => ({ ...p, weight_kg: e.target.value }))}
                    className="input-field text-sm py-2"
                    placeholder="70"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2.5 bg-dark-900/50 rounded-xl">
                    <Scale size={14} className="text-primary-400" />
                    <span className="text-white text-sm">{profile?.weight_kg || '--'} kg</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">Height (cm)</label>
                {editing ? (
                  <input
                    type="number"
                    step="0.1"
                    value={form.height_cm}
                    onChange={e => setForm(p => ({ ...p, height_cm: e.target.value }))}
                    className="input-field text-sm py-2"
                    placeholder="175"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2.5 bg-dark-900/50 rounded-xl">
                    <Ruler size={14} className="text-primary-400" />
                    <span className="text-white text-sm">{profile?.height_cm || '--'} cm</span>
                  </div>
                )}
              </div>
            </div>

            {/* BMI Display */}
            {bmi && !editing && (
              <div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-dark-300">BMI</span>
                  <span className="text-lg font-bold text-primary-400">{bmi}</span>
                </div>
              </div>
            )}

            {/* Gender */}
            <div>
              <label className="block text-xs text-dark-400 mb-1">Gender</label>
              {editing ? (
                <select
                  value={form.gender}
                  onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                  className="input-field text-sm py-2 w-full"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <div className="flex items-center gap-2 p-2.5 bg-dark-900/50 rounded-xl">
                  <User size={14} className="text-primary-400" />
                  <span className="text-white text-sm capitalize">{profile?.gender || 'Not specified'}</span>
                </div>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs text-dark-400 mb-1">Date of Birth</label>
              {editing ? (
                <input
                  type="date"
                  value={form.date_of_birth}
                  onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))}
                  className="input-field text-sm py-2 w-full"
                />
              ) : (
                <div className="flex items-center gap-2 p-2.5 bg-dark-900/50 rounded-xl">
                  <Calendar size={14} className="text-primary-400" />
                  <span className="text-white text-sm">
                    {profile?.date_of_birth
                      ? new Date(profile.date_of_birth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : 'Not specified'}
                  </span>
                </div>
              )}
            </div>

            {/* Fitness Goal */}
            <div>
              <label className="block text-xs text-dark-400 mb-1">Primary Goal</label>
              {editing ? (
                <select
                  value={form.fitness_goal}
                  onChange={e => setForm(p => ({ ...p, fitness_goal: e.target.value }))}
                  className="input-field text-sm py-2 w-full"
                >
                  {FITNESS_GOALS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
              ) : (
                <div className="flex items-center gap-2 p-2.5 bg-dark-900/50 rounded-xl">
                  <Target size={14} className="text-primary-400" />
                  <span className="text-white text-sm">
                    {FITNESS_GOALS.find(g => g.id === profile?.fitness_goal)?.label || 'General Fitness'}
                  </span>
                </div>
              )}
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-xs text-dark-400 mb-1">Activity Level</label>
              {editing ? (
                <select
                  value={form.activity_level}
                  onChange={e => setForm(p => ({ ...p, activity_level: e.target.value }))}
                  className="input-field text-sm py-2 w-full"
                >
                  {ACTIVITY_LEVELS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              ) : (
                <div className="flex items-center gap-2 p-2.5 bg-dark-900/50 rounded-xl">
                  <Activity size={14} className="text-primary-400" />
                  <span className="text-white text-sm">
                    {ACTIVITY_LEVELS.find(a => a.id === profile?.activity_level)?.label || 'Moderate'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-6">
          <div className="card animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center gap-2 mb-4">
              <Award size={18} className="text-yellow-400" />
              <h3 className="font-semibold text-white">Achievement Badges</h3>
            </div>
            {badges.length === 0 ? (
              <div className="text-center py-6">
                <Trophy size={32} className="text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400 text-sm">Complete workouts to earn badges!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {badges.map(ub => {
                  const badge = ub.badges;
                  if (!badge) return null;
                  return (
                    <div key={ub.id} className="flex items-center gap-3 p-3 bg-dark-900/50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${badge.color}20`, border: `1px solid ${badge.color}30` }}>
                        <Award size={20} style={{ color: badge.color }} />
                      </div>
                      <div>
                        <p className="text-white text-xs font-semibold">{badge.name}</p>
                        <p className="text-dark-400 text-[10px]">{badge.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Account Info */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-primary-400" />
              <h3 className="font-semibold text-white">Account</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-dark-900/50 rounded-xl">
                <span className="text-xs text-dark-400">Email</span>
                <span className="text-xs text-white">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-dark-900/50 rounded-xl">
                <span className="text-xs text-dark-400">Plan</span>
                <span className="text-xs text-white capitalize">{profile?.subscription_tier || 'Free'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-dark-900/50 rounded-xl">
                <span className="text-xs text-dark-400">Member Since</span>
                <span className="text-xs text-white">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
