import React, { useState, useEffect, useMemo } from 'react';
import { ExerciseAnimationData } from '../lib/supabase';

type Props = {
  animationData: ExerciseAnimationData;
  isActive: boolean;
};

type Pose = {
  head: { x: number; y: number; r?: number };
  torso: { x1: number; y1: number; x2: number; y2: number; rotation?: number };
  leftArm: { x1: number; y1: number; x2: number; y2: number; bend?: number };
  rightArm: { x1: number; y1: number; x2: number; y2: number; bend?: number };
  leftLeg: { x1: number; y1: number; x2: number; y2: number; bend?: number };
  rightLeg: { x1: number; y1: number; x2: number; y2: number; bend?: number };
  leftFoot?: { x: number; y: number };
  rightFoot?: { x: number; y: number };
};

type AnimationConfig = {
  frames: Pose[];
  cycleMs: number;
  label?: string;
};

function interpolate(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function interpolatePose(p1: Pose, p2: Pose, t: number): Pose {
  return {
    head: {
      x: interpolate(p1.head.x, p2.head.x, t),
      y: interpolate(p1.head.y, p2.head.y, t),
      r: interpolate(p1.head.r || 10, p2.head.r || 10, t),
    },
    torso: {
      x1: interpolate(p1.torso.x1, p2.torso.x1, t),
      y1: interpolate(p1.torso.y1, p2.torso.y1, t),
      x2: interpolate(p1.torso.x2, p2.torso.x2, t),
      y2: interpolate(p1.torso.y2, p2.torso.y2, t),
    },
    leftArm: {
      x1: interpolate(p1.leftArm.x1, p2.leftArm.x1, t),
      y1: interpolate(p1.leftArm.y1, p2.leftArm.y1, t),
      x2: interpolate(p1.leftArm.x2, p2.leftArm.x2, t),
      y2: interpolate(p1.leftArm.y2, p2.leftArm.y2, t),
      bend: interpolate(p1.leftArm.bend || 0, p2.leftArm.bend || 0, t),
    },
    rightArm: {
      x1: interpolate(p1.rightArm.x1, p2.rightArm.x1, t),
      y1: interpolate(p1.rightArm.y1, p2.rightArm.y1, t),
      x2: interpolate(p1.rightArm.x2, p2.rightArm.x2, t),
      y2: interpolate(p1.rightArm.y2, p2.rightArm.y2, t),
      bend: interpolate(p1.rightArm.bend || 0, p2.rightArm.bend || 0, t),
    },
    leftLeg: {
      x1: interpolate(p1.leftLeg.x1, p2.leftLeg.x1, t),
      y1: interpolate(p1.leftLeg.y1, p2.leftLeg.y1, t),
      x2: interpolate(p1.leftLeg.x2, p2.leftLeg.x2, t),
      y2: interpolate(p1.leftLeg.y2, p2.leftLeg.y2, t),
      bend: interpolate(p1.leftLeg.bend || 0, p2.leftLeg.bend || 0, t),
    },
    rightLeg: {
      x1: interpolate(p1.rightLeg.x1, p2.rightLeg.x1, t),
      y1: interpolate(p1.rightLeg.y1, p2.rightLeg.y1, t),
      x2: interpolate(p1.rightLeg.x2, p2.rightLeg.x2, t),
      y2: interpolate(p1.rightLeg.y2, p2.rightLeg.y2, t),
      bend: interpolate(p1.rightLeg.bend || 0, p2.rightLeg.bend || 0, t),
    },
    leftFoot: p1.leftFoot && p2.leftFoot ? {
      x: interpolate(p1.leftFoot.x, p2.leftFoot.x, t),
      y: interpolate(p1.leftFoot.y, p2.leftFoot.y, t),
    } : undefined,
    rightFoot: p1.rightFoot && p2.rightFoot ? {
      x: interpolate(p1.rightFoot.x, p2.rightFoot.x, t),
      y: interpolate(p1.rightFoot.y, p2.rightFoot.y, t),
    } : undefined,
  };
}

const ANIMATIONS: Record<string, AnimationConfig> = {
  // === STRENGTH EXERCISES ===
  pushup: {
    cycleMs: 2000,
    label: 'Push-Up',
    frames: [
      {
        head: { x: 85, y: 45 }, torso: { x1: 100, y1: 55, x2: 100, y2: 90 },
        leftArm: { x1: 100, y1: 60, x2: 100, y2: 130, bend: 0 },
        rightArm: { x1: 100, y1: 60, x2: 100, y2: 130, bend: 0 },
        leftLeg: { x1: 100, y1: 90, x2: 140, y2: 130 }, rightLeg: { x1: 100, y1: 90, x2: 150, y2: 130 },
      },
      {
        head: { x: 85, y: 60 }, torso: { x1: 100, y1: 70, x2: 100, y2: 105 },
        leftArm: { x1: 100, y1: 75, x2: 100, y2: 130, bend: 80 },
        rightArm: { x1: 100, y1: 75, x2: 100, y2: 130, bend: 80 },
        leftLeg: { x1: 100, y1: 105, x2: 140, y2: 130 }, rightLeg: { x1: 100, y1: 105, x2: 150, y2: 130 },
      },
    ],
  },
  squat: {
    cycleMs: 2500,
    label: 'Squat',
    frames: [
      {
        head: { x: 100, y: 28 }, torso: { x1: 100, y1: 40, x2: 100, y2: 75 },
        leftArm: { x1: 100, y1: 50, x2: 80, y2: 70 }, rightArm: { x1: 100, y1: 50, x2: 120, y2: 70 },
        leftLeg: { x1: 100, y1: 75, x2: 85, y2: 130 }, rightLeg: { x1: 100, y1: 75, x2: 115, y2: 130 },
      },
      {
        head: { x: 100, y: 50 }, torso: { x1: 100, y1: 62, x2: 100, y2: 95 },
        leftArm: { x1: 100, y1: 70, x2: 70, y2: 80 }, rightArm: { x1: 100, y1: 70, x2: 130, y2: 80 },
        leftLeg: { x1: 100, y1: 95, x2: 75, y2: 130, bend: 70 }, rightLeg: { x1: 100, y1: 95, x2: 125, y2: 130, bend: 70 },
      },
    ],
  },
  plank: {
    cycleMs: 3000,
    label: 'Hold',
    frames: [
      {
        head: { x: 55, y: 78 }, torso: { x1: 65, y1: 80, x2: 150, y2: 85 },
        leftArm: { x1: 70, y1: 80, x2: 65, y2: 130 }, rightArm: { x1: 130, y1: 85, x2: 135, y2: 130 },
        leftLeg: { x1: 150, y1: 85, x2: 170, y2: 130 }, rightLeg: { x1: 150, y1: 85, x2: 155, y2: 130 },
      },
      {
        head: { x: 55, y: 76 }, torso: { x1: 65, y1: 78, x2: 150, y2: 83 },
        leftArm: { x1: 70, y1: 78, x2: 65, y2: 130 }, rightArm: { x1: 130, y1: 83, x2: 135, y2: 130 },
        leftLeg: { x1: 150, y1: 83, x2: 170, y2: 130 }, rightLeg: { x1: 150, y1: 83, x2: 155, y2: 130 },
      },
    ],
  },
  lunges: {
    cycleMs: 2500,
    label: 'Lunges',
    frames: [
      {
        head: { x: 100, y: 30 }, torso: { x1: 100, y1: 42, x2: 100, y2: 78 },
        leftArm: { x1: 100, y1: 55, x2: 85, y2: 70 }, rightArm: { x1: 100, y1: 55, x2: 115, y2: 70 },
        leftLeg: { x1: 100, y1: 78, x2: 85, y2: 130 }, rightLeg: { x1: 100, y1: 78, x2: 115, y2: 130 },
      },
      {
        head: { x: 100, y: 48 }, torso: { x1: 100, y1: 60, x2: 100, y2: 92 },
        leftArm: { x1: 100, y1: 70, x2: 85, y2: 85 }, rightArm: { x1: 100, y1: 70, x2: 115, y2: 85 },
        leftLeg: { x1: 100, y1: 92, x2: 70, y2: 130, bend: 90 }, rightLeg: { x1: 100, y1: 92, x2: 130, y2: 100 },
      },
    ],
  },
  deadlift: {
    cycleMs: 3000,
    label: 'Deadlift',
    frames: [
      {
        head: { x: 105, y: 28 }, torso: { x1: 110, y1: 40, x2: 105, y2: 75 },
        leftArm: { x1: 105, y1: 55, x2: 105, y2: 130 }, rightArm: { x1: 105, y1: 55, x2: 115, y2: 130 },
        leftLeg: { x1: 105, y1: 75, x2: 90, y2: 130 }, rightLeg: { x1: 105, y1: 75, x2: 120, y2: 130 },
      },
      {
        head: { x: 125, y: 45 }, torso: { x1: 130, y1: 55, x2: 120, y2: 90 },
        leftArm: { x1: 125, y1: 70, x2: 115, y2: 130 }, rightArm: { x1: 125, y1: 70, x2: 125, y2: 130 },
        leftLeg: { x1: 120, y1: 90, x2: 90, y2: 130, bend: 30 }, rightLeg: { x1: 120, y1: 90, x2: 130, y2: 130, bend: 30 },
      },
    ],
  },
  pullup: {
    cycleMs: 2500,
    label: 'Pull-Up',
    frames: [
      {
        head: { x: 100, y: 55 }, torso: { x1: 100, y1: 66, x2: 100, y2: 105 },
        leftArm: { x1: 100, y1: 58, x2: 85, y2: 30 }, rightArm: { x1: 100, y1: 58, x2: 115, y2: 30 },
        leftLeg: { x1: 100, y1: 105, x2: 90, y2: 135 }, rightLeg: { x1: 100, y1: 105, x2: 110, y2: 135 },
      },
      {
        head: { x: 100, y: 30 }, torso: { x1: 100, y1: 42, x2: 100, y2: 80 },
        leftArm: { x1: 100, y1: 35, x2: 85, y2: 30, bend: 90 }, rightArm: { x1: 100, y1: 35, x2: 115, y2: 30, bend: 90 },
        leftLeg: { x1: 100, y1: 80, x2: 90, y2: 135 }, rightLeg: { x1: 100, y1: 80, x2: 110, y2: 135 },
      },
    ],
  },
  bench_press: {
    cycleMs: 2500,
    label: 'Press',
    frames: [
      {
        head: { x: 80, y: 85 }, torso: { x1: 90, y1: 88, x2: 140, y2: 90 },
        leftArm: { x1: 110, y1: 88, x2: 100, y2: 105 }, rightArm: { x1: 110, y1: 88, x2: 130, y2: 105 },
        leftLeg: { x1: 140, y1: 90, x2: 150, y2: 135 }, rightLeg: { x1: 140, y1: 90, x2: 160, y2: 135 },
      },
      {
        head: { x: 80, y: 85 }, torso: { x1: 90, y1: 88, x2: 140, y2: 90 },
        leftArm: { x1: 110, y1: 88, x2: 100, y2: 55, bend: 30 }, rightArm: { x1: 110, y1: 88, x2: 130, y2: 55, bend: 30 },
        leftLeg: { x1: 140, y1: 90, x2: 150, y2: 135 }, rightLeg: { x1: 140, y1: 90, x2: 160, y2: 135 },
      },
    ],
  },

  // === CARDIO EXERCISES ===
  burpee: {
    cycleMs: 3000,
    label: 'Burpee',
    frames: [
      {
        head: { x: 100, y: 28 }, torso: { x1: 100, y1: 40, x2: 100, y2: 70 },
        leftArm: { x1: 100, y1: 45, x2: 75, y2: 25 }, rightArm: { x1: 100, y1: 45, x2: 125, y2: 25 },
        leftLeg: { x1: 100, y1: 70, x2: 85, y2: 130 }, rightLeg: { x1: 100, y1: 70, x2: 115, y2: 130 },
      },
      {
        head: { x: 100, y: 78 }, torso: { x1: 100, y1: 88, x2: 100, y2: 95 },
        leftArm: { x1: 100, y1: 90, x2: 80, y2: 130 }, rightArm: { x1: 100, y1: 90, x2: 120, y2: 130 },
        leftLeg: { x1: 100, y1: 95, x2: 75, y2: 130 }, rightLeg: { x1: 100, y1: 95, x2: 125, y2: 130 },
      },
      {
        head: { x: 100, y: 48 }, torso: { x1: 100, y1: 60, x2: 100, y2: 90 },
        leftArm: { x1: 100, y1: 65, x2: 85, y2: 70 }, rightArm: { x1: 100, y1: 65, x2: 115, y2: 70 },
        leftLeg: { x1: 100, y1: 90, x2: 85, y2: 130, bend: 90 }, rightLeg: { x1: 100, y1: 90, x2: 115, y2: 130, bend: 90 },
      },
    ],
  },
  mountain_climbers: {
    cycleMs: 800,
    label: 'Climbers',
    frames: [
      {
        head: { x: 55, y: 78 }, torso: { x1: 65, y1: 80, x2: 150, y2: 85 },
        leftArm: { x1: 70, y1: 80, x2: 65, y2: 130 }, rightArm: { x1: 130, y1: 85, x2: 135, y2: 130 },
        leftLeg: { x1: 150, y1: 85, x2: 100, y2: 100 }, rightLeg: { x1: 150, y1: 85, x2: 170, y2: 130 },
      },
      {
        head: { x: 55, y: 78 }, torso: { x1: 65, y1: 80, x2: 150, y2: 85 },
        leftArm: { x1: 70, y1: 80, x2: 65, y2: 130 }, rightArm: { x1: 130, y1: 85, x2: 135, y2: 130 },
        leftLeg: { x1: 150, y1: 85, x2: 170, y2: 130 }, rightLeg: { x1: 150, y1: 85, x2: 100, y2: 100 },
      },
    ],
  },
  jump_rope: {
    cycleMs: 600,
    label: 'Jump',
    frames: [
      {
        head: { x: 100, y: 45 }, torso: { x1: 100, y1: 56, x2: 100, y2: 90 },
        leftArm: { x1: 100, y1: 65, x2: 75, y2: 70 }, rightArm: { x1: 100, y1: 65, x2: 125, y2: 70 },
        leftLeg: { x1: 100, y1: 90, x2: 90, y2: 130 }, rightLeg: { x1: 100, y1: 90, x2: 110, y2: 130 },
      },
      {
        head: { x: 100, y: 37 }, torso: { x1: 100, y1: 48, x2: 100, y2: 82 },
        leftArm: { x1: 100, y1: 57, x2: 75, y2: 62 }, rightArm: { x1: 100, y1: 57, x2: 125, y2: 62 },
        leftLeg: { x1: 100, y1: 82, x2: 90, y2: 120 }, rightLeg: { x1: 100, y1: 82, x2: 110, y2: 120 },
      },
    ],
  },
  box_jumps: {
    cycleMs: 2000,
    label: 'Box Jump',
    frames: [
      {
        head: { x: 70, y: 45 }, torso: { x1: 75, y1: 56, x2: 75, y2: 90 },
        leftArm: { x1: 75, y1: 62, x2: 60, y2: 80 }, rightArm: { x1: 75, y1: 62, x2: 90, y2: 80 },
        leftLeg: { x1: 75, y1: 90, x2: 65, y2: 130 }, rightLeg: { x1: 75, y1: 90, x2: 85, y2: 130 },
      },
      {
        head: { x: 100, y: 25 }, torso: { x1: 105, y1: 36, x2: 105, y2: 70 },
        leftArm: { x1: 105, y1: 45, x2: 85, y2: 55 }, rightArm: { x1: 105, y1: 45, x2: 125, y2: 55 },
        leftLeg: { x1: 105, y1: 70, x2: 90, y2: 95 }, rightLeg: { x1: 105, y1: 70, x2: 120, y2: 95 },
      },
    ],
  },
  jump_squats: {
    cycleMs: 1500,
    label: 'Jump Squat',
    frames: [
      {
        head: { x: 100, y: 50 }, torso: { x1: 100, y1: 62, x2: 100, y2: 95 },
        leftArm: { x1: 100, y1: 72, x2: 70, y2: 82 }, rightArm: { x1: 100, y1: 72, x2: 130, y2: 82 },
        leftLeg: { x1: 100, y1: 95, x2: 75, y2: 130, bend: 90 }, rightLeg: { x1: 100, y1: 95, x2: 125, y2: 130, bend: 90 },
      },
      {
        head: { x: 100, y: 25 }, torso: { x1: 100, y1: 37, x2: 100, y2: 70 },
        leftArm: { x1: 100, y1: 50, x2: 65, y2: 35 }, rightArm: { x1: 100, y1: 50, x2: 135, y2: 35 },
        leftLeg: { x1: 100, y1: 70, x2: 85, y2: 110 }, rightLeg: { x1: 100, y1: 70, x2: 115, y2: 110 },
      },
    ],
  },
  shuttle_runs: {
    cycleMs: 1200,
    label: 'Shuttle',
    frames: [
      {
        head: { x: 90, y: 30 }, torso: { x1: 95, y1: 42, x2: 95, y2: 78, rotation: -15 },
        leftArm: { x1: 95, y1: 55, x2: 70, y2: 85 }, rightArm: { x1: 95, y1: 55, x2: 120, y2: 45 },
        leftLeg: { x1: 95, y1: 78, x2: 75, y2: 130 }, rightLeg: { x1: 95, y1: 78, x2: 115, y2: 130 },
      },
      {
        head: { x: 110, y: 30 }, torso: { x1: 105, y1: 42, x2: 105, y2: 78, rotation: 15 },
        leftArm: { x1: 105, y1: 55, x2: 80, y2: 45 }, rightArm: { x1: 105, y1: 55, x2: 130, y2: 85 },
        leftLeg: { x1: 105, y1: 78, x2: 85, y2: 130 }, rightLeg: { x1: 105, y1: 78, x2: 125, y2: 130 },
      },
    ],
  },
  skipping_high_knees: {
    cycleMs: 700,
    label: 'High Knees',
    frames: [
      {
        head: { x: 100, y: 30 }, torso: { x1: 100, y1: 42, x2: 100, y2: 78 },
        leftArm: { x1: 100, y1: 55, x2: 70, y2: 45 }, rightArm: { x1: 100, y1: 55, x2: 130, y2: 85 },
        leftLeg: { x1: 100, y1: 78, x2: 80, y2: 100 }, rightLeg: { x1: 100, y1: 78, x2: 110, y2: 130 },
      },
      {
        head: { x: 100, y: 30 }, torso: { x1: 100, y1: 42, x2: 100, y2: 78 },
        leftArm: { x1: 100, y1: 55, x2: 70, y2: 85 }, rightArm: { x1: 100, y1: 55, x2: 130, y2: 45 },
        leftLeg: { x1: 100, y1: 78, x2: 90, y2: 130 }, rightLeg: { x1: 100, y1: 78, x2: 120, y2: 100 },
      },
    ],
  },
  sprint_intervals: {
    cycleMs: 600,
    label: 'Sprint',
    frames: [
      {
        head: { x: 95, y: 25 }, torso: { x1: 100, y1: 37, x2: 100, y2: 73, rotation: -20 },
        leftArm: { x1: 100, y1: 50, x2: 65, y2: 35 }, rightArm: { x1: 100, y1: 50, x2: 135, y2: 85 },
        leftLeg: { x1: 100, y1: 73, x2: 70, y2: 100 }, rightLeg: { x1: 100, y1: 73, x2: 130, y2: 130 },
      },
      {
        head: { x: 105, y: 25 }, torso: { x1: 100, y1: 37, x2: 100, y2: 73, rotation: 20 },
        leftArm: { x1: 100, y1: 50, x2: 65, y2: 85 }, rightArm: { x1: 100, y1: 50, x2: 135, y2: 35 },
        leftLeg: { x1: 100, y1: 73, x2: 70, y2: 130 }, rightLeg: { x1: 100, y1: 73, x2: 130, y2: 100 },
      },
    ],
  },
  stair_climbing: {
    cycleMs: 1000,
    label: 'Stairs',
    frames: [
      {
        head: { x: 95, y: 30 }, torso: { x1: 100, y1: 42, x2: 100, y2: 78 },
        leftArm: { x1: 100, y1: 55, x2: 80, y2: 70 }, rightArm: { x1: 100, y1: 55, x2: 120, y2: 70 },
        leftLeg: { x1: 100, y1: 78, x2: 80, y2: 115 }, rightLeg: { x1: 100, y1: 78, x2: 115, y2: 130 },
      },
      {
        head: { x: 95, y: 22 }, torso: { x1: 100, y1: 34, x2: 100, y2: 70 },
        leftArm: { x1: 100, y1: 48, x2: 80, y2: 62 }, rightArm: { x1: 100, y1: 48, x2: 120, y2: 62 },
        leftLeg: { x1: 100, y1: 70, x2: 80, y2: 105 }, rightLeg: { x1: 100, y1: 70, x2: 115, y2: 115 },
      },
    ],
  },

  // === WEIGHT LOSS EXERCISES ===
  jumping_jacks: {
    cycleMs: 800,
    label: 'Jumping Jack',
    frames: [
      {
        head: { x: 100, y: 30 }, torso: { x1: 100, y1: 42, x2: 100, y2: 78 },
        leftArm: { x1: 100, y1: 50, x2: 80, y2: 70 }, rightArm: { x1: 100, y1: 50, x2: 120, y2: 70 },
        leftLeg: { x1: 100, y1: 78, x2: 90, y2: 130 }, rightLeg: { x1: 100, y1: 78, x2: 110, y2: 130 },
      },
      {
        head: { x: 100, y: 22 }, torso: { x1: 100, y1: 34, x2: 100, y2: 70 },
        leftArm: { x1: 100, y1: 42, x2: 50, y2: 25 }, rightArm: { x1: 100, y1: 42, x2: 150, y2: 25 },
        leftLeg: { x1: 100, y1: 70, x2: 70, y2: 125 }, rightLeg: { x1: 100, y1: 70, x2: 130, y2: 125 },
      },
    ],
  },
  high_knees: {
    cycleMs: 700,
    label: 'High Knees',
    frames: [
      {
        head: { x: 100, y: 30 }, torso: { x1: 100, y1: 42, x2: 100, y2: 78 },
        leftArm: { x1: 100, y1: 55, x2: 70, y2: 45 }, rightArm: { x1: 100, y1: 55, x2: 130, y2: 85 },
        leftLeg: { x1: 100, y1: 78, x2: 80, y2: 100 }, rightLeg: { x1: 100, y1: 78, x2: 110, y2: 130 },
      },
      {
        head: { x: 100, y: 30 }, torso: { x1: 100, y1: 42, x2: 100, y2: 78 },
        leftArm: { x1: 100, y1: 55, x2: 70, y2: 85 }, rightArm: { x1: 100, y1: 55, x2: 130, y2: 45 },
        leftLeg: { x1: 100, y1: 78, x2: 90, y2: 130 }, rightLeg: { x1: 100, y1: 78, x2: 120, y2: 100 },
      },
    ],
  },
  butt_kicks: {
    cycleMs: 700,
    label: 'Butt Kicks',
    frames: [
      {
        head: { x: 100, y: 30 }, torso: { x1: 100, y1: 42, x2: 100, y2: 78 },
        leftArm: { x1: 100, y1: 55, x2: 70, y2: 70 }, rightArm: { x1: 100, y1: 55, x2: 130, y2: 70 },
        leftLeg: { x1: 100, y1: 78, x2: 80, y2: 130 }, rightLeg: { x1: 100, y1: 78, x2: 115, y2: 85 },
      },
      {
        head: { x: 100, y: 30 }, torso: { x1: 100, y1: 42, x2: 100, y2: 78 },
        leftArm: { x1: 100, y1: 55, x2: 70, y2: 70 }, rightArm: { x1: 100, y1: 55, x2: 130, y2: 70 },
        leftLeg: { x1: 100, y1: 78, x2: 85, y2: 85 }, rightLeg: { x1: 100, y1: 78, x2: 120, y2: 130 },
      },
    ],
  },
  skaters: {
    cycleMs: 1200,
    label: 'Skaters',
    frames: [
      {
        head: { x: 75, y: 35 }, torso: { x1: 80, y1: 47, x2: 80, y2: 83, rotation: -15 },
        leftArm: { x1: 80, y1: 60, x2: 50, y2: 45 }, rightArm: { x1: 80, y1: 60, x2: 100, y2: 80 },
        leftLeg: { x1: 80, y1: 83, x2: 55, y2: 130 }, rightLeg: { x1: 80, y1: 83, x2: 100, y2: 95 },
      },
      {
        head: { x: 125, y: 35 }, torso: { x1: 120, y1: 47, x2: 120, y2: 83, rotation: 15 },
        leftArm: { x1: 120, y1: 60, x2: 100, y2: 80 }, rightArm: { x1: 120, y1: 60, x2: 150, y2: 45 },
        leftLeg: { x1: 120, y1: 83, x2: 100, y2: 95 }, rightLeg: { x1: 120, y1: 83, x2: 145, y2: 130 },
      },
    ],
  },
  speed_squats: {
    cycleMs: 1000,
    label: 'Speed Squats',
    frames: [
      {
        head: { x: 100, y: 28 }, torso: { x1: 100, y1: 40, x2: 100, y2: 75 },
        leftArm: { x1: 100, y1: 50, x2: 80, y2: 65 }, rightArm: { x1: 100, y1: 50, x2: 120, y2: 65 },
        leftLeg: { x1: 100, y1: 75, x2: 85, y2: 130 }, rightLeg: { x1: 100, y1: 75, x2: 115, y2: 130 },
      },
      {
        head: { x: 100, y: 48 }, torso: { x1: 100, y1: 60, x2: 100, y2: 92 },
        leftArm: { x1: 100, y1: 70, x2: 70, y2: 78 }, rightArm: { x1: 100, y1: 70, x2: 130, y2: 78 },
        leftLeg: { x1: 100, y1: 92, x2: 75, y2: 130, bend: 90 }, rightLeg: { x1: 100, y1: 92, x2: 125, y2: 130, bend: 90 },
      },
    ],
  },
  tuck_jumps: {
    cycleMs: 1500,
    label: 'Tuck Jump',
    frames: [
      {
        head: { x: 100, y: 30 }, torso: { x1: 100, y1: 42, x2: 100, y2: 78 },
        leftArm: { x1: 100, y1: 50, x2: 80, y2: 70 }, rightArm: { x1: 100, y1: 50, x2: 120, y2: 70 },
        leftLeg: { x1: 100, y1: 78, x2: 85, y2: 130 }, rightLeg: { x1: 100, y1: 78, x2: 115, y2: 130 },
      },
      {
        head: { x: 100, y: 15 }, torso: { x1: 100, y1: 27, x2: 100, y2: 60 },
        leftArm: { x1: 100, y1: 38, x2: 65, y2: 25 }, rightArm: { x1: 100, y1: 38, x2: 135, y2: 25 },
        leftLeg: { x1: 100, y1: 60, x2: 85, y2: 85 }, rightLeg: { x1: 100, y1: 60, x2: 115, y2: 85 },
      },
    ],
  },

  // === YOGA EXERCISES ===
  downward_dog: {
    cycleMs: 3000,
    label: 'Hold',
    frames: [
      {
        head: { x: 55, y: 85 }, torso: { x1: 65, y1: 80, x2: 145, y2: 55 },
        leftArm: { x1: 70, y1: 78, x2: 60, y2: 130 }, rightArm: { x1: 130, y1: 65, x2: 140, y2: 130 },
        leftLeg: { x1: 145, y1: 55, x2: 160, y2: 130 }, rightLeg: { x1: 145, y1: 55, x2: 155, y2: 130 },
      },
      {
        head: { x: 55, y: 83 }, torso: { x1: 65, y1: 78, x2: 145, y2: 53 },
        leftArm: { x1: 70, y1: 76, x2: 60, y2: 130 }, rightArm: { x1: 130, y1: 63, x2: 140, y2: 130 },
        leftLeg: { x1: 145, y1: 53, x2: 160, y2: 130 }, rightLeg: { x1: 145, y1: 53, x2: 155, y2: 130 },
      },
    ],
  },
  warrior_ii: {
    cycleMs: 3000,
    label: 'Hold',
    frames: [
      {
        head: { x: 70, y: 30 }, torso: { x1: 80, y1: 42, x2: 80, y2: 78 },
        leftArm: { x1: 80, y1: 55, x2: 35, y2: 55 }, rightArm: { x1: 80, y1: 55, x2: 125, y2: 55 },
        leftLeg: { x1: 80, y1: 78, x2: 45, y2: 130 }, rightLeg: { x1: 80, y1: 78, x2: 115, y2: 130, bend: 90 },
      },
      {
        head: { x: 70, y: 28 }, torso: { x1: 80, y1: 40, x2: 80, y2: 76 },
        leftArm: { x1: 80, y1: 53, x2: 35, y2: 53 }, rightArm: { x1: 80, y1: 53, x2: 125, y2: 53 },
        leftLeg: { x1: 80, y1: 76, x2: 45, y2: 130 }, rightLeg: { x1: 80, y1: 76, x2: 115, y2: 130, bend: 90 },
      },
    ],
  },
  tree_pose: {
    cycleMs: 3000,
    label: 'Balance',
    frames: [
      {
        head: { x: 100, y: 28 }, torso: { x1: 100, y1: 40, x2: 100, y2: 76 },
        leftArm: { x1: 100, y1: 50, x2: 70, y2: 35 }, rightArm: { x1: 100, y1: 50, x2: 130, y2: 35 },
        leftLeg: { x1: 100, y1: 76, x2: 85, y2: 130 }, rightLeg: { x1: 100, y1: 76, x2: 115, y2: 90 },
      },
      {
        head: { x: 100, y: 26 }, torso: { x1: 100, y1: 38, x2: 100, y2: 74 },
        leftArm: { x1: 100, y1: 48, x2: 70, y2: 33 }, rightArm: { x1: 100, y1: 48, x2: 130, y2: 33 },
        leftLeg: { x1: 100, y1: 74, x2: 85, y2: 130 }, rightLeg: { x1: 100, y1: 74, x2: 115, y2: 88 },
      },
    ],
  },
  chair_pose: {
    cycleMs: 3000,
    label: 'Chair',
    frames: [
      {
        head: { x: 100, y: 45 }, torso: { x1: 100, y1: 57, x2: 100, y2: 92, rotation: 20 },
        leftArm: { x1: 100, y1: 62, x2: 70, y2: 35 }, rightArm: { x1: 100, y1: 62, x2: 130, y2: 35 },
        leftLeg: { x1: 100, y1: 92, x2: 80, y2: 130, bend: 100 }, rightLeg: { x1: 100, y1: 92, x2: 120, y2: 130, bend: 100 },
      },
      {
        head: { x: 100, y: 43 }, torso: { x1: 100, y1: 55, x2: 100, y2: 90, rotation: 20 },
        leftArm: { x1: 100, y1: 60, x2: 70, y2: 33 }, rightArm: { x1: 100, y1: 60, x2: 130, y2: 33 },
        leftLeg: { x1: 100, y1: 90, x2: 80, y2: 130, bend: 100 }, rightLeg: { x1: 100, y1: 90, x2: 120, y2: 130, bend: 100 },
      },
    ],
  },
  cobra_pose: {
    cycleMs: 3000,
    label: 'Cobra',
    frames: [
      {
        head: { x: 60, y: 65 }, torso: { x1: 70, y1: 75, x2: 140, y2: 130 },
        leftArm: { x1: 80, y1: 85, x2: 65, y2: 130 }, rightArm: { x1: 110, y1: 100, x2: 125, y2: 130 },
        leftLeg: { x1: 140, y1: 130, x2: 140, y2: 130 }, rightLeg: { x1: 140, y1: 130, x2: 140, y2: 130 },
      },
      {
        head: { x: 55, y: 50 }, torso: { x1: 65, y1: 60, x2: 140, y2: 130 },
        leftArm: { x1: 75, y1: 70, x2: 55, y2: 130 }, rightArm: { x1: 100, y1: 85, x2: 120, y2: 130 },
        leftLeg: { x1: 140, y1: 130, x2: 140, y2: 130 }, rightLeg: { x1: 140, y1: 130, x2: 140, y2: 130 },
      },
    ],
  },
  sun_salutation: {
    cycleMs: 6000,
    label: 'Flow',
    frames: [
      {
        head: { x: 100, y: 28 }, torso: { x1: 100, y1: 40, x2: 100, y2: 76 },
        leftArm: { x1: 100, y1: 50, x2: 70, y2: 30 }, rightArm: { x1: 100, y1: 50, x2: 130, y2: 30 },
        leftLeg: { x1: 100, y1: 76, x2: 85, y2: 130 }, rightLeg: { x1: 100, y1: 76, x2: 115, y2: 130 },
      },
      {
        head: { x: 80, y: 50 }, torso: { x1: 90, y1: 62, x2: 90, y2: 98 },
        leftArm: { x1: 90, y1: 72, x2: 65, y2: 85 }, rightArm: { x1: 90, y1: 72, x2: 115, y2: 85 },
        leftLeg: { x1: 90, y1: 98, x2: 75, y2: 130, bend: 90 }, rightLeg: { x1: 90, y1: 98, x2: 105, y2: 130, bend: 90 },
      },
      {
        head: { x: 55, y: 85 }, torso: { x1: 65, y1: 80, x2: 145, y2: 55 },
        leftArm: { x1: 70, y1: 78, x2: 60, y2: 130 }, rightArm: { x1: 130, y1: 65, x2: 140, y2: 130 },
        leftLeg: { x1: 145, y1: 55, x2: 160, y2: 130 }, rightLeg: { x1: 145, y1: 55, x2: 155, y2: 130 },
      },
      {
        head: { x: 60, y: 110 }, torso: { x1: 70, y1: 100, x2: 140, y2: 130 },
        leftArm: { x1: 75, y1: 110, x2: 55, y2: 130 }, rightArm: { x1: 110, y1: 120, x2: 125, y2: 130 },
        leftLeg: { x1: 140, y1: 130, x2: 140, y2: 130 }, rightLeg: { x1: 140, y1: 130, x2: 145, y2: 130 },
      },
    ],
  },

  // === HOME EXERCISES ===
  bicycle_crunches: {
    cycleMs: 1200,
    label: 'Crunches',
    frames: [
      {
        head: { x: 75, y: 55 }, torso: { x1: 85, y1: 60, x2: 130, y2: 90 },
        leftArm: { x1: 90, y1: 65, x2: 70, y2: 50 }, rightArm: { x1: 110, y1: 75, x2: 130, y2: 60 },
        leftLeg: { x1: 130, y1: 90, x2: 100, y2: 105 }, rightLeg: { x1: 130, y1: 90, x2: 155, y2: 130 },
      },
      {
        head: { x: 75, y: 55 }, torso: { x1: 85, y1: 60, x2: 130, y2: 90 },
        leftArm: { x1: 90, y1: 65, x2: 70, y2: 60 }, rightArm: { x1: 110, y1: 75, x2: 130, y2: 50 },
        leftLeg: { x1: 130, y1: 90, x2: 155, y2: 130 }, rightLeg: { x1: 130, y1: 90, x2: 100, y2: 105 },
      },
    ],
  },
  flutter_kicks: {
    cycleMs: 800,
    label: 'Flutter',
    frames: [
      {
        head: { x: 60, y: 85 }, torso: { x1: 70, y1: 90, x2: 140, y2: 90 },
        leftArm: { x1: 80, y1: 90, x2: 65, y2: 130 }, rightArm: { x1: 120, y1: 90, x2: 135, y2: 130 },
        leftLeg: { x1: 140, y1: 90, x2: 145, y2: 100 }, rightLeg: { x1: 140, y1: 90, x2: 155, y2: 130 },
      },
      {
        head: { x: 60, y: 85 }, torso: { x1: 70, y1: 90, x2: 140, y2: 90 },
        leftArm: { x1: 80, y1: 90, x2: 65, y2: 130 }, rightArm: { x1: 120, y1: 90, x2: 135, y2: 130 },
        leftLeg: { x1: 140, y1: 90, x2: 155, y2: 130 }, rightLeg: { x1: 140, y1: 90, x2: 145, y2: 100 },
      },
    ],
  },
  inchworm: {
    cycleMs: 4000,
    label: 'Inchworm',
    frames: [
      {
        head: { x: 100, y: 30 }, torso: { x1: 100, y1: 42, x2: 100, y2: 78 },
        leftArm: { x1: 100, y1: 50, x2: 80, y2: 70 }, rightArm: { x1: 100, y1: 50, x2: 120, y2: 70 },
        leftLeg: { x1: 100, y1: 78, x2: 85, y2: 130 }, rightLeg: { x1: 100, y1: 78, x2: 115, y2: 130 },
      },
      {
        head: { x: 55, y: 78 }, torso: { x1: 65, y1: 80, x2: 150, y2: 85 },
        leftArm: { x1: 70, y1: 80, x2: 60, y2: 130 }, rightArm: { x1: 140, y1: 85, x2: 150, y2: 130 },
        leftLeg: { x1: 150, y1: 85, x2: 160, y2: 130 }, rightLeg: { x1: 150, y1: 85, x2: 155, y2: 130 },
      },
    ],
  },
  shoulder_tap: {
    cycleMs: 1500,
    label: 'Tap',
    frames: [
      {
        head: { x: 55, y: 78 }, torso: { x1: 65, y1: 80, x2: 150, y2: 85 },
        leftArm: { x1: 70, y1: 80, x2: 65, y2: 130 }, rightArm: { x1: 140, y1: 85, x2: 135, y2: 130 },
        leftLeg: { x1: 150, y1: 85, x2: 160, y2: 130 }, rightLeg: { x1: 150, y1: 85, x2: 155, y2: 130 },
      },
      {
        head: { x: 55, y: 78 }, torso: { x1: 65, y1: 80, x2: 150, y2: 85 },
        leftArm: { x1: 70, y1: 80, x2: 65, y2: 130 }, rightArm: { x1: 140, y1: 85, x2: 95, y2: 75 },
        leftLeg: { x1: 150, y1: 85, x2: 160, y2: 130 }, rightLeg: { x1: 150, y1: 85, x2: 155, y2: 130 },
      },
    ],
  },
  step_ups: {
    cycleMs: 2000,
    label: 'Step Up',
    frames: [
      {
        head: { x: 70, y: 30 }, torso: { x1: 75, y1: 42, x2: 75, y2: 78 },
        leftArm: { x1: 75, y1: 55, x2: 60, y2: 70 }, rightArm: { x1: 75, y1: 55, x2: 90, y2: 70 },
        leftLeg: { x1: 75, y1: 78, x2: 65, y2: 130 }, rightLeg: { x1: 75, y1: 78, x2: 85, y2: 130 },
      },
      {
        head: { x: 100, y: 45 }, torso: { x1: 105, y1: 57, x2: 105, y2: 93 },
        leftArm: { x1: 105, y1: 70, x2: 90, y2: 85 }, rightArm: { x1: 105, y1: 70, x2: 120, y2: 85 },
        leftLeg: { x1: 105, y1: 93, x2: 95, y2: 93 }, rightLeg: { x1: 105, y1: 93, x2: 115, y2: 93 },
      },
    ],
  },
  wall_sit: {
    cycleMs: 3000,
    label: 'Hold',
    frames: [
      {
        head: { x: 50, y: 25 }, torso: { x1: 55, y1: 37, x2: 55, y2: 73 },
        leftArm: { x1: 55, y1: 50, x2: 55, y2: 70 }, rightArm: { x1: 55, y1: 50, x2: 55, y2: 70 },
        leftLeg: { x1: 55, y1: 73, x2: 55, y2: 73, bend: 90 }, rightLeg: { x1: 55, y1: 73, x2: 95, y2: 73, bend: 90 },
      },
      {
        head: { x: 50, y: 24 }, torso: { x1: 55, y1: 36, x2: 55, y2: 72 },
        leftArm: { x1: 55, y1: 49, x2: 55, y2: 69 }, rightArm: { x1: 55, y1: 49, x2: 55, y2: 69 },
        leftLeg: { x1: 55, y1: 72, x2: 55, y2: 72, bend: 90 }, rightLeg: { x1: 55, y1: 72, x2: 95, y2: 72, bend: 90 },
      },
    ],
  },

  // === MUSCLE GAIN EXERCISES ===
  bicep_curl: {
    cycleMs: 2500,
    label: 'Curl',
    frames: [
      {
        head: { x: 100, y: 28 }, torso: { x1: 100, y1: 40, x2: 100, y2: 78 },
        leftArm: { x1: 100, y1: 50, x2: 85, y2: 100, bend: 170 }, rightArm: { x1: 100, y1: 50, x2: 115, y2: 100, bend: 170 },
        leftLeg: { x1: 100, y1: 78, x2: 85, y2: 130 }, rightLeg: { x1: 100, y1: 78, x2: 115, y2: 130 },
      },
      {
        head: { x: 100, y: 28 }, torso: { x1: 100, y1: 40, x2: 100, y2: 78 },
        leftArm: { x1: 100, y1: 50, x2: 85, y2: 55, bend: 50 }, rightArm: { x1: 100, y1: 50, x2: 115, y2: 55, bend: 50 },
        leftLeg: { x1: 100, y1: 78, x2: 85, y2: 130 }, rightLeg: { x1: 100, y1: 78, x2: 115, y2: 130 },
      },
    ],
  },
  calf_raise: {
    cycleMs: 2000,
    label: 'Raise',
    frames: [
      {
        head: { x: 100, y: 30 }, torso: { x1: 100, y1: 42, x2: 100, y2: 78 },
        leftArm: { x1: 100, y1: 55, x2: 80, y2: 70 }, rightArm: { x1: 100, y1: 55, x2: 120, y2: 70 },
        leftLeg: { x1: 100, y1: 78, x2: 85, y2: 130 }, rightLeg: { x1: 100, y1: 78, x2: 115, y2: 130 },
      },
      {
        head: { x: 100, y: 22 }, torso: { x1: 100, y1: 34, x2: 100, y2: 70 },
        leftArm: { x1: 100, y1: 48, x2: 80, y2: 62 }, rightArm: { x1: 100, y1: 48, x2: 120, y2: 62 },
        leftLeg: { x1: 100, y1: 70, x2: 85, y2: 120 }, rightLeg: { x1: 100, y1: 70, x2: 115, y2: 120 },
      },
    ],
  },
  lateral_raise: {
    cycleMs: 2500,
    label: 'Raise',
    frames: [
      {
        head: { x: 100, y: 28 }, torso: { x1: 100, y1: 40, x2: 100, y2: 78 },
        leftArm: { x1: 100, y1: 50, x2: 85, y2: 100 }, rightArm: { x1: 100, y1: 50, x2: 115, y2: 100 },
        leftLeg: { x1: 100, y1: 78, x2: 85, y2: 130 }, rightLeg: { x1: 100, y1: 78, x2: 115, y2: 130 },
      },
      {
        head: { x: 100, y: 28 }, torso: { x1: 100, y1: 40, x2: 100, y2: 78 },
        leftArm: { x1: 100, y1: 50, x2: 45, y2: 50 }, rightArm: { x1: 100, y1: 50, x2: 155, y2: 50 },
        leftLeg: { x1: 100, y1: 78, x2: 85, y2: 130 }, rightLeg: { x1: 100, y1: 78, x2: 115, y2: 130 },
      },
    ],
  },
  romanian_deadlift: {
    cycleMs: 3000,
    label: 'RDL',
    frames: [
      {
        head: { x: 100, y: 28 }, torso: { x1: 105, y1: 40, x2: 105, y2: 78 },
        leftArm: { x1: 105, y1: 55, x2: 95, y2: 130 }, rightArm: { x1: 105, y1: 55, x2: 115, y2: 130 },
        leftLeg: { x1: 105, y1: 78, x2: 90, y2: 130, bend: 20 }, rightLeg: { x1: 105, y1: 78, x2: 120, y2: 130, bend: 20 },
      },
      {
        head: { x: 120, y: 50 }, torso: { x1: 125, y1: 62, x2: 115, y2: 100 },
        leftArm: { x1: 120, y1: 75, x2: 100, y2: 130 }, rightArm: { x1: 120, y1: 75, x2: 130, y2: 130 },
        leftLeg: { x1: 115, y1: 100, x2: 90, y2: 130, bend: 40 }, rightLeg: { x1: 115, y1: 100, x2: 130, y2: 130, bend: 40 },
      },
    ],
  },
  shoulder_press: {
    cycleMs: 2500,
    label: 'Press',
    frames: [
      {
        head: { x: 100, y: 28 }, torso: { x1: 100, y1: 40, x2: 100, y2: 78 },
        leftArm: { x1: 100, y1: 50, x2: 75, y2: 35, bend: 90 }, rightArm: { x1: 100, y1: 50, x2: 125, y2: 35, bend: 90 },
        leftLeg: { x1: 100, y1: 78, x2: 85, y2: 130 }, rightLeg: { x1: 100, y1: 78, x2: 115, y2: 130 },
      },
      {
        head: { x: 100, y: 28 }, torso: { x1: 100, y1: 40, x2: 100, y2: 78 },
        leftArm: { x1: 100, y1: 50, x2: 60, y2: 20, bend: 10 }, rightArm: { x1: 100, y1: 50, x2: 140, y2: 20, bend: 10 },
        leftLeg: { x1: 100, y1: 78, x2: 85, y2: 130 }, rightLeg: { x1: 100, y1: 78, x2: 115, y2: 130 },
      },
    ],
  },
  tricep_dip: {
    cycleMs: 2500,
    label: 'Dip',
    frames: [
      {
        head: { x: 75, y: 55 }, torso: { x1: 85, y1: 62, x2: 85, y2: 95 },
        leftArm: { x1: 85, y1: 70, x2: 70, y2: 110, bend: 90 }, rightArm: { x1: 85, y1: 70, x2: 100, y2: 110, bend: 90 },
        leftLeg: { x1: 85, y1: 95, x2: 70, y2: 130 }, rightLeg: { x1: 85, y1: 95, x2: 100, y2: 130 },
      },
      {
        head: { x: 75, y: 45 }, torso: { x1: 85, y1: 52, x2: 85, y2: 85 },
        leftArm: { x1: 85, y1: 60, x2: 70, y2: 110, bend: 170 }, rightArm: { x1: 85, y1: 60, x2: 100, y2: 110, bend: 170 },
        leftLeg: { x1: 85, y1: 85, x2: 70, y2: 130 }, rightLeg: { x1: 85, y1: 85, x2: 100, y2: 130 },
      },
    ],
  },
};

function HumanFigure({ pose, scale = 1 }: { pose: Pose; scale?: number }) {
  const strokeWidth = 3 * scale;
  const headR = (pose.head.r || 10) * scale;
  const armLen = 25 * scale;

  const armPath = (x1: number, y1: number, x2: number, y2: number, bend: number = 0) => {
    if (bend <= 0) {
      return `M${x1 * scale} ${y1 * scale} L${x2 * scale} ${y2 * scale}`;
    }
    const midX = ((x1 + x2) / 2) * scale;
    const midY = ((y1 + y2) / 2) * scale - (bend * scale * 0.1);
    return `M${x1 * scale} ${y1 * scale} Q${midX} ${midY} ${x2 * scale} ${y2 * scale}`;
  };

  return (
    <g transform={`translate(${100 - 100 * scale}, ${80 - 80 * scale})`}>
      {/* Head */}
      <circle cx={pose.head.x * scale} cy={pose.head.y * scale} r={headR} fill="url(#humanGrad)" />
      {/* Head detail - face direction indicator */}
      <circle cx={(pose.head.x - 3) * scale} cy={(pose.head.y - 2) * scale} r={2 * scale} fill="rgba(0,0,0,0.3)" />

      {/* Body - torso with slight curve */}
      <path
        d={`M${pose.torso.x1 * scale} ${pose.torso.y1 * scale}
            Q${((pose.torso.x1 + pose.torso.x2) / 2) * scale} ${((pose.torso.y1 + pose.torso.y2) / 2 + 5) * scale}
            ${pose.torso.x2 * scale} ${pose.torso.y2 * scale}`}
        stroke="url(#humanGrad)"
        strokeWidth={strokeWidth + 2}
        fill="none"
        strokeLinecap="round"
      />

      {/* Arms with muscle definition */}
      <path
        d={armPath(pose.leftArm.x1, pose.leftArm.y1, pose.leftArm.x2, pose.leftArm.y2, pose.leftArm.bend)}
        stroke="url(#humanGrad)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={armPath(pose.rightArm.x1, pose.rightArm.y1, pose.rightArm.x2, pose.rightArm.y2, pose.rightArm.bend)}
        stroke="url(#humanGrad)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />

      {/* Legs */}
      <path
        d={armPath(pose.leftLeg.x1, pose.leftLeg.y1, pose.leftLeg.x2, pose.leftLeg.y2, pose.leftLeg.bend)}
        stroke="url(#humanGrad)"
        strokeWidth={strokeWidth + 1}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={armPath(pose.rightLeg.x1, pose.rightLeg.y1, pose.rightLeg.x2, pose.rightLeg.y2, pose.rightLeg.bend)}
        stroke="url(#humanGrad)"
        strokeWidth={strokeWidth + 1}
        fill="none"
        strokeLinecap="round"
      />

      {/* Feet/shoes */}
      {pose.leftFoot && (
        <ellipse cx={pose.leftFoot.x * scale} cy={pose.leftFoot.y * scale} rx={8 * scale} ry={4 * scale} fill="url(#humanGrad)" opacity="0.8" />
      )}
      {pose.rightFoot && (
        <ellipse cx={pose.rightFoot.x * scale} cy={pose.rightFoot.y * scale} rx={8 * scale} ry={4 * scale} fill="url(#humanGrad)" opacity="0.8" />
      )}
    </g>
  );
}

export default function ExerciseAnimation({ animationData, isActive }: Props) {
  const animKey = animationData.type;
  const [phase, setPhase] = useState(0);
  const [subPhase, setSubPhase] = useState(0);

  const config = useMemo(() => {
    return ANIMATIONS[animKey] || ANIMATIONS.pushup;
  }, [animKey]);

  useEffect(() => {
    if (!isActive) return;
    const frameCount = config.frames.length;
    const msPerFrame = config.cycleMs / frameCount;

    const iv = setInterval(() => {
      setPhase(p => (p + 1) % frameCount);
      setSubPhase(0);
    }, msPerFrame);

    const subIv = setInterval(() => {
      setSubPhase(s => (s + 1) % 10);
    }, msPerFrame / 10);

    return () => {
      clearInterval(iv);
      clearInterval(subIv);
    };
  }, [isActive, config]);

  const t = subPhase / 10;
  const currentFrame = config.frames[phase];
  const nextFrame = config.frames[(phase + 1) % config.frames.length];
  const pose = interpolatePose(currentFrame, nextFrame, t);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 200 160" className="w-full h-full max-w-sm">
        <defs>
          <linearGradient id="humanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="50%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ground line */}
        <line x1="20" y1="140" x2="180" y2="140" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />

        {/* Human figure */}
        <g filter="url(#glow)">
          <HumanFigure pose={pose} scale={1} />
        </g>

        {/* Exercise label */}
        <text
          x="100"
          y="155"
          textAnchor="middle"
          fill="#64748b"
          fontSize="10"
          fontFamily="Inter, sans-serif"
          fontWeight="500"
        >
          {(animationData.label || config.label || 'Exercise').toUpperCase()}
        </text>
      </svg>
    </div>
  );
}
