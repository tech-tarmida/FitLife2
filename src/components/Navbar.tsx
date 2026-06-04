import React, { useState } from 'react';
import {
  Activity, Bell, Search, Menu, X, ChevronDown, Crown, Settings, LogOut, User, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Page = string;

type Props = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
};

const MOTIVATIONAL_QUOTES = [
  "Every rep counts. Every day matters.",
  "Your only competition is yesterday's you.",
  "Pain is temporary. Fitness is forever.",
  "Push your limits. Discover your strength.",
  "Champions are made in the moments they want to quit.",
];

export default function Navbar({ currentPage, onNavigate }: Props) {
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const quote = MOTIVATIONAL_QUOTES[new Date().getDay() % MOTIVATIONAL_QUOTES.length];

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'explore', label: 'Explore' },
    { id: 'progress', label: 'Progress' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'notes', label: 'Notes' },
  ];

  const handleSignOut = async () => {
    await signOut();
    onNavigate('landing');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-all duration-300">
              <Activity className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" size={16} />
            </div>
            <span className="text-base sm:text-lg font-bold gradient-text hidden sm:block">FitLife</span>
          </div>

          {/* Desktop Nav Links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                    currentPage === link.id
                      ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                      : 'text-dark-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}

          {/* Quote for non-authenticated */}
          {!user && (
            <p className="hidden md:block text-xs text-dark-400 italic max-w-xs text-center">
              "{quote}"
            </p>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            {user && (
              <div className="relative">
                {searchOpen ? (
                  <div className="flex items-center gap-1 sm:gap-2 animate-slide-in-right">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          onNavigate('explore');
                          setSearchOpen(false);
                        }
                        if (e.key === 'Escape') setSearchOpen(false);
                      }}
                      autoFocus
                      className="w-32 sm:w-48 bg-dark-800 border border-white/10 rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50"
                    />
                    <button onClick={() => setSearchOpen(false)} className="text-dark-400 hover:text-white transition-colors p-1">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-dark-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                  >
                    <Search size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Notifications */}
            {user && (
              <button className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-dark-400 hover:text-white hover:bg-white/5 transition-all duration-200">
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
              </button>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 p-1 rounded-lg sm:rounded-xl hover:bg-white/5 transition-all duration-200"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      (profile?.full_name || profile?.username || 'U')[0].toUpperCase()
                    )}
                  </div>
                  <ChevronDown size={12} className={`text-dark-400 transition-transform duration-200 hidden sm:block ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-11 sm:top-12 w-48 sm:w-52 bg-dark-800 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-slide-down z-50">
                    <div className="p-2 sm:p-3 border-b border-white/5">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{profile?.full_name || profile?.username}</p>
                      <p className="text-xs text-dark-400 truncate">{user.email}</p>
                      {profile?.subscription_tier === 'premium' && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full text-xs border border-yellow-500/20">
                          <Crown size={10} /> Premium
                        </span>
                      )}
                    </div>
                    <div className="p-1.5">
                      {[
                        { icon: User, label: 'Profile', page: 'profile' },
                        { icon: Settings, label: 'Settings', page: 'settings' },
                        ...(profile?.is_admin ? [{ icon: Shield, label: 'Admin', page: 'admin' }] : []),
                      ].map(item => (
                        <button
                          key={item.page}
                          onClick={() => { onNavigate(item.page); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-dark-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                        >
                          <item.icon size={16} />
                          {item.label}
                        </button>
                      ))}
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200 mt-1 border-t border-white/5 pt-2"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => onNavigate('login')} className="btn-ghost text-sm hidden sm:block">
                  Sign In
                </button>
                <button onClick={() => onNavigate('signup')} className="btn-primary text-sm py-2 px-4">
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            {user && (
              <button
                className="md:hidden p-2 rounded-xl text-dark-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {user && mobileOpen && (
          <div className="md:hidden border-t border-white/5 pb-4 pt-2 animate-slide-down">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => { onNavigate(link.id); setMobileOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-1 ${
                  currentPage === link.id
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-dark-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </nav>
  );
}
