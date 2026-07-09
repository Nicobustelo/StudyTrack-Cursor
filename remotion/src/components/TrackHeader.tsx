import React from "react";
import { colors } from "../theme";
import { headingFont, bodyFont } from "../fonts";
import { FireIcon } from "./icons";

/**
 * Header sticky del track (materia, countdown, streak, readiness),
 * fondo 100% opaco como manda la spec.
 */
export const TrackHeader: React.FC<{
  subject: string;
  daysLeft: number;
  goal: string;
  streak: number;
  readiness: number;
  scale?: number;
}> = ({ subject, daysLeft, goal, streak, readiness, scale = 1 }) => (
  <div
    style={{
      background: colors.surface,
      borderBottom: `2px solid ${colors.border}`,
      padding: `${20 * scale}px ${28 * scale}px`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16 * scale,
    }}
  >
    <div style={{ display: "flex", flexDirection: "column", gap: 6 * scale, minWidth: 0 }}>
      <div
        style={{
          fontFamily: headingFont,
          fontWeight: 800,
          fontSize: 30 * scale,
          color: colors.textPrimary,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {subject}
      </div>
      <div
        style={{
          fontFamily: bodyFont,
          fontWeight: 600,
          fontSize: 21 * scale,
          color: colors.textSecondary,
          whiteSpace: "nowrap",
        }}
      >
        Faltan {daysLeft} días · Objetivo {goal}
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12 * scale, flexShrink: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6 * scale,
          background: colors.orangeLight,
          borderRadius: 999,
          padding: `${8 * scale}px ${16 * scale}px`,
          fontFamily: headingFont,
          fontWeight: 800,
          fontSize: 24 * scale,
          color: colors.orange,
        }}
      >
        <FireIcon size={26 * scale} />
        {streak}
      </div>
      <div
        style={{
          background: colors.primaryLight,
          borderRadius: 999,
          padding: `${8 * scale}px ${16 * scale}px`,
          fontFamily: headingFont,
          fontWeight: 800,
          fontSize: 24 * scale,
          color: colors.primaryDark,
        }}
      >
        {readiness}%
      </div>
    </div>
  </div>
);
