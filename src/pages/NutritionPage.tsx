import React, { useEffect, useState } from 'react';
import {
  Apple, Droplets, Leaf, Zap, ChevronRight, Tag, Info, Star, TrendingUp
} from 'lucide-react';
import { supabase, NutritionTip } from '../lib/supabase';

type Props = { onNavigate: (page: string) => void };

const CATEGORY_CONFIG: Record<string, { icon: typeof Apple; color: string; bg: string; border: string }> = {
  protein: { icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  carbs: { icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  fats: { icon: Droplets, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  timing: { icon: Info, color: 'text-accent-400', bg: 'bg-accent-500/10', border: 'border-accent-500/20' },
  recovery: { icon: Star, color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/20' },
  vitamins: { icon: Leaf, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  sugar: { icon: Info, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  habits: { icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  general: { icon: Apple, color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/20' },
};

const HYDRATION_TIPS = [
  { time: 'Wake Up', tip: 'Drink 500ml of water to rehydrate after sleep', icon: '🌅' },
  { time: 'Pre-Workout', tip: 'Drink 400-600ml 2 hours before exercise', icon: '💪' },
  { time: 'During Workout', tip: 'Sip 150-250ml every 15-20 minutes', icon: '🏃' },
  { time: 'Post-Workout', tip: 'Replace fluids lost: ~500ml per pound lost', icon: '🚿' },
  { time: 'Evening', tip: 'Stop large amounts 2 hours before bed', icon: '🌙' },
];

const MACRO_GUIDES = [
  {
    goal: 'Weight Loss',
    protein: '35%',
    carbs: '35%',
    fats: '30%',
    color: 'from-red-500/20 to-pink-500/20',
    border: 'border-red-500/20',
  },
  {
    goal: 'Muscle Gain',
    protein: '30%',
    carbs: '50%',
    fats: '20%',
    color: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/20',
  },
  {
    goal: 'Maintenance',
    protein: '25%',
    carbs: '50%',
    fats: '25%',
    color: 'from-primary-500/20 to-teal-500/20',
    border: 'border-primary-500/20',
  },
];

export default function NutritionPage({ onNavigate }: Props) {
  const [tips, setTips] = useState<NutritionTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('nutrition_tips')
      .select('*')
      .eq('is_published', true)
      .order('created_at')
      .then(({ data }) => {
        setTips(data || []);
        setLoading(false);
      });
  }, []);

  const categories = ['all', ...Array.from(new Set(tips.map(t => t.category)))];

  const filteredTips = activeCategory === 'all'
    ? tips
    : tips.filter(t => t.category === activeCategory);

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-black text-white mb-1">Nutrition</h1>
        <p className="text-dark-400">Fuel your body right for optimal performance and recovery</p>
      </div>

      {/* Hero Macro Guide */}
      <div className="mb-8 animate-slide-up">
        <h2 className="text-xl font-bold text-white mb-4">Macro Split by Goal</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MACRO_GUIDES.map((guide, i) => (
            <div
              key={guide.goal}
              className={`card bg-gradient-to-br ${guide.color} border ${guide.border} animate-fade-in`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <h3 className="text-base font-bold text-white mb-4">{guide.goal}</h3>
              <div className="space-y-3">
                {[
                  { label: 'Protein', value: guide.protein, color: 'bg-blue-500' },
                  { label: 'Carbs', value: guide.carbs, color: 'bg-yellow-500' },
                  { label: 'Fats', value: guide.fats, color: 'bg-orange-500' },
                ].map(macro => (
                  <div key={macro.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-dark-300">{macro.label}</span>
                      <span className="text-white font-semibold">{macro.value}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${macro.color}`}
                        style={{ width: macro.value }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nutrition Tips */}
        <div className="lg:col-span-2">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 capitalize ${
                  activeCategory === cat
                    ? 'bg-primary-500/10 text-primary-400 border-primary-500/20'
                    : 'text-dark-400 border-white/5 hover:text-white hover:border-white/10 bg-dark-800/50'
                }`}
              >
                {cat === 'all' ? 'All Tips' : cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTips.map((tip, i) => {
                const config = CATEGORY_CONFIG[tip.category] || CATEGORY_CONFIG.general;
                const Icon = config.icon;
                const isExpanded = expandedTip === tip.id;

                return (
                  <div
                    key={tip.id}
                    className="card cursor-pointer hover:border-white/15 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${i * 0.04}s` }}
                    onClick={() => setExpandedTip(isExpanded ? null : tip.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg} border ${config.border}`}>
                        <Icon size={18} className={config.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-white">{tip.title}</h3>
                          <ChevronRight
                            size={16}
                            className={`text-dark-400 flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
                          />
                        </div>
                        <p className={`text-dark-400 text-sm leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {tip.content}
                        </p>
                        {isExpanded && tip.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3 animate-slide-down">
                            {tip.tags.map(tag => (
                              <span
                                key={tag}
                                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} border ${config.border}`}
                              >
                                <Tag size={9} />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Hydration Guide */}
          <div className="card animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Droplets size={16} className="text-blue-400" />
              </div>
              <h3 className="font-semibold text-white">Hydration Guide</h3>
            </div>
            <div className="space-y-3">
              {HYDRATION_TIPS.map(h => (
                <div key={h.time} className="flex items-start gap-3 p-2.5 bg-dark-900/50 rounded-xl">
                  <span className="text-lg flex-shrink-0">{h.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-white">{h.time}</p>
                    <p className="text-xs text-dark-400 mt-0.5">{h.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Nutrition Facts */}
          <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <Info size={16} className="text-primary-400" />
              </div>
              <h3 className="font-semibold text-white">Quick Facts</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { fact: 'Protein needs', value: '0.8-1g/lb bodyweight', icon: Zap, color: 'text-blue-400' },
                { fact: 'Water daily', value: '2.7-3.7 liters', icon: Droplets, color: 'text-cyan-400' },
                { fact: 'Pre-workout meal', value: '2-3 hours before', icon: Info, color: 'text-accent-400' },
                { fact: 'Post-workout window', value: '30-60 minutes', icon: TrendingUp, color: 'text-primary-400' },
                { fact: 'Fiber intake', value: '25-38g per day', icon: Leaf, color: 'text-teal-400' },
              ].map(item => (
                <div key={item.fact} className="flex items-center justify-between p-2.5 bg-dark-900/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <item.icon size={14} className={item.color} />
                    <span className="text-xs text-dark-400">{item.fact}</span>
                  </div>
                  <span className="text-xs font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Calorie Suggestion */}
          <div className="card border-primary-500/10 bg-gradient-to-br from-primary-500/5 to-transparent animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <Apple size={16} className="text-primary-400" />
              </div>
              <h3 className="font-semibold text-white text-sm">AI Nutrition Tip</h3>
              <span className="px-1.5 py-0.5 bg-primary-500/20 text-primary-400 rounded text-[10px] font-medium ml-auto">AI</span>
            </div>
            <p className="text-dark-400 text-xs leading-relaxed">
              Focus on whole, minimally processed foods that provide sustained energy.
              Aim for 5-6 smaller meals throughout the day to maintain stable blood sugar
              and support muscle protein synthesis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
