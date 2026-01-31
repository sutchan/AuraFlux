/**
 * File: components/ui/FPSCounter.tsx
 * Version: 1.8.23
 * Author: Aura Flux Team
 * Copyright (c) 2024 Aura Flux. All rights reserved.
 */

import React, { useState, useEffect } from 'react';

export const FPSCounter = () => {
  const [fps, setFps] = useState(0);
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;
    const loop = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);
  return (
    <div className="fixed top-4 right-4 z-[200] text-[10px] font-mono text-green-500/80 font-bold pointer-events-none select-none">
      FPS: {fps}
    </div>
  );
};