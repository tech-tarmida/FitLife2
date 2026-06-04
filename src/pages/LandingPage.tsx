import React, { useEffect, useRef, useState } from 'react';
import {
  Activity, Zap, TrendingUp, Users, Star, ArrowRight, Check, Play,
  Dumbbell, Heart, Apple, Trophy, ChevronRight, Flame
} from 'lucide-react';

type Props = { onNavigate: (page: string) => void };

const STATS = [
  { value: '50K+', label: 'Active Members', icon: Users },
  { value: '500+', label: 'Workout Plans', icon: Dumbbell },
  { value: '12M+', label: 'Calories Burned', icon: Flame },
  { value: '4.9', label: 'Average Rating', icon: Star },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'AI-Powered Plans',
    desc: 'Get personalized workout and nutrition plans powered by AI, tailored to your goals and fitness level.',
    color: 'from-yellow-500/20 to-orange-500/20',
    iconColor: 'text-yellow-400',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    desc: 'Track every workout, visualize your gains with beautiful charts, and celebrate milestones.',
    color: 'from-primary-500/20 to-teal-500/20',
    iconColor: 'text-primary-400',
  },
  {
    icon: Apple,
    title: 'Nutrition Guidance',
    desc: 'Expert nutrition tips, calorie calculators, and meal timing strategies for optimal results.',
    color: 'from-red-500/20 to-pink-500/20',
    iconColor: 'text-red-400',
  },
  {
    icon: Trophy,
    title: 'Challenges & Badges',
    desc: 'Stay motivated with daily challenges, streak tracking, and achievement badges.',
    color: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: Heart,
    title: 'Wellness Tracking',
    desc: 'Monitor water intake, sleep, and recovery to ensure complete wellness.',
    color: 'from-pink-500/20 to-rose-500/20',
    iconColor: 'text-pink-400',
  },
  {
    icon: Users,
    title: 'Community',
    desc: 'Join a thriving community of fitness enthusiasts. Share progress and stay accountable.',
    color: 'from-purple-500/20 to-violet-500/20',
    iconColor: 'text-purple-400',
  },
];

const CATEGORIES = [
  { name: 'Weight Loss', image: 'https://images.pexels.com/photos/3823488/pexels-photo-3823488.jpeg', count: '45 workouts' },
  { name: 'Muscle Gain', image: 'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg', count: '60 workouts' },
  { name: 'Home Workouts', image: 'https://images.pexels.com/photos/4498482/pexels-photo-4498482.jpeg', count: '38 workouts' },
  { name: 'Cardio', image: 'https://images.pexels.com/photos/2827392/pexels-photo-2827392.jpeg', count: '52 workouts' },
  { name: 'Yoga', image: 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg', count: '30 workouts' },
  { name: 'Strength', image: 'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg', count: '70 workouts' },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '20 workout plans',
      'Basic exercise library',
      'Workout logging',
      'Progress tracking',
      'Daily challenges',
    ],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Premium',
    price: '$12',
    period: 'per month',
    features: [
      'Unlimited workout plans',
      'Full exercise library',
      'AI recommendations',
      'Advanced analytics',
      'Nutrition coaching',
      'Priority support',
    ],
    cta: 'Start Premium',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    features: [
      'Everything in Premium',
      'Personal trainer access',
      'Custom meal plans',
      'Live coaching sessions',
      'Team challenges',
      'White-glove onboarding',
    ],
    cta: 'Start Pro',
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    role: 'Lost 30 lbs in 4 months',
    text: 'FitLife completely transformed how I approach fitness. The AI recommendations are spot-on and the progress tracking keeps me motivated every single day.',
    avatar: 'S',
    rating: 5,
  },
  {
    name: 'Marcus T.',
    role: 'Gained 15 lbs of muscle',
    text: 'As someone who struggled to stay consistent, the streak system and daily challenges have been game-changers. I haven\'t missed a workout in 3 months!',
    avatar: 'M',
    rating: 5,
  },
  {
    name: 'Priya K.',
    role: 'Yoga enthusiast',
    text: 'The yoga collection is incredible. The detailed instructions and progression system helped me go from complete beginner to intermediate in just 2 months.',
    avatar: 'P',
    rating: 5,
  },
];

function CountUpNumber({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [displayed, setDisplayed] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const numericTarget = parseFloat(target.replace(/[^0-9.]/g, ''));
        const suffix = target.replace(/[0-9.]/g, '');
        const duration = 1500;
        const startTime = performance.now();

        const animate = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = numericTarget * eased;
          setDisplayed(
            numericTarget % 1 !== 0
              ? current.toFixed(1) + suffix
              : Math.floor(current).toLocaleString() + suffix
          );
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.5 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref}>{displayed}</div>;
}

export default function LandingPage({ onNavigate }: Props) {
  return (
    <div className="min-h-screen bg-dark-950 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/6 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/3 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm font-medium mb-8 animate-fade-in">
            <Zap size={14} className="text-primary-400" />
            AI-Powered Fitness Platform
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[0.95] tracking-tight animate-slide-up">
            Transform Your
            <br />
            <span className="gradient-text text-glow">Body & Mind</span>
          </h1>

          <p className="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Personalized workout plans, AI-powered coaching, and comprehensive progress tracking.
            Join 50,000+ members achieving their fitness goals with FitLife.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => onNavigate('signup')}
              className="btn-primary text-base px-8 py-4 gap-2 flex items-center group"
            >
              Start Your Journey Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('explore')}
              className="flex items-center gap-3 text-dark-300 hover:text-white transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group">
                <Play size={18} className="text-primary-400 ml-0.5" />
              </div>
              <span className="font-medium">Explore Workouts</span>
            </button>
          </div>

          {/* Hero Image / Dashboard Preview */}
          <div className="relative max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="relative bg-dark-800/60 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
              {/* Fake dashboard preview */}
              <div className="bg-dark-900/80 px-4 py-3 flex items-center gap-2 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-primary-500/60" />
                </div>
                <div className="flex-1 h-5 bg-dark-700/80 rounded-md mx-8" />
              </div>
              <img
                src="https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg"
                alt="FitLife Dashboard"
                className="w-full h-48 sm:h-72 object-cover opacity-40"
              />
              {/* Overlay stats */}
              <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-end">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Today\'s Calories', value: '487', unit: 'kcal burned', color: 'text-accent-400' },
                    { label: 'Workout Streak', value: '14', unit: 'days', color: 'text-primary-400' },
                    { label: 'Weekly Goal', value: '85%', unit: 'complete', color: 'text-blue-400' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-dark-900/80 backdrop-blur-sm rounded-xl p-3 border border-white/10 text-left">
                      <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-[10px] text-dark-400">{stat.unit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating cards */}
            <div className="absolute -left-4 sm:-left-8 top-1/3 bg-dark-800 border border-white/10 rounded-2xl p-3 shadow-xl animate-bounce-subtle hidden sm:block">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                  <Trophy size={16} className="text-primary-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">New Badge!</p>
                  <p className="text-[10px] text-dark-400">Week Warrior</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 sm:-right-8 top-1/4 bg-dark-800 border border-white/10 rounded-2xl p-3 shadow-xl animate-bounce-subtle hidden sm:block" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent-500/20 rounded-lg flex items-center justify-center">
                  <Flame size={16} className="text-accent-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">450 kcal</p>
                  <p className="text-[10px] text-dark-400">Just burned!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/5 bg-dark-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                  <CountUpNumber target={stat.value} />
                </div>
                <p className="text-dark-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-xs font-medium mb-4">
              Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Everything You Need to
              <br />
              <span className="gradient-text">Reach Your Goals</span>
            </h2>
            <p className="text-dark-400 max-w-xl mx-auto">
              A complete fitness ecosystem designed to help you build habits, track progress, and achieve lasting results.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="card-hover group animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={22} className={feature.iconColor} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 px-4 sm:px-6 bg-dark-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-500/10 border border-accent-500/20 rounded-full text-accent-400 text-xs font-medium mb-4">
              Workout Categories
            </div>
            <h2 className="text-4xl font-black text-white mb-4">Train Your Way</h2>
            <p className="text-dark-400">Choose from 6 specialized categories built for every goal</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.name}
                onClick={() => onNavigate('explore')}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] animate-fade-in hover:-translate-y-1 transition-transform duration-300"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                  <p className="text-white font-bold text-sm">{cat.name}</p>
                  <p className="text-dark-400 text-xs">{cat.count}</p>
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-500/30 rounded-2xl transition-colors duration-300" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium mb-4">
              Success Stories
            </div>
            <h2 className="text-4xl font-black text-white mb-4">Real People, Real Results</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-dark-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-dark-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 sm:px-6 bg-dark-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-xs font-medium mb-4">
              Pricing
            </div>
            <h2 className="text-4xl font-black text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-dark-400">Start free. Upgrade when you're ready.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`card relative ${plan.highlight ? 'border-primary-500/30 bg-dark-800/80' : ''}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-xs font-bold text-white shadow-lg shadow-primary-500/30">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-dark-400 text-sm pb-1">/{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-dark-300">
                      <div className="w-4 h-4 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center flex-shrink-0">
                        <Check size={10} className="text-primary-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onNavigate('signup')}
                  className={plan.highlight ? 'btn-primary w-full' : 'btn-secondary w-full'}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-primary-500/10 via-dark-800/60 to-accent-500/10 border border-primary-500/20 rounded-3xl p-12 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                Ready to Transform?
              </h2>
              <p className="text-dark-300 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of people who've already changed their lives with FitLife. Your journey starts today.
              </p>
              <button
                onClick={() => onNavigate('signup')}
                className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2 group"
              >
                Start For Free
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Activity size={16} className="text-white" />
              </div>
              <span className="font-bold gradient-text">FitLife</span>
            </div>
            <p className="text-dark-500 text-sm">© 2026 FitLife. Empowering your fitness journey.</p>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Support'].map(link => (
                <button key={link} className="text-dark-400 hover:text-white text-sm transition-colors">{link}</button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
