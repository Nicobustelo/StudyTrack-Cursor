import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { evolvePath } from "@remotion/paths";
import { colors } from "../theme";
import { headingFont, bodyFont } from "../fonts";
import { springIn } from "../anim";
import {
  CheckIcon,
  LockIcon,
  StarIcon,
  ZapIcon,
  DocIcon,
  RefreshIcon,
} from "./icons";

export type TrackNodeKind = "lesson" | "daily" | "test" | "mock" | "review";
export type TrackNodeState =
  | "completed"
  | "current"
  | "available"
  | "locked"
  | "premium";

export type TrackItem =
  | { type: "banner"; title: string; subtitle?: string; tone?: "green" | "purple" }
  | {
      type: "node";
      kind: TrackNodeKind;
      state: TrackNodeState;
      label?: string;
    };

type LayoutConfig = {
  width: number;
  scale: number;
};

type PlacedBanner = {
  type: "banner";
  item: Extract<TrackItem, { type: "banner" }>;
  y: number;
  height: number;
};

type PlacedNode = {
  type: "node";
  item: Extract<TrackItem, { type: "node" }>;
  x: number;
  y: number;
  radius: number;
  nodeIndex: number;
};

type Layout = {
  banners: PlacedBanner[];
  nodes: PlacedNode[];
  totalHeight: number;
  pathD: string;
  /** Fracción [0..1] de la longitud del path en la que está cada nodo. */
  nodeFractions: number[];
};

const NODE_R = 44;
const CURRENT_R = 54;
const SPECIAL_R = 52;
const STEP_Y = 168;
const BANNER_H = 108;
const BANNER_GAP = 46;
// Patrón serpenteante: centro → izquierda → centro → derecha → …
const OFFSET_PATTERN = [0, -1, -0.45, 0.55, 1, 0.3, -0.7];

export const computeTrackLayout = (
  items: TrackItem[],
  { width, scale }: LayoutConfig
): Layout => {
  const banners: PlacedBanner[] = [];
  const nodes: PlacedNode[] = [];
  const amp = width * 0.24;
  const centerX = width / 2;
  let y = 30 * scale;
  let nodeIndex = 0;

  for (const item of items) {
    if (item.type === "banner") {
      banners.push({ type: "banner", item, y, height: BANNER_H * scale });
      y += (BANNER_H + BANNER_GAP) * scale;
    } else {
      const radius =
        (item.state === "current"
          ? CURRENT_R
          : item.kind === "test" || item.kind === "mock"
            ? SPECIAL_R
            : NODE_R) * scale;
      const offset = OFFSET_PATTERN[nodeIndex % OFFSET_PATTERN.length];
      nodes.push({
        type: "node",
        item,
        x: centerX + offset * amp,
        y: y + radius,
        radius,
        nodeIndex,
      });
      y += STEP_Y * scale;
      nodeIndex += 1;
    }
  }

  // Path suave (curvas cúbicas con control points en el punto medio vertical)
  // que pasa EXACTAMENTE por el centro de cada nodo → alineación garantizada.
  let pathD = "";
  const fractions: number[] = [];
  if (nodes.length > 0) {
    pathD = `M ${nodes[0].x} ${nodes[0].y}`;
    let cumulative = 0;
    const chords: number[] = [0];
    for (let i = 1; i < nodes.length; i++) {
      const a = nodes[i - 1];
      const b = nodes[i];
      const midY = (a.y + b.y) / 2;
      pathD += ` C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`;
      cumulative += Math.hypot(b.x - a.x, b.y - a.y);
      chords.push(cumulative);
    }
    for (const c of chords) {
      fractions.push(cumulative === 0 ? 0 : c / cumulative);
    }
  }

  return {
    banners,
    nodes,
    totalHeight: y + 40 * scale,
    pathD,
    nodeFractions: fractions,
  };
};

const nodeVisual = (
  item: Extract<TrackItem, { type: "node" }>,
  scale: number
): { bg: string; edge: string; icon: React.ReactNode; flat?: boolean } => {
  const iconSize = 40 * scale;
  const { kind, state } = item;
  if (state === "locked") {
    return {
      bg: colors.lockedBg,
      edge: colors.locked,
      icon: <LockIcon size={iconSize} color={colors.lockedIcon} />,
      flat: true,
    };
  }
  if (state === "premium") {
    return {
      bg: "#FFFFFF",
      edge: colors.purple,
      icon: <LockIcon size={iconSize} color={colors.purple} />,
      flat: true,
    };
  }
  if (kind === "daily") {
    return {
      bg: colors.yellow,
      edge: "#E3AC3C",
      icon: <ZapIcon size={iconSize} color="#fff" />,
    };
  }
  if (kind === "test") {
    return {
      bg: colors.blue,
      edge: "#1B5FC4",
      icon: <DocIcon size={iconSize} color="#fff" />,
    };
  }
  if (kind === "mock") {
    return {
      bg: colors.purple,
      edge: "#6D3EE0",
      icon: <DocIcon size={iconSize} color="#fff" />,
    };
  }
  if (kind === "review") {
    return {
      bg: colors.orange,
      edge: "#E06F24",
      icon: <RefreshIcon size={iconSize} color="#fff" />,
    };
  }
  // Lección normal
  if (state === "completed") {
    return {
      bg: colors.primary,
      edge: colors.primaryDark,
      icon: <CheckIcon size={iconSize} color="#fff" />,
    };
  }
  if (state === "current") {
    return {
      bg: colors.primary,
      edge: colors.primaryDark,
      icon: <StarIcon size={iconSize * 1.05} color="#fff" />,
    };
  }
  return {
    bg: "#FFFFFF",
    edge: colors.primary,
    icon: <StarIcon size={iconSize} color={colors.primary} />,
    flat: true,
  };
};

/**
 * Track vertical animado de StudyTrack.
 * El path verde se "dibuja" entre drawStart y drawStart+drawDuration,
 * y cada nodo aparece con un spring cuando el trazo lo alcanza.
 */
export const TrackMap: React.FC<{
  items: TrackItem[];
  width: number;
  scale?: number;
  drawStart: number;
  drawDuration: number;
  currentTooltip?: string;
}> = ({ items, width, scale = 1, drawStart, drawDuration, currentTooltip }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const layout = computeTrackLayout(items, { width, scale });

  const drawP = interpolate(frame, [drawStart, drawStart + drawDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 2.2),
  });
  const greenPath = evolvePath(drawP, layout.pathD);

  // El path gris de base se dibuja rápido apenas arranca la escena.
  const baseP = interpolate(frame, [drawStart - 14, drawStart + drawDuration * 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 2),
  });
  const basePath = evolvePath(baseP, layout.pathD);

  // Frame en el que el trazo verde alcanza una fracción dada del path
  // (inversa del easing del trazo), para que cada nodo "pope" justo al llegar.
  const appearFrameOf = (fraction: number) =>
    drawStart + invertEase(fraction) * drawDuration;

  return (
    <div style={{ position: "relative", width, height: layout.totalHeight }}>
      <svg
        width={width}
        height={layout.totalHeight}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <path
          d={layout.pathD}
          stroke={colors.border}
          strokeWidth={14 * scale}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={basePath.strokeDasharray}
          strokeDashoffset={basePath.strokeDashoffset}
        />
        <path
          d={layout.pathD}
          stroke={colors.primary}
          strokeWidth={14 * scale}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={greenPath.strokeDasharray}
          strokeDashoffset={greenPath.strokeDashoffset}
        />
      </svg>

      {layout.banners.map((b, i) => {
        const bannerFraction =
          layout.nodes.length > 0
            ? Math.max(
                0,
                Math.min(
                  1,
                  (b.y - layout.nodes[0].y) /
                    Math.max(1, layout.nodes[layout.nodes.length - 1].y - layout.nodes[0].y)
                )
              )
            : 0;
        const appear = appearFrameOf(bannerFraction) - 6;
        const s = springIn(frame, fps, appear, { damping: 15 });
        const purple = b.item.tone === "purple";
        return (
          <div
            key={`banner-${i}`}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: b.y,
              height: b.height,
              borderRadius: 26 * scale,
              background: purple
                ? `linear-gradient(120deg, ${colors.purple}, #6D3EE0)`
                : `linear-gradient(120deg, ${colors.primary}, ${colors.primaryDark})`,
              boxShadow: purple ? "0 8px 0 #5B2ECB" : `0 8px 0 ${colors.primaryDark}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              paddingLeft: 36 * scale,
              paddingRight: 36 * scale,
              gap: 4 * scale,
              opacity: Math.min(1, s * 1.3),
              transform: `translateY(${(1 - s) * 30}px) scale(${0.92 + s * 0.08})`,
            }}
          >
            <div
              style={{
                fontFamily: bodyFont,
                fontWeight: 700,
                fontSize: 22 * scale,
                color: "rgba(255,255,255,0.85)",
                textTransform: "uppercase",
                letterSpacing: 2 * scale,
              }}
            >
              {b.item.title}
            </div>
            {b.item.subtitle ? (
              <div
                style={{
                  fontFamily: headingFont,
                  fontWeight: 800,
                  fontSize: 34 * scale,
                  color: "#fff",
                }}
              >
                {b.item.subtitle}
              </div>
            ) : null}
          </div>
        );
      })}

      {layout.nodes.map((n, i) => {
        const appear = appearFrameOf(layout.nodeFractions[i]);
        const pop = springIn(frame, fps, appear, { damping: 11, stiffness: 150 });
        const v = nodeVisual(n.item, scale);
        const isCurrent = n.item.state === "current";
        const d = n.radius * 2;

        // Pulso continuo del nodo actual
        const pulseT = ((frame - appear) % 42) / 42;
        const haloScale = 1 + Math.max(0, pulseT) * 0.55;
        const haloOpacity = frame > appear ? (1 - pulseT) * 0.4 : 0;

        const edgeH = v.flat ? 4 * scale : 8 * scale;

        return (
          <div
            key={`node-${i}`}
            style={{
              position: "absolute",
              left: n.x - n.radius,
              top: n.y - n.radius,
              width: d,
              height: d,
              transform: `scale(${pop})`,
            }}
          >
            {isCurrent ? (
              <div
                style={{
                  position: "absolute",
                  inset: -10 * scale,
                  borderRadius: "50%",
                  background: v.bg,
                  opacity: haloOpacity,
                  transform: `scale(${haloScale})`,
                }}
              />
            ) : null}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: v.bg,
                boxShadow: `0 ${edgeH}px 0 ${v.edge}`,
                border: v.flat ? `4px solid ${v.edge}` : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {v.icon}
            </div>
            {n.item.state === "premium" ? (
              <div
                style={{
                  position: "absolute",
                  top: -12 * scale,
                  right: -18 * scale,
                  background: colors.purple,
                  color: "#fff",
                  borderRadius: 999,
                  padding: `${5 * scale}px ${13 * scale}px`,
                  fontFamily: headingFont,
                  fontWeight: 800,
                  fontSize: 18 * scale,
                  letterSpacing: 1,
                  boxShadow: "0 4px 0 #6D3EE0",
                }}
              >
                PRO
              </div>
            ) : null}
            {isCurrent && currentTooltip ? (
              <CurrentTooltip
                text={currentTooltip}
                scale={scale}
                nodeDiameter={d}
                appearFrame={appear + 6}
              />
            ) : null}
            {n.item.label ? (
              <div
                style={{
                  position: "absolute",
                  top: d + 14 * scale,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: colors.surface,
                  border: `2px solid ${colors.border}`,
                  borderRadius: 999,
                  padding: `${6 * scale}px ${16 * scale}px`,
                  fontFamily: bodyFont,
                  fontWeight: 700,
                  fontSize: 20 * scale,
                  color: colors.textSecondary,
                  whiteSpace: "nowrap",
                  opacity: pop,
                }}
              >
                {n.item.label}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

/** Inversa aproximada del easing (1-(1-t)^2.2) usado por el trazo verde. */
const invertEase = (p: number): number => 1 - Math.pow(1 - p, 1 / 2.2);

const CurrentTooltip: React.FC<{
  text: string;
  scale: number;
  nodeDiameter: number;
  appearFrame: number;
}> = ({ text, scale, nodeDiameter, appearFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = springIn(frame, fps, appearFrame, { damping: 10, stiffness: 140 });
  const bounce = Math.sin((frame - appearFrame) / 9) * 5 * scale;
  return (
    <div
      style={{
        position: "absolute",
        bottom: nodeDiameter + 22 * scale,
        left: "50%",
        transform: `translateX(-50%) translateY(${bounce}px) scale(${s})`,
        opacity: Math.min(1, s * 1.2),
      }}
    >
      <div
        style={{
          background: colors.surface,
          border: `3px solid ${colors.primary}`,
          borderRadius: 18 * scale,
          padding: `${12 * scale}px ${22 * scale}px`,
          fontFamily: headingFont,
          fontWeight: 800,
          fontSize: 24 * scale,
          color: colors.primaryDark,
          whiteSpace: "nowrap",
          boxShadow: "0 10px 24px rgba(22,37,28,0.12)",
        }}
      >
        {text}
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: -10 * scale,
          transform: "translateX(-50%) rotate(45deg)",
          width: 18 * scale,
          height: 18 * scale,
          background: colors.surface,
          borderRight: `3px solid ${colors.primary}`,
          borderBottom: `3px solid ${colors.primary}`,
        }}
      />
    </div>
  );
};
