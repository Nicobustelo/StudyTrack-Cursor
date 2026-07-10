import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "./theme";
import { headingFont, bodyFont } from "./fonts";
import { springIn, fadeUp, fadeOut, progress } from "./anim";
import { SoftBackground, Wordmark, CTAButton, Chip } from "./components/ui";
import { FileChip } from "./components/FileChip";
import { ReadinessRing } from "./components/ReadinessRing";
import { TrackMap, TrackItem, computeTrackLayout } from "./components/TrackMap";
import { TrackHeader } from "./components/TrackHeader";
import { UploadIcon, CheckIcon, FireIcon, TargetIcon } from "./components/icons";

// ─── Timings (30 fps) ────────────────────────────────────────────────
const HOOK_END = 110;
const UPLOAD_END = 250;
const TRACK_END = 450;
const READY_END = 535;
export const TEASER_DURATION = 600; // 20s

const PAD = 84;

// ─── Escena 1: Hook ──────────────────────────────────────────────────
const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = "Convertí tus apuntes en un camino para aprobar.".split(" ");
  const out = fadeOut(frame, HOOK_END, 14);

  return (
    <AbsoluteFill style={{ opacity: out, padding: PAD, justifyContent: "center" }}>
      <div style={{ position: "absolute", top: 110, left: PAD, ...fadeUp(frame, fps, 2) }}>
        <Wordmark size={52} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", columnGap: 30, rowGap: 10, maxWidth: 940 }}>
        {words.map((word, i) => {
          const s = springIn(frame, fps, 10 + i * 4, { damping: 13 });
          const isCamino = word === "camino";
          return (
            <span
              key={i}
              style={{
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: 112,
                lineHeight: 1.12,
                letterSpacing: -2,
                color: isCamino ? colors.primaryDark : colors.textPrimary,
                opacity: Math.min(1, s * 1.3),
                transform: `translateY(${(1 - s) * 60}px)`,
                position: "relative",
                display: "inline-block",
              }}
            >
              {word}
              {isCamino ? (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: -6,
                    height: 16,
                    borderRadius: 999,
                    background: colors.primary,
                    opacity: 0.5,
                    width: `${progress(frame, 48, 68) * 100}%`,
                  }}
                />
              ) : null}
            </span>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 56,
          fontFamily: bodyFont,
          fontWeight: 600,
          fontSize: 42,
          color: colors.textSecondary,
          maxWidth: 860,
          lineHeight: 1.4,
          ...fadeUp(frame, fps, 42),
        }}
      >
        Subí tus materiales, poné la fecha del examen y seguí tu plan diario.
      </div>
    </AbsoluteFill>
  );
};

// ─── Escena 2: Upload ────────────────────────────────────────────────
const UploadScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = UPLOAD_END - HOOK_END;
  const out = fadeOut(frame, dur, 14);
  const files = [
    { kind: "pdf" as const, name: "Teoría - Unidad 1.pdf", detail: "2,4 MB", delay: 26 },
    { kind: "photo" as const, name: "Carpeta - clase 12.jpg", detail: "Foto de carpeta", delay: 38 },
    { kind: "notes" as const, name: "Resumen propio.docx", detail: "14 páginas", delay: 50 },
  ];
  const barP = progress(frame, 68, 105);
  const done = springIn(frame, fps, 108, { damping: 11 });

  return (
    <AbsoluteFill style={{ opacity: out, padding: PAD, justifyContent: "center" }}>
      <div style={{ ...fadeUp(frame, fps, 4) }}>
        <Chip bg={colors.primaryLight} color={colors.primaryDark} fontSize={30} border="none">
          Paso 1
        </Chip>
      </div>
      <div
        style={{
          marginTop: 34,
          fontFamily: headingFont,
          fontWeight: 800,
          fontSize: 92,
          letterSpacing: -1.5,
          color: colors.textPrimary,
          ...fadeUp(frame, fps, 8),
        }}
      >
        Subí tus apuntes
      </div>
      <div
        style={{
          marginTop: 20,
          marginBottom: 52,
          fontFamily: bodyFont,
          fontWeight: 500,
          fontSize: 38,
          color: colors.textSecondary,
          ...fadeUp(frame, fps, 14),
        }}
      >
        PDFs, fotos, resúmenes, textos o guías.
      </div>

      <div
        style={{
          border: `4px dashed ${colors.primary}`,
          borderRadius: 34,
          background: "rgba(221, 251, 234, 0.5)",
          padding: 46,
          display: "flex",
          flexDirection: "column",
          gap: 26,
          ...fadeUp(frame, fps, 18),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 24,
              background: colors.primaryLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UploadIcon size={46} />
          </div>
          <div
            style={{
              fontFamily: headingFont,
              fontWeight: 700,
              fontSize: 36,
              color: colors.textPrimary,
            }}
          >
            Arrastrá tus materiales acá
          </div>
        </div>

        {files.map((f, i) => {
          const s = springIn(frame, fps, f.delay, { damping: 12, stiffness: 130 });
          return (
            <div
              key={i}
              style={{
                opacity: Math.min(1, s * 1.3),
                transform: `translateY(${(1 - s) * 90}px) scale(${0.9 + s * 0.1})`,
              }}
            >
              <FileChip kind={f.kind} name={f.name} detail={f.detail} scale={1.35} />
            </div>
          );
        })}

        <div
          style={{
            height: 22,
            borderRadius: 999,
            background: colors.border,
            overflow: "hidden",
            opacity: progress(frame, 62, 70),
          }}
        >
          <div
            style={{
              width: `${barP * 100}%`,
              height: "100%",
              borderRadius: 999,
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.primaryDark})`,
            }}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: 44,
          alignSelf: "center",
          opacity: Math.min(1, done * 1.3),
          transform: `scale(${done})`,
        }}
      >
        <Chip bg={colors.primary} color="#fff" fontSize={34} border="none">
          <CheckIcon size={36} color="#fff" /> Materiales analizados
        </Chip>
      </div>
    </AbsoluteFill>
  );
};

// ─── Escena 3: Track animado ─────────────────────────────────────────
const trackItems: TrackItem[] = [
  { type: "banner", title: "Unidad 1", subtitle: "Funciones de varias variables" },
  { type: "node", kind: "lesson", state: "completed" },
  { type: "node", kind: "lesson", state: "completed" },
  { type: "node", kind: "review", state: "completed" },
  { type: "node", kind: "daily", state: "current", label: "Reto diario · +15 XP" },
  { type: "node", kind: "lesson", state: "locked" },
  { type: "node", kind: "test", state: "locked", label: "Test de unidad" },
  { type: "banner", title: "Unidad 3", subtitle: "Extremos y optimización", tone: "purple" },
  { type: "node", kind: "lesson", state: "premium" },
  { type: "node", kind: "mock", state: "premium", label: "Simulacro" },
];

const TrackScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const dur = TRACK_END - UPLOAD_END;
  const out = fadeOut(frame, dur, 14);
  const scale = 1.5;
  const trackWidth = width - PAD * 2;

  const headerIn = springIn(frame, fps, 4, { damping: 15 });
  const kickerIn = fadeUp(frame, fps, 2);

  // Pan vertical de "cámara" siguiendo el dibujo del path.
  const layout = computeTrackLayout(trackItems, { width: trackWidth - 60, scale });
  const viewport = height - 410; // kicker + header sticky + márgenes
  const panMax = Math.max(0, layout.totalHeight - viewport + 60);
  const pan = interpolate(frame, [56, 178], [0, -panMax], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 2),
  });

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <div style={{ padding: `70px ${PAD}px 26px`, ...kickerIn }}>
        <div
          style={{
            fontFamily: headingFont,
            fontWeight: 800,
            fontSize: 66,
            letterSpacing: -1,
            color: colors.textPrimary,
          }}
        >
          Y seguí tu <span style={{ color: colors.primaryDark }}>camino</span> hasta el examen
        </div>
      </div>

      <div
        style={{
          margin: `0 ${PAD - 30}px`,
          borderRadius: 30,
          overflow: "hidden",
          border: `2px solid ${colors.border}`,
          boxShadow: "0 30px 80px rgba(22,37,28,0.12)",
          opacity: Math.min(1, headerIn * 1.2),
          transform: `translateY(${(1 - headerIn) * 40}px)`,
          background: colors.background,
          flex: 1,
          marginBottom: 70,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <TrackHeader
            subject="Análisis Matemático II"
            daysLeft={8}
            goal="8+"
            streak={3}
            readiness={42}
            scale={1.45}
          />
        </div>
        <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              left: 30,
              right: 30,
              top: 30,
              transform: `translateY(${pan}px)`,
            }}
          >
            <TrackMap
              items={trackItems}
              width={trackWidth - 60}
              scale={scale}
              drawStart={16}
              drawDuration={150}
              currentTooltip="Hoy te toca esto"
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Escena 4: Readiness ─────────────────────────────────────────────
const ReadinessScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = READY_END - TRACK_END;
  const out = fadeOut(frame, dur, 12);
  const ringIn = springIn(frame, fps, 8, { damping: 14 });

  return (
    <AbsoluteFill
      style={{
        opacity: out,
        alignItems: "center",
        justifyContent: "center",
        padding: PAD,
        gap: 54,
      }}
    >
      <div
        style={{
          fontFamily: headingFont,
          fontWeight: 800,
          fontSize: 84,
          letterSpacing: -1.5,
          color: colors.textPrimary,
          textAlign: "center",
          lineHeight: 1.15,
          ...fadeUp(frame, fps, 2),
        }}
      >
        Sabé qué tan <span style={{ color: colors.primaryDark }}>preparado</span> estás
      </div>
      <div style={{ transform: `scale(${ringIn})` }}>
        <ReadinessRing size={560} target={72} startFrame={14} durationFrames={50} />
      </div>
      <div style={{ display: "flex", gap: 26, ...fadeUp(frame, fps, 34) }}>
        <Chip fontSize={34}>
          <FireIcon size={38} /> Racha: 3 días
        </Chip>
        <Chip fontSize={34}>
          <TargetIcon size={38} /> Objetivo 8+
        </Chip>
      </div>
    </AbsoluteFill>
  );
};

// ─── Escena 5: CTA ───────────────────────────────────────────────────
const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const btnIn = springIn(frame, fps, 18, { damping: 12 });

  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", padding: PAD, gap: 46 }}
    >
      <div style={{ ...fadeUp(frame, fps, 2) }}>
        <Wordmark size={92} />
      </div>
      <div
        style={{
          fontFamily: bodyFont,
          fontWeight: 600,
          fontSize: 42,
          color: colors.textSecondary,
          textAlign: "center",
          maxWidth: 820,
          lineHeight: 1.4,
          ...fadeUp(frame, fps, 10),
        }}
      >
        Tu camino personalizado para aprobar exámenes.
      </div>
      <div style={{ transform: `scale(${btnIn})`, marginTop: 22 }}>
        <CTAButton label="Crear mi plan de estudio" fontSize={46} pressAt={40} />
      </div>
      <div
        style={{
          fontFamily: bodyFont,
          fontWeight: 600,
          fontSize: 30,
          color: colors.primaryDark,
          ...fadeUp(frame, fps, 30),
        }}
      >
        Empezá gratis · Unidades 1 y 2 sin costo
      </div>
    </AbsoluteFill>
  );
};

// ─── Composición ─────────────────────────────────────────────────────
export const Teaser916: React.FC = () => {
  return (
    <AbsoluteFill>
      <SoftBackground />
      <Sequence durationInFrames={HOOK_END} name="Hook">
        <HookScene />
      </Sequence>
      <Sequence from={HOOK_END} durationInFrames={UPLOAD_END - HOOK_END} name="Upload">
        <UploadScene />
      </Sequence>
      <Sequence from={UPLOAD_END} durationInFrames={TRACK_END - UPLOAD_END} name="Track">
        <TrackScene />
      </Sequence>
      <Sequence from={TRACK_END} durationInFrames={READY_END - TRACK_END} name="Readiness">
        <ReadinessScene />
      </Sequence>
      <Sequence from={READY_END} durationInFrames={TEASER_DURATION - READY_END} name="CTA">
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
