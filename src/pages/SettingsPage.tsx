import React, { useState } from 'react';
import {
  Bell, Moon, Sun, Lock, Shield, Crown, Trash2, ChevronRight,
  Globe, Smartphone, Mail, Eye, CreditCard, Check, LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Props = { onNavigate: (page: string) => void };

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0/mo',
    features: ['20 workouts', 'Basic tracking', 'Daily challenges'],
    color: 'border-white/10',
    badge: '',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$12/mo',
    features: ['Unlimited workouts', 'AI recommendations', 'Advanced analytics', 'Nutrition coaching'],
    color: 'border-primary-500/30',
    badge: 'Popular',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29/mo',
    features: ['Everything in Premium', 'Personal trainer', 'Custom meal plans', 'Live coaching'],
    color: 'border-yellow-500/30',
    badge: 'Best',
  },
];

export default function SettingsPage({ onNavigate }: Props) {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    streakAlerts: true,
    challenges: true,
    tips: false,
    email: true,
  });
  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: false,
    showProgress: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    onNavigate('landing');
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleSetting = async (key: string, value: boolean) => {
    if (key.startsWith('notif_')) {
      const notifKey = key.replace('notif_', '') as keyof typeof notifications;
      setNotifications(p => ({ ...p, [notifKey]: value }));
    } else if (key.startsWith('priv_')) {
      const privKey = key.replace('priv_', '') as keyof typeof privacySettings;
      setPrivacySettings(p => ({ ...p, [privKey]: value }));
    }
    showSaved();
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-primary-500' : 'bg-dark-600'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );

  const SettingRow = ({ icon: Icon, label, description, toggle, value, onChange, onClick }: any) => (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/3 transition-colors group">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-dark-700 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon size={15} className="text-dark-300" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          {description && <p className="text-xs text-dark-400 mt-0.5">{description}</p>}
        </div>
      </div>
      {toggle !== undefined ? (
        <ToggleSwitch checked={toggle} onChange={onChange} />
      ) : onClick ? (
        <button onClick={onClick} className="flex items-center gap-1 text-xs text-dark-400 hover:text-white transition-colors">
          {value && <span className="text-dark-300">{value}</span>}
          <ChevronRight size={14} />
        </button>
      ) : value ? (
        <span className="text-xs text-dark-400">{value}</span>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <h1 className="text-3xl font-black text-white">Settings</h1>
        {saved && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-xl text-primary-400 text-sm animate-fade-in">
            <Check size={14} /> Saved
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Subscription */}
        <div className="card animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <Crown size={18} className="text-yellow-400" />
            <h2 className="text-lg font-bold text-white">Subscription</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={`relative p-4 rounded-xl border transition-all duration-200 ${
                  profile?.subscription_tier === plan.id
                    ? 'border-primary-500/50 bg-primary-500/5'
                    : plan.color + ' bg-dark-900/50'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary-500 rounded-full text-[10px] font-bold text-white">
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-white text-sm">{plan.name}</p>
                  {profile?.subscription_tier === plan.id && (
                    <div className="w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </div>
                <p className="text-primary-400 font-semibold text-sm mb-2">{plan.price}</p>
                <ul className="space-y-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-1.5 text-[10px] text-dark-400">
                      <Check size={8} className="text-primary-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {profile?.subscription_tier !== plan.id && (
                  <button
                    className="mt-3 w-full py-1.5 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 rounded-lg text-primary-400 text-xs font-medium transition-all duration-200"
                    onClick={() => {
                      // In a real app, this would trigger Stripe checkout
                      alert(`In production, this would open Stripe checkout for ${plan.name} plan.`);
                    }}
                  >
                    {plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
                  </button>
                )}
              </div>
            ))}
          </div>
          {profile?.subscription_tier !== 'free' && (
            <div className="flex items-center gap-2 p-3 bg-primary-500/5 border border-primary-500/20 rounded-xl text-sm">
              <CreditCard size={14} className="text-primary-400" />
              <span className="text-dark-300">Manage billing and payment methods</span>
              <ChevronRight size={14} className="text-dark-400 ml-auto" />
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-primary-400" />
            <h2 className="text-lg font-bold text-white">Notifications</h2>
          </div>
          <div className="space-y-1">
            <SettingRow
              icon={Bell}
              label="Workout Reminders"
              description="Daily reminders to complete your workout"
              toggle={notifications.workoutReminders}
              onChange={(v: boolean) => toggleSetting('notif_workoutReminders', v)}
            />
            <SettingRow
              icon={Smartphone}
              label="Streak Alerts"
              description="Notifications to protect your streak"
              toggle={notifications.streakAlerts}
              onChange={(v: boolean) => toggleSetting('notif_streakAlerts', v)}
            />
            <SettingRow
              icon={Bell}
              label="Daily Challenges"
              description="Get notified about new daily challenges"
              toggle={notifications.challenges}
              onChange={(v: boolean) => toggleSetting('notif_challenges', v)}
            />
            <SettingRow
              icon={Mail}
              label="Email Notifications"
              description="Weekly progress summaries via email"
              toggle={notifications.email}
              onChange={(v: boolean) => toggleSetting('notif_email', v)}
            />
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-primary-400" />
            <h2 className="text-lg font-bold text-white">Privacy & Security</h2>
          </div>
          <div className="space-y-1">
            <SettingRow
              icon={Globe}
              label="Public Profile"
              description="Allow others to view your profile"
              toggle={privacySettings.profilePublic}
              onChange={(v: boolean) => toggleSetting('priv_profilePublic', v)}
            />
            <SettingRow
              icon={Eye}
              label="Show Progress"
              description="Share progress updates with community"
              toggle={privacySettings.showProgress}
              onChange={(v: boolean) => toggleSetting('priv_showProgress', v)}
            />
            <SettingRow
              icon={Lock}
              label="Change Password"
              onClick={() => onNavigate('login')}
            />
          </div>
        </div>

        {/* Account */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-4">
            <Shield size={18} className="text-primary-400" />
            <h2 className="text-lg font-bold text-white">Account</h2>
          </div>
          <div className="space-y-1">
            <SettingRow
              icon={Mail}
              label="Email Address"
              value={user?.email}
            />
            <SettingRow
              icon={Globe}
              label="Language"
              value="English"
              onClick={() => {}}
            />
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-red-400 hover:bg-red-500/5 border border-red-500/10 hover:border-red-500/20 transition-all duration-200 text-sm font-medium"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
          <div className="mt-2">
            <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-dark-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 text-xs">
              <Trash2 size={14} />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
