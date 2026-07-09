import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, softShadow } from "../theme";
import { headingFont, bodyFont } from "../fonts";
import { springIn } from "../anim";
import { CheckIcon } from "./icons";

/** Fondo claro StudyTrack con blobs suaves de la paleta, animados lentamente. */
export const SoftBackground: React.FC<{ drift?: number }> = ({ drift = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame * drift;
  const blob = (
    color: string,
    size: number,
    left: string,
    top: string,
    phase: number
  ): React.CSSProperties => ({
    position: "absolute",
    width: size,
    height: size,
    borderRadius: "50%",
    background: color,
    opacity: 0.5,
    filter: "blur(90px)",
    left,
    top,
    transform: `translate(${Math.sin((t + phase) / 90) * 30}px, ${
      Math.cos((t + phase) / 110) * 24
    }px)`,
  });
  return (
    <AbsoluteFill style={{ backgroundColor: colors.background, overflow: "hidden" }}>
      <div style={blob(colors.primaryLight, 700, "-12%", "-10%", 0)} />
      <div style={blob(colors.blueLight, 620, "62%", "8%", 140)} />
      <div style={blob(colors.yellowLight, 560, "8%", "62%", 260)} />
      <div style={blob(colors.purpleLight, 520, "60%", "66%", 80)} />
    </AbsoluteFill>
  );
};

/** Wordmark StudyTrack: nodo con check + texto. Sin assets de terceros. */
export const Wordmark: React.FC<{ size?: number; color?: string }> = ({
  size = 48,
  color = colors.textPrimary,
}) => {
  const iconSize = size * 1.15;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.32 }}>
      <div
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: iconSize * 0.32,
          background: `linear-gradient(160deg, ${colors.primary}, ${colors.primaryDark})`,
          boxShadow: `0 ${size * 0.1}px 0 ${colors.primaryDark}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CheckIcon size={iconSize * 0.58} color="#fff" strokeWidth={3.6} />
      </div>
      <div
        style={{
          fontFamily: headingFont,
          fontWeight: 800,
          fontSize: size,
          color,
          letterSpacing: -size * 0.02,
        }}
      >
        Study<span style={{ color: colors.primary }}>Track</span>
      </div>
    </div>
  );
};

/** Botón físico StudyTrack (sombra inferior + press animado). */
export const CTAButton: React.FC<{
  label: string;
  width?: number;
  fontSize?: number;
  pressAt?: number | null;
  variant?: "primary" | "white";
}> = ({ label, width, fontSize = 34, pressAt = null, variant = "primary" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let pressY = 0;
  let glow = 0;
  if (pressAt !== null) {
    const p = springIn(frame, fps, pressAt, { damping: 9, stiffness: 200 });
    const release = springIn(frame, fps, pressAt + 7, { damping: 12, stiffness: 180 });
    pressY = (p - release) * 8;
    glow = interpolate(frame, [pressAt, pressAt + 20], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  const isPrimary = variant === "primary";
  const shadowH = 8 - pressY * 0.8;
  return (
    <div
      style={{
        width,
        height: fontSize * 2.4,
        borderRadius: fontSize * 0.62,
        background: isPrimary ? colors.primary : colors.surface,
        border: isPrimary ? "none" : `2.5px solid ${colors.border}`,
        boxShadow: isPrimary
          ? `0 ${shadowH}px 0 ${colors.primaryDark}${
              glow > 0 ? `, 0 0 ${glow * 60}px rgba(55, 200, 113, ${glow * 0.55})` : ""
            }`
          : `0 ${shadowH}px 0 ${colors.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: fontSize * 1.4,
        paddingRight: fontSize * 1.4,
        transform: `translateY(${pressY}px)`,
      }}
    >
      <span
        style={{
          fontFamily: headingFont,
          fontWeight: 800,
          fontSize,
          color: isPrimary ? "#fff" : colors.textPrimary,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
};

/** Chip redondeado (stats del header, badges). */
export const Chip: React.FC<{
  children: React.ReactNode;
  bg?: string;
  color?: string;
  fontSize?: number;
  border?: string;
}> = ({ children, bg = colors.surface, color = colors.textPrimary, fontSize = 24, border }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: fontSize * 0.35,
      background: bg,
      color,
      border: border ?? `2px solid ${colors.border}`,
      borderRadius: 999,
      padding: `${fontSize * 0.38}px ${fontSize * 0.8}px`,
      fontFamily: bodyFont,
      fontWeight: 700,
      fontSize,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

/** Card blanca StudyTrack (radius 24, borde suave, sombra sutil). */
export const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      background: colors.surface,
      border: `2px solid ${colors.border}`,
      borderRadius: 28,
      boxShadow: softShadow,
      padding: 32,
      ...style,
    }}
  >
    {children}
  </div>
);
