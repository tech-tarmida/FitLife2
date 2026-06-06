import React, { useEffect, useState, useCallback } from 'react';

type Props = {
  duration: number;
  isPaused: boolean;
  onComplete: () => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
};

export default function CountdownTimer({ duration, isPaused, onComplete, size = 'lg', label }: Props) {
  const [remaining, setRemaining] = useState(duration);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    setRemaining(duration);
    setHasCompleted(false);
  }, [duration]);

  useEffect(() => {
    if (isPaused || hasCompleted || remaining <= 0) return;
    const iv = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          setHasCompleted(true);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [isPaused, hasCompleted, remaining, onComplete]);

  const progress = duration > 0 ? (duration - remaining) / duration : 0;
  const isUrgent = remaining <= 5 && remaining > 0;

  const cfg = {
    sm: { container: 'w-20 h-20', ring: 70, r: 30, sw: 5, font: 'text-lg', sub: 'text-[8px]' },
    md: { container: 'w-28 h-28', ring: 100, r: 44, sw: 6, font: 'text-2xl', sub: 'text-[10px]' },
    lg: { container: 'w-40 h-40', ring: 140, r: 62, sw: 7, font: 'text-4xl', sub: 'text-xs' },
  }[size];

  const circ = 2 * Math.PI * cfg.r;
  const offset = circ - progress * circ;

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}`;
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${cfg.container} relative`}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${cfg.ring} ${cfg.ring}`}>
          <circle cx={cfg.ring / 2} cy={cfg.ring / 2} r={cfg.r} fill="none" stroke="currentColor" strokeWidth={cfg.sw} className="text-dark-700" />
          <circle
            cx={cfg.ring / 2} cy={cfg.ring / 2} r={cfg.r} fill="none"
            strokeWidth={cfg.sw} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            className={`transition-all duration-1000 ease-linear ${isUrgent ? 'stroke-red-400' : 'stroke-primary-400'}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${cfg.font} font-black ${isUrgent ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {fmt(remaining)}
          </span>
          {label && (
            <span className={`${cfg.sub} text-dark-400 uppercase tracking-wider font-medium`}>{label}</span>
          )}
        </div>
      </div>
    </div>
  );
}
