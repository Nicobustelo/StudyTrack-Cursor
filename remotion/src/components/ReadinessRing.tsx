import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme";
import { headingFont, bodyFont } from "../fonts";

/**
 * Anillo de readiness score animado 0 → target con contador.
 * `startFrame`/`durationFrames` controlan la animación de llenado.
 */
export const ReadinessRing: React.FC<{
  size: number;
  target: number;
  startFrame: number;
  durationFrames?: number;
  label?: string;
}> = ({ size, target, startFrame, durationFrames = 55, label = "Preparación" }) => {
  const frame = useCurrentFrame();
  const p = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, target / 100],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: (t) => 1 - Math.pow(1 - t, 3),
    }
  );
  const stroke = size * 0.085;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const value = Math.round(p * 100);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.primaryLight}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - p)}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: size * 0.015,
        }}
      >
        <div
          style={{
            fontFamily: headingFont,
            fontWeight: 800,
            fontSize: size * 0.26,
            color: colors.textPrimary,
            lineHeight: 1,
          }}
        >
          {value}%
        </div>
        <div
          style={{
            fontFamily: bodyFont,
            fontWeight: 600,
            fontSize: size * 0.075,
            color: colors.textSecondary,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};
