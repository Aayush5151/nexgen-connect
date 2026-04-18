"use client";

import { useEffect, useRef } from "react";

interface GridBackgroundProps {
  className?: string;
  dotSize?: number;
  gap?: number;
  fadeEdge?: boolean;
}

export function GridBackground({
  className = "",
  dotSize = 1,
  gap = 32,
  fadeEdge = true,
}: GridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx!.scale(dpr, dpr);
    }

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function handleMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    function handleMouseLeave() {
      mouseRef.current = { x: -1000, y: -1000 };
    }

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const radius = 150;

      for (let x = gap; x < width; x += gap) {
        for (let y = gap; y < height; y += gap) {
          const dx = x - mx;
          const dy = y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const proximity = Math.max(0, 1 - dist / radius);

          // Base opacity with edge fade
          let baseOpacity = 0.15;
          if (fadeEdge) {
            const edgeFadeX = Math.min(x / 200, (width - x) / 200, 1);
            const edgeFadeY = Math.min(y / 200, (height - y) / 200, 1);
            baseOpacity *= Math.min(edgeFadeX, edgeFadeY);
          }

          const finalOpacity = baseOpacity + proximity * 0.6;
          const size = dotSize + proximity * 2;

          // Color shifts from white to blue on proximity
          const r = Math.round(148 + proximity * (59 - 148));
          const g = Math.round(163 + proximity * (130 - 163));
          const b = Math.round(184 + proximity * (246 - 184));

          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity})`;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [dotSize, gap, fadeEdge]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-auto absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}
