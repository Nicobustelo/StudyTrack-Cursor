import type React from "react";
import { interpolate, spring } from "remotion";

/** Spring 0→1 que arranca en `delay` frames. */
export const springIn = (
  frame: number,
  fps: number,
  delay: number,
  opts?: { damping?: number; mass?: number; stiffness?: number }
): number =>
  spring({
    frame: frame - delay,
    fps,
    config: {
      damping: opts?.damping ?? 14,
      mass: opts?.mass ?? 0.7,
      stiffness: opts?.stiffness ?? 120,
    },
  });

/** Interpolación 0→1 clampeada entre dos frames. */
export const progress = (frame: number, from: number, to: number): number =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Estilo fade + slide-up para entradas de texto. */
export const fadeUp = (
  frame: number,
  fps: number,
  delay: number,
  distance = 36
): React.CSSProperties => {
  const s = springIn(frame, fps, delay, { damping: 16 });
  return {
    opacity: Math.min(1, s * 1.4),
    transform: `translateY(${(1 - s) * distance}px)`,
  };
};

/** Opacidad de salida de escena (fade-out en los últimos `dur` frames). */
export const fadeOut = (
  frame: number,
  sceneDuration: number,
  dur = 12
): number =>
  interpolate(frame, [sceneDuration - dur, sceneDuration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
