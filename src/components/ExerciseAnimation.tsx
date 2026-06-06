import React, { useState, useEffect } from 'react';
import { ExerciseAnimationData } from '../lib/supabase';

type Props = {
  animationData: ExerciseAnimationData;
  isActive: boolean;
};

function PushUpAnimation({ cycleMs, isActive }: { cycleMs: number; isActive: boolean }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!isActive) return;
    const iv = setInterval(() => setPhase(p => (p + 1) % 2), cycleMs / 2);
    return () => clearInterval(iv);
  }, [cycleMs, isActive]);
  const t = phase;
  const bodyY = t * 15;
  const armSpread = 25 - t * 12;

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="puAnim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <line x1="20" y1="130" x2="180" y2="130" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="100" cy={38 + bodyY} r="12" fill="url(#puAnim)" opacity="0.9" />
      <line x1="100" y1={50 + bodyY} x2="100" y2={90 + bodyY} stroke="url(#puAnim)" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1={60 + bodyY} x2={100 - armSpread} y2={128 + bodyY * 0.5} stroke="url(#puAnim)" strokeWidth="3" strokeLinecap="round" />
      <line x1="100" y1={60 + bodyY} x2={100 + armSpread} y2={128 + bodyY * 0.5} stroke="url(#puAnim)" strokeWidth="3" strokeLinecap="round" />
      <line x1="100" y1={90 + bodyY} x2="130" y2={130 + bodyY * 0.3} stroke="url(#puAnim)" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="100" y1={90 + bodyY} x2="145" y2={128 + bodyY * 0.2} stroke="url(#puAnim)" strokeWidth="3.5" strokeLinecap="round" />
      <text x="100" y="155" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="Inter, sans-serif">
        {phase === 0 ? 'UP' : 'DOWN'}
      </text>
    </svg>
  );
}

function SquatAnimation({ cycleMs, isActive }: { cycleMs: number; isActive: boolean }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!isActive) return;
    const iv = setInterval(() => setPhase(p => (p + 1) % 2), cycleMs / 2);
    return () => clearInterval(iv);
  }, [cycleMs, isActive]);
  const t = phase;
  const drop = t * 20;

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="sqAnim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <line x1="20" y1="130" x2="180" y2="130" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="100" cy={28 + drop} r="11" fill="url(#sqAnim)" opacity="0.9" />
      <line x1="100" y1={39 + drop} x2="100" y2={75 + drop} stroke="url(#sqAnim)" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1={52 + drop} x2={100 + t * 30} y2={50 + drop} stroke="url(#sqAnim)" strokeWidth="3" strokeLinecap="round" />
      <line x1="100" y1={52 + drop} x2={100 - t * 30} y2={50 + drop} stroke="url(#sqAnim)" strokeWidth="3" strokeLinecap="round" />
      <line x1="100" y1={75 + drop} x2={85 - t * 5} y2="130" stroke="url(#sqAnim)" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="100" y1={75 + drop} x2={115 + t * 5} y2="130" stroke="url(#sqAnim)" strokeWidth="3.5" strokeLinecap="round" />
      <text x="100" y="155" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="Inter, sans-serif">
        {phase === 0 ? 'STAND' : 'SQUAT'}
      </text>
    </svg>
  );
}

function PlankAnimation({ cycleMs, isActive }: { cycleMs: number; isActive: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!isActive) return;
    const iv = setInterval(() => setTick(p => (p + 1) % 20), cycleMs / 20);
    return () => clearInterval(iv);
  }, [cycleMs, isActive]);
  const breath = Math.sin(tick * 0.314) * 2;

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="plAnim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <line x1="20" y1="130" x2="180" y2="130" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="55" cy={78 + breath} r="10" fill="url(#plAnim)" opacity="0.9" />
      <line x1="65" y1={80 + breath} x2="150" y2={85} stroke="url(#plAnim)" strokeWidth="4" strokeLinecap="round" />
      <line x1="65" y1={80 + breath} x2="65" y2="130" stroke="url(#plAnim)" strokeWidth="3" strokeLinecap="round" />
      <line x1="150" y1={85} x2="170" y2="130" stroke="url(#plAnim)" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="150" y1={85} x2="155" y2="130" stroke="url(#plAnim)" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="70" y="140" width="60" height="6" rx="3" fill="#1e293b" />
      <rect x="70" y="140" width={60 * (tick / 20)} height="6" rx="3" fill="#4ade80" opacity="0.7" />
      <text x="100" y="155" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="Inter, sans-serif">HOLD</text>
    </svg>
  );
}

function BurpeeAnimation({ cycleMs, isActive }: { cycleMs: number; isActive: boolean }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!isActive) return;
    const iv = setInterval(() => setPhase(p => (p + 1) % 3), cycleMs / 3);
    return () => clearInterval(iv);
  }, [cycleMs, isActive]);

  const cfgs = [
    { headY: 28, bodyTop: 40, bodyBot: 65, legEnd: 130, armOff: 0, legsOff: 0, label: 'JUMP' },
    { headY: 78, bodyTop: 88, bodyBot: 90, legEnd: 85, armOff: 50, legsOff: 25, label: 'PLANK' },
    { headY: 48, bodyTop: 60, bodyBot: 85, legEnd: 130, armOff: 15, legsOff: 10, label: 'SQUAT' },
  ];
  const c = cfgs[phase];

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="bpAnim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <line x1="20" y1="130" x2="180" y2="130" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="100" cy={c.headY} r="11" fill="url(#bpAnim)" opacity="0.9" />
      <line x1="100" y1={c.headY + 11} x2="100" y2={c.bodyBot} stroke="url(#bpAnim)" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1={c.bodyTop} x2={80} y2={c.bodyTop + 15} stroke="url(#bpAnim)" strokeWidth="3" strokeLinecap="round" />
      <line x1="100" y1={c.bodyTop} x2={120} y2={c.bodyTop + 15} stroke="url(#bpAnim)" strokeWidth="3" strokeLinecap="round" />
      <line x1="100" y1={c.bodyBot} x2={100 - c.legsOff} y2={c.legEnd} stroke="url(#bpAnim)" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="100" y1={c.bodyBot} x2={100 + c.legsOff} y2={c.legEnd} stroke="url(#bpAnim)" strokeWidth="3.5" strokeLinecap="round" />
      <text x="100" y="155" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="Inter, sans-serif">{c.label}</text>
    </svg>
  );
}

function DeadliftAnimation({ cycleMs, isActive }: { cycleMs: number; isActive: boolean }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!isActive) return;
    const iv = setInterval(() => setPhase(p => (p + 1) % 2), cycleMs / 2);
    return () => clearInterval(iv);
  }, [cycleMs, isActive]);
  const t = phase;
  const hinge = t * 25;

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="dlAnim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <line x1="20" y1="130" x2="180" y2="130" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx={100 + hinge * 0.4} cy={30 - t * 5} r="11" fill="url(#dlAnim)" opacity="0.9" />
      <line x1={100 + hinge * 0.4} y1={41 - t * 5} x2={105 + hinge * 0.8} y2={72 + t * 8} stroke="url(#dlAnim)" strokeWidth="4" strokeLinecap="round" />
      <line x1={105 + hinge * 0.8} y1={55 + t * 5} x2={112 + hinge} y2={110 + t * 10} stroke="url(#dlAnim)" strokeWidth="3" strokeLinecap="round" />
      <line x1={108 + hinge} y1={110 + t * 10} x2={98 + hinge} y2={113 + t * 8} stroke="#fb923c" strokeWidth="6" strokeLinecap="round" />
      <line x1={108 + hinge} y1={110 + t * 10} x2={118 + hinge} y2={113 + t * 8} stroke="#fb923c" strokeWidth="6" strokeLinecap="round" />
      <line x1={100} y1={72 + t * 8} x2="90" y2="130" stroke="url(#dlAnim)" strokeWidth="3.5" strokeLinecap="round" />
      <line x1={100} y1={72 + t * 8} x2="110" y2="130" stroke="url(#dlAnim)" strokeWidth="3.5" strokeLinecap="round" />
      <text x="100" y="155" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="Inter, sans-serif">
        {phase === 0 ? 'UP' : 'DOWN'}
      </text>
    </svg>
  );
}

function PullUpAnimation({ cycleMs, isActive }: { cycleMs: number; isActive: boolean }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!isActive) return;
    const iv = setInterval(() => setPhase(p => (p + 1) % 2), cycleMs / 2);
    return () => clearInterval(iv);
  }, [cycleMs, isActive]);
  const pull = phase * 25;

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="puUpAnim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <line x1="60" y1="30" x2="140" y2="30" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="25" x2="60" y2="30" stroke="#64748b" strokeWidth="3" />
      <line x1="140" y1="25" x2="140" y2="30" stroke="#64748b" strokeWidth="3" />
      <circle cx="100" cy={55 - pull} r="11" fill="url(#puUpAnim)" opacity="0.9" />
      <line x1="100" y1={66 - pull} x2="100" y2={105 - pull * 0.6} stroke="url(#puUpAnim)" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1={55 - pull} x2="85" y2="30" stroke="url(#puUpAnim)" strokeWidth="3" strokeLinecap="round" />
      <line x1="100" y1={55 - pull} x2="115" y2="30" stroke="url(#puUpAnim)" strokeWidth="3" strokeLinecap="round" />
      <line x1="100" y1={105 - pull * 0.6} x2="90" y2={135 - pull * 0.3} stroke="url(#puUpAnim)" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="100" y1={105 - pull * 0.6} x2="110" y2={135 - pull * 0.3} stroke="url(#puUpAnim)" strokeWidth="3.5" strokeLinecap="round" />
      <text x="100" y="155" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="Inter, sans-serif">
        {phase === 0 ? 'DOWN' : 'UP'}
      </text>
    </svg>
  );
}

function LungesAnimation({ cycleMs, isActive }: { cycleMs: number; isActive: boolean }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!isActive) return;
    const iv = setInterval(() => setPhase(p => (p + 1) % 2), cycleMs / 2);
    return () => clearInterval(iv);
  }, [cycleMs, isActive]);
  const t = phase;
  const drop = t * 18;

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="lnAnim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <line x1="20" y1="130" x2="180" y2="130" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="100" cy={28 + drop} r="11" fill="url(#lnAnim)" opacity="0.9" />
      <line x1="100" y1={39 + drop} x2="100" y2={75 + drop} stroke="url(#lnAnim)" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1={55 + drop} x2="85" y2={65 + drop} stroke="url(#lnAnim)" strokeWidth="3" strokeLinecap="round" />
      <line x1="100" y1={55 + drop} x2="115" y2={65 + drop} stroke="url(#lnAnim)" strokeWidth="3" strokeLinecap="round" />
      <line x1="100" y1={75 + drop} x2={85 - t * 10} y2="130" stroke="url(#lnAnim)" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="100" y1={75 + drop} x2={115 + t * 15} y2="130" stroke="url(#lnAnim)" strokeWidth="3.5" strokeLinecap="round" />
      <text x="100" y="155" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="Inter, sans-serif">
        {phase === 0 ? 'STAND' : 'LUNGE'}
      </text>
    </svg>
  );
}

function MountainClimbersAnimation({ cycleMs, isActive }: { cycleMs: number; isActive: boolean }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!isActive) return;
    const iv = setInterval(() => setPhase(p => (p + 1) % 2), cycleMs);
    return () => clearInterval(iv);
  }, [cycleMs, isActive]);

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="mcAnim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <line x1="20" y1="130" x2="180" y2="130" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="60" cy="75" r="10" fill="url(#mcAnim)" opacity="0.9" />
      <line x1="60" y1="85" x2="110" y2="88" stroke="url(#mcAnim)" strokeWidth="4" strokeLinecap="round" />
      <line x1="65" y1="85" x2="60" y2="130" stroke="url(#mcAnim)" strokeWidth="3" strokeLinecap="round" />
      {phase === 0 ? (
        <>
          <line x1="110" y1="88" x2="85" y2="100" stroke="url(#mcAnim)" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="110" y1="88" x2="140" y2="130" stroke="url(#mcAnim)" strokeWidth="3.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1="110" y1="88" x2="130" y2="100" stroke="url(#mcAnim)" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="110" y1="88" x2="145" y2="130" stroke="url(#mcAnim)" strokeWidth="3.5" strokeLinecap="round" />
        </>
      )}
      <text x="100" y="155" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="Inter, sans-serif">
        {phase === 0 ? 'LEFT' : 'RIGHT'}
      </text>
    </svg>
  );
}

function BenchPressAnimation({ cycleMs, isActive }: { cycleMs: number; isActive: boolean }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!isActive) return;
    const iv = setInterval(() => setPhase(p => (p + 1) % 2), cycleMs / 2);
    return () => clearInterval(iv);
  }, [cycleMs, isActive]);
  const pressUp = phase * 25;

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="bpPrAnim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <rect x="50" y="95" width="100" height="8" rx="2" fill="#334155" />
      <line x1="55" y1="103" x2="55" y2="130" stroke="#334155" strokeWidth="3" />
      <line x1="145" y1="103" x2="145" y2="130" stroke="#334155" strokeWidth="3" />
      <circle cx="80" cy="85" r="10" fill="url(#bpPrAnim)" opacity="0.9" />
      <line x1="90" y1="88" x2="140" y2="90" stroke="url(#bpPrAnim)" strokeWidth="4" strokeLinecap="round" />
      <line x1="110" y1="88" x2="100" y2={95 - pressUp} stroke="url(#bpPrAnim)" strokeWidth="3" strokeLinecap="round" />
      <line x1="110" y1="88" x2="130" y2={95 - pressUp} stroke="url(#bpPrAnim)" strokeWidth="3" strokeLinecap="round" />
      <line x1="85" y1={95 - pressUp} x2="145" y2={95 - pressUp} stroke="#fb923c" strokeWidth="4" strokeLinecap="round" />
      <rect x="82" y={90 - pressUp} width="8" height="12" rx="1" fill="#fb923c" />
      <rect x="140" y={90 - pressUp} width="8" height="12" rx="1" fill="#fb923c" />
      <line x1="140" y1="90" x2="150" y2="130" stroke="url(#bpPrAnim)" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="140" y1="90" x2="160" y2="130" stroke="url(#bpPrAnim)" strokeWidth="3.5" strokeLinecap="round" />
      <text x="100" y="155" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="Inter, sans-serif">
        {phase === 0 ? 'LOWER' : 'PRESS'}
      </text>
    </svg>
  );
}

function JumpRopeAnimation({ cycleMs, isActive }: { cycleMs: number; isActive: boolean }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!isActive) return;
    const iv = setInterval(() => setPhase(p => (p + 1) % 4), cycleMs);
    return () => clearInterval(iv);
  }, [cycleMs, isActive]);
  const jumps = [0, -8, 0, 0];
  const jy = jumps[phase];

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="jrAnim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <line x1="20" y1="130" x2="180" y2="130" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="100" cy={45 + jy} r="11" fill="url(#jrAnim)" opacity="0.9" />
      <line x1="100" y1={56 + jy} x2="100" y2={90 + jy} stroke="url(#jrAnim)" strokeWidth="4" strokeLinecap="round" />
      <line x1="100" y1={65 + jy} x2="75" y2={70 + jy} stroke="url(#jrAnim)" strokeWidth="3" strokeLinecap="round" />
      <line x1="100" y1={65 + jy} x2="125" y2={70 + jy} stroke="url(#jrAnim)" strokeWidth="3" strokeLinecap="round" />
      <path
        d={phase < 2
          ? `M 75 ${70 + jy} Q 100 ${20 + jy} 125 ${70 + jy}`
          : `M 75 ${70 + jy} Q 100 ${130 + jy} 125 ${70 + jy}`}
        fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round"
      />
      <line x1="100" y1={90 + jy} x2="90" y2={130 + jy * 0.5} stroke="url(#jrAnim)" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="100" y1={90 + jy} x2="110" y2={130 + jy * 0.5} stroke="url(#jrAnim)" strokeWidth="3.5" strokeLinecap="round" />
      <text x="100" y="155" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="Inter, sans-serif">JUMP</text>
    </svg>
  );
}

const ANIM_MAP: Record<string, React.FC<{ cycleMs: number; isActive: boolean }>> = {
  pushup: PushUpAnimation,
  squat: SquatAnimation,
  plank: PlankAnimation,
  burpee: BurpeeAnimation,
  deadlift: DeadliftAnimation,
  pullup: PullUpAnimation,
  lunges: LungesAnimation,
  mountain_climbers: MountainClimbersAnimation,
  bench_press: BenchPressAnimation,
  jump_rope: JumpRopeAnimation,
};

export default function ExerciseAnimation({ animationData, isActive }: Props) {
  const Comp = ANIM_MAP[animationData.type];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {Comp ? (
        <Comp cycleMs={animationData.cycleMs} isActive={isActive} />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-dark-400 text-xs">{animationData.instruction || 'Follow along with the exercise'}</p>
        </div>
      )}
    </div>
  );
}
