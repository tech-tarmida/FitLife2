import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Crown } from 'lucide-react';

type Props = {
  videoUrl: string;
  isActive: boolean;
  isPremium: boolean;
  onUpgradeClick: () => void;
};

export default function ExerciseVideo({ videoUrl, isActive, isPremium, onUpgradeClick }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive && isPremium && videoUrl) {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  }, [isActive, isPremium, videoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen().catch(() => {});
    }
  };

  if (!isPremium) {
    return (
      <div
        className="relative w-full h-full bg-dark-800/40 rounded-2xl flex items-center justify-center cursor-pointer group"
        onClick={onUpgradeClick}
      >
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Crown size={28} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-1">Video Demonstration</p>
            <p className="text-dark-400 text-xs">Upgrade to Premium to unlock video guidance</p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl text-yellow-400 text-xs font-semibold hover:from-yellow-500/30 hover:to-yellow-600/30 transition-all duration-200">
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="w-full h-full bg-dark-800/40 rounded-2xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center px-6">
          <div className="w-14 h-14 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
            <Play size={24} className="text-primary-400" />
          </div>
          <p className="text-dark-400 text-xs">Video coming soon for this exercise</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        muted={muted}
        loop
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              {playing ? <Pause size={14} className="text-white" /> : <Play size={14} className="text-white" />}
            </button>
            <button onClick={toggleMute} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              {muted ? <VolumeX size={14} className="text-white" /> : <Volume2 size={14} className="text-white" />}
            </button>
          </div>
          <button onClick={toggleFullscreen} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <Maximize size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
