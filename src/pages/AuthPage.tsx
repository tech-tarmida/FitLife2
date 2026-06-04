import React, { useState } from 'react';
import { Activity, Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Props = { onNavigate: (page: string) => void };

type AuthMode = 'login' | 'signup' | 'reset';

export default function AuthPage({ onNavigate }: Props) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message === 'Invalid login credentials'
            ? 'Invalid email or password. Please try again.'
            : error.message);
        } else {
          onNavigate('dashboard');
        }
      } else if (mode === 'signup') {
        if (password.length < 8) {
          setError('Password must be at least 8 characters.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message.includes('already registered')
            ? 'This email is already registered. Please sign in.'
            : error.message);
        } else {
          onNavigate('dashboard');
        }
      } else {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Password reset email sent! Check your inbox.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const modeConfig = {
    login: { title: 'Welcome back', subtitle: 'Sign in to your FitLife account', cta: 'Sign In' },
    signup: { title: 'Join FitLife', subtitle: 'Create your account and start your journey', cta: 'Create Account' },
    reset: { title: 'Reset Password', subtitle: 'We\'ll send you a reset link via email', cta: 'Send Reset Link' },
  };

  const { title, subtitle, cta } = modeConfig[mode];

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-500/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Activity size={20} className="text-white" />
            </div>
            <span className="text-xl font-black gradient-text">FitLife</span>
          </button>
        </div>

        {/* Card */}
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
            <p className="text-dark-400 text-sm">{subtitle}</p>
          </div>

          {/* Error / Success Messages */}
          {error && (
            <div className="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl mb-6 animate-slide-down">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-3 p-3.5 bg-primary-500/10 border border-primary-500/20 rounded-xl mb-6 animate-slide-down">
              <CheckCircle size={16} className="text-primary-400 flex-shrink-0 mt-0.5" />
              <p className="text-primary-400 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name - signup only */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Password */}
            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Min 8 characters' : '••••••••'}
                    required
                    className="input-field pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-primary-400 hover:text-primary-300 text-xs mt-1.5 float-right transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            <div className="pt-2">
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {cta}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Mode toggles */}
          <div className="mt-6 text-center text-sm">
            {mode === 'login' && (
              <p className="text-dark-400">
                Don't have an account?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                  className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
                  Create one free
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p className="text-dark-400">
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                  className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            )}
            {mode === 'reset' && (
              <button
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Back to sign in
              </button>
            )}
          </div>

          {/* Terms */}
          {mode === 'signup' && (
            <p className="mt-4 text-center text-xs text-dark-500">
              By creating an account you agree to our{' '}
              <button className="text-dark-400 hover:text-dark-200 transition-colors">Terms</button>
              {' '}and{' '}
              <button className="text-dark-400 hover:text-dark-200 transition-colors">Privacy Policy</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
