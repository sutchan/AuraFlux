/**
 * File: components/ui/FPSCounter.tsx
 * Version: 1.0.6
 * Author: Aura Vision Team
 * Copyright (c) 2024 Aura Vision. All rights reserved.
 * Updated: 2025-02-23 03:15
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