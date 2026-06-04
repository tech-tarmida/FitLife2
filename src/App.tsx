import React, { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ExplorePage from './pages/ExplorePage';
import ProgressPage from './pages/ProgressPage';
import NutritionPage from './pages/NutritionPage';
import NotesPage from './pages/NotesPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/AdminDashboard';

type Page = 'landing' | 'login' | 'signup' | 'dashboard' | 'explore' | 'progress' | 'nutrition' | 'notes' | 'profile' | 'settings' | 'admin';

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>('landing');

  useEffect(() => {
    if (!loading) {
      if (user && page === 'landing') {
        setPage('dashboard');
      } else if (!user && ['dashboard', 'explore', 'progress', 'nutrition', 'notes', 'profile', 'settings', 'admin'].includes(page)) {
        setPage('landing');
      }
    }
  }, [user, loading]);

  const navigate = (p: string) => {
    if (!user && !['landing', 'login', 'signup'].includes(p)) {
      setPage('login');
      return;
    }
    setPage(p as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center animate-pulse">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const showNavbar = !['login', 'signup'].includes(page);

  return (
    <div className="min-h-screen bg-dark-950">
      {showNavbar && <Navbar currentPage={page} onNavigate={navigate} />}
      <main>
        {page === 'landing' && <LandingPage onNavigate={navigate} />}
        {(page === 'login' || page === 'signup') && <AuthPage onNavigate={navigate} />}
        {page === 'dashboard' && user && <Dashboard onNavigate={navigate} />}
        {page === 'explore' && <ExplorePage onNavigate={navigate} />}
        {page === 'progress' && user && <ProgressPage onNavigate={navigate} />}
        {page === 'nutrition' && <NutritionPage onNavigate={navigate} />}
        {page === 'notes' && user && <NotesPage onNavigate={navigate} />}
        {page === 'profile' && user && <ProfilePage onNavigate={navigate} />}
        {page === 'settings' && user && <SettingsPage onNavigate={navigate} />}
        {page === 'admin' && user && <AdminDashboard onNavigate={navigate} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Analytics />
    </AuthProvider>
  );
}
