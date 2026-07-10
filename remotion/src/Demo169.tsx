import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, softShadow } from "./theme";
import { headingFont, bodyFont } from "./fonts";
import { springIn, fadeUp, fadeOut, progress } from "./anim";
import { SoftBackground, Wordmark, CTAButton, Chip, Card } from "./components/ui";
import { FileChip, FileKind } from "./components/FileChip";
import { ReadinessRing } from "./components/ReadinessRing";
import { TrackMap, TrackItem, computeTrackLayout } from "./components/TrackMap";
import { TrackHeader } from "./components/TrackHeader";
import { PhoneFrame } from "./components/PhoneFrame";
import {
  XIcon,
  CheckIcon,
  UploadIcon,
  ZapIcon,
  RefreshIcon,
  DocIcon,
  BookIcon,
  FireIcon,
  CalendarIcon,
  TargetIcon,
  TrophyIcon,
} from "./components/icons";

// ─── Timings (30 fps) ────────────────────────────────────────────────
const PROBLEM_END = 180;
const UPLOAD_END = 390;
const TRACK_END = 690;
const READY_END = 930;
const PAYWALL_END = 1110;
export const DEMO_DURATION = 1200; // 40s

const PAD = 110;
const PHONE_W = 430;

// ─── Escena 1: Problema ──────────────────────────────────────────────
const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = fadeOut(frame, PROBLEM_END, 14);
  const bullets = [
    "Tenés PDFs, apuntes y resúmenes por todos lados.",
    "No sabés qué temas priorizar.",
    "Releés mucho, pero practicás poco.",
    "No sabés si estás listo.",
  ];
  const floaters: { kind: FileKind; name: string; x: number; y: number; rot: number; delay: number }[] = [
    { kind: "pdf", name: "teoria_final_v3.pdf", x: 0, y: 30, rot: -7, delay: 14 },
    { kind: "photo", name: "IMG_2041.jpg", x: 150, y: 200, rot: 5, delay: 22 },
    { kind: "notes", name: "resumen(1)(2).docx", x: 30, y: 370, rot: -4, delay: 30 },
    { kind: "guide", name: "guia_practica_OLD.pdf", x: 170, y: 540, rot: 8, delay: 38 },
  ];

  return (
    <AbsoluteFill style={{ opacity: out, flexDirection: "row", padding: PAD, alignItems: "center" }}>
      <div style={{ flex: 1.2, paddingRight: 70 }}>
        <div style={{ ...fadeUp(frame, fps, 2) }}>
          <Wordmark size={40} />
        </div>
        <div
          style={{
            marginTop: 44,
            fontFamily: headingFont,
            fontWeight: 800,
            fontSize: 84,
            lineHeight: 1.12,
            letterSpacing: -2,
            color: colors.textPrimary,
            ...fadeUp(frame, fps, 8),
          }}
        >
          Estudiar no debería ser{" "}
          <span style={{ color: colors.red }}>adivinar</span> qué hacer.
        </div>
        <div style={{ marginTop: 46, display: "flex", flexDirection: "column", gap: 26 }}>
          {bullets.map((b, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                ...fadeUp(frame, fps, 30 + i * 9),
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: colors.redLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <XIcon size={28} />
              </div>
              <div
                style={{
                  fontFamily: bodyFont,
                  fontWeight: 600,
                  fontSize: 34,
                  color: colors.textSecondary,
                }}
              >
                {b}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, position: "relative", height: 760 }}>
        {floaters.map((f, i) => {
          const s = springIn(frame, fps, f.delay, { damping: 13 });
          const drift = Math.sin((frame + i * 40) / 32) * 8;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: f.x,
                top: f.y,
                width: 520,
                opacity: Math.min(1, s * 1.3),
                transform: `translateY(${(1 - s) * 80 + drift}px) rotate(${f.rot}deg)`,
              }}
            >
              <FileChip kind={f.kind} name={f.name} detail="¿Por dónde empiezo?" scale={1.15} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Escena 2: Upload de materiales ──────────────────────────────────
const UploadScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = UPLOAD_END - PROBLEM_END;
  const out = fadeOut(frame, dur, 14);
  const phoneIn = springIn(frame, fps, 8, { damping: 15 });
  const files = [
    { kind: "pdf" as const, name: "Teoría - Unidad 1.pdf", delay: 40 },
    { kind: "photo" as const, name: "Carpeta clase 12.jpg", delay: 54 },
    { kind: "notes" as const, name: "Resumen propio.docx", delay: 68 },
  ];
  const barP = progress(frame, 92, 140);

  const steps = [
    {
      n: "1",
      title: "Subí tus apuntes",
      body: "PDFs, fotos, resúmenes, textos o guías.",
      delay: 14,
      color: colors.primary,
      bg: colors.primaryLight,
    },
    {
      n: "2",
      title: "Agregá la fecha y tu nota objetivo",
      body: "Decinos cuánto tiempo tenés y qué querés lograr.",
      delay: 30,
      color: colors.blue,
      bg: colors.blueLight,
    },
  ];

  return (
    <AbsoluteFill style={{ opacity: out, flexDirection: "row", padding: PAD, alignItems: "center" }}>
      <div style={{ flex: 1.2, paddingRight: 80 }}>
        <div style={{ ...fadeUp(frame, fps, 2) }}>
          <Chip bg={colors.primaryLight} color={colors.primaryDark} fontSize={26} border="none">
            Así funciona
          </Chip>
        </div>
        <div
          style={{
            marginTop: 30,
            marginBottom: 50,
            fontFamily: headingFont,
            fontWeight: 800,
            fontSize: 76,
            letterSpacing: -1.5,
            lineHeight: 1.12,
            color: colors.textPrimary,
            ...fadeUp(frame, fps, 6),
          }}
        >
          StudyTrack te da un <span style={{ color: colors.primaryDark }}>camino</span>.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ ...fadeUp(frame, fps, s.delay) }}>
              <Card style={{ display: "flex", gap: 26, alignItems: "flex-start", padding: 34 }}>
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 20,
                    background: s.bg,
                    color: s.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: headingFont,
                    fontWeight: 800,
                    fontSize: 32,
                    flexShrink: 0,
                  }}
                >
                  {s.n}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: headingFont,
                      fontWeight: 800,
                      fontSize: 36,
                      color: colors.textPrimary,
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontFamily: bodyFont,
                      fontWeight: 500,
                      fontSize: 27,
                      color: colors.textSecondary,
                    }}
                  >
                    {s.body}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          transform: `translateY(${(1 - phoneIn) * 120}px)`,
          opacity: Math.min(1, phoneIn * 1.3),
        }}
      >
        <PhoneFrame width={PHONE_W}>
          <div style={{ padding: "70px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: 28,
                color: colors.textPrimary,
              }}
            >
              Subí tus materiales
            </div>
            <div
              style={{
                border: `3px dashed ${colors.primary}`,
                borderRadius: 20,
                background: "rgba(221,251,234,0.5)",
                padding: 18,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <UploadIcon size={34} />
              <div
                style={{
                  fontFamily: bodyFont,
                  fontWeight: 600,
                  fontSize: 17,
                  color: colors.textSecondary,
                }}
              >
                Tocá para subir
              </div>
            </div>
            {files.map((f, i) => {
              const s = springIn(frame, fps, f.delay, { damping: 12 });
              return (
                <div
                  key={i}
                  style={{
                    opacity: Math.min(1, s * 1.3),
                    transform: `translateX(${(1 - s) * 160}px)`,
                  }}
                >
                  <FileChip kind={f.kind} name={f.name} scale={0.78} />
                </div>
              );
            })}
            <div
              style={{
                height: 14,
                borderRadius: 999,
                background: colors.border,
                overflow: "hidden",
                opacity: progress(frame, 86, 94),
              }}
            >
              <div
                style={{
                  width: `${barP * 100}%`,
                  height: "100%",
                  background: colors.primary,
                  borderRadius: 999,
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { icon: <CalendarIcon size={22} />, text: "Rindo el 16/07", delay: 120 },
                { icon: <TargetIcon size={22} />, text: "Objetivo: 8+", delay: 132 },
              ].map((c, i) => {
                const s = springIn(frame, fps, c.delay, { damping: 11 });
                return (
                  <div key={i} style={{ transform: `scale(${s})` }}>
                    <Chip fontSize={18}>
                      {c.icon} {c.text}
                    </Chip>
                  </div>
                );
              })}
            </div>
          </div>
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};

// ─── Escena 3: Track en el teléfono ──────────────────────────────────
const demoTrackItems: TrackItem[] = [
  { type: "banner", title: "Unidad 1", subtitle: "Funciones de varias variables" },
  { type: "node", kind: "lesson", state: "completed" },
  { type: "node", kind: "lesson", state: "completed" },
  { type: "node", kind: "test", state: "completed" },
  { type: "banner", title: "Unidad 2", subtitle: "Derivadas parciales" },
  { type: "node", kind: "lesson", state: "completed" },
  { type: "node", kind: "daily", state: "current" },
  { type: "node", kind: "lesson", state: "locked" },
  { type: "node", kind: "test", state: "locked" },
  { type: "banner", title: "Unidad 3", subtitle: "Extremos y optimización", tone: "purple" },
  { type: "node", kind: "lesson", state: "premium" },
  { type: "node", kind: "mock", state: "premium" },
];

const TrackScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = TRACK_END - UPLOAD_END;
  const out = fadeOut(frame, dur, 14);
  const phoneIn = springIn(frame, fps, 6, { damping: 15 });

  const features = [
    { icon: <BookIcon size={30} color={colors.primaryDark} />, bg: colors.primaryLight, text: "Lecciones cortas con ejercicios de tus materiales", delay: 26 },
    { icon: <ZapIcon size={30} color={colors.orange} />, bg: colors.yellowLight, text: "Reto diario para mantener la racha", delay: 38 },
    { icon: <RefreshIcon size={30} color={colors.blue} />, bg: colors.blueLight, text: "Repasos justo antes de que te olvides", delay: 50 },
    { icon: <DocIcon size={30} color={colors.purple} />, bg: colors.purpleLight, text: "Simulacros parecidos a tus parciales", delay: 62 },
  ];

  const phoneInnerW = PHONE_W - PHONE_W * 0.032 * 2;
  const trackW = phoneInnerW - 20;
  const scale = 0.62;
  const layout = computeTrackLayout(demoTrackItems, { width: trackW, scale });
  const screenH = PHONE_W * 2.05 - PHONE_W * 0.032 * 2;
  const viewport = screenH - 96;
  const panMax = Math.max(0, layout.totalHeight - viewport + 40);
  const pan = interpolate(frame, [40, 250], [0, -panMax], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 2),
  });

  return (
    <AbsoluteFill style={{ opacity: out, flexDirection: "row", padding: PAD, alignItems: "center" }}>
      <div style={{ flex: 1.2, paddingRight: 80 }}>
        <div
          style={{
            fontFamily: headingFont,
            fontWeight: 800,
            fontSize: 80,
            letterSpacing: -1.5,
            lineHeight: 1.12,
            color: colors.textPrimary,
            ...fadeUp(frame, fps, 4),
          }}
        >
          Un <span style={{ color: colors.primaryDark }}>camino claro</span> hasta el examen.
        </div>
        <div
          style={{
            marginTop: 24,
            fontFamily: bodyFont,
            fontWeight: 500,
            fontSize: 32,
            color: colors.textSecondary,
            lineHeight: 1.45,
            maxWidth: 760,
            ...fadeUp(frame, fps, 14),
          }}
        >
          Nada de documentos largos: un plan visual que te dice qué hacer hoy,
          qué sigue mañana y qué desbloqueás después.
        </div>
        <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 24 }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 20, ...fadeUp(frame, fps, f.delay) }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 18,
                  background: f.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </div>
              <div
                style={{
                  fontFamily: bodyFont,
                  fontWeight: 600,
                  fontSize: 31,
                  color: colors.textPrimary,
                }}
              >
                {f.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          transform: `translateY(${(1 - phoneIn) * 120}px)`,
          opacity: Math.min(1, phoneIn * 1.3),
        }}
      >
        <PhoneFrame width={PHONE_W}>
          <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ position: "relative", zIndex: 2, paddingTop: 44 }}>
              <TrackHeader
                subject="Análisis Mat. II"
                daysLeft={8}
                goal="8+"
                streak={3}
                readiness={42}
                scale={0.72}
              />
            </div>
            <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  position: "absolute",
                  left: 10,
                  right: 10,
                  top: 12,
                  transform: `translateY(${pan}px)`,
                }}
              >
                <TrackMap
                  items={demoTrackItems}
                  width={trackW}
                  scale={scale}
                  drawStart={24}
                  drawDuration={230}
                  currentTooltip="Hoy te toca esto"
                />
              </div>
            </div>
          </div>
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};

// ─── Escena 4: Readiness ─────────────────────────────────────────────
const ReadinessScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = READY_END - TRACK_END;
  const out = fadeOut(frame, dur, 14);
  const ringIn = springIn(frame, fps, 10, { damping: 14 });

  const topics = [
    { name: "Derivadas parciales", value: 0.86, color: colors.primary },
    { name: "Regla de la cadena", value: 0.72, color: colors.primary },
    { name: "Extremos locales", value: 0.48, color: colors.yellow },
    { name: "Integrales dobles", value: 0.25, color: colors.red },
  ];

  return (
    <AbsoluteFill style={{ opacity: out, flexDirection: "row", padding: PAD, alignItems: "center" }}>
      <div style={{ flex: 1.1, paddingRight: 70 }}>
        <div
          style={{
            fontFamily: headingFont,
            fontWeight: 800,
            fontSize: 80,
            letterSpacing: -1.5,
            lineHeight: 1.12,
            color: colors.textPrimary,
            ...fadeUp(frame, fps, 2),
          }}
        >
          Sabé qué tan <span style={{ color: colors.primaryDark }}>preparado</span> estás.
        </div>
        <div
          style={{
            marginTop: 24,
            fontFamily: bodyFont,
            fontWeight: 500,
            fontSize: 32,
            color: colors.textSecondary,
            lineHeight: 1.45,
            maxWidth: 720,
            ...fadeUp(frame, fps, 12),
          }}
        >
          No es solo una barra de progreso: combina tu avance, resultados en
          quizzes, temas cubiertos, repasos y el tiempo que te queda.
        </div>
        <div
          style={{
            marginTop: 50,
            display: "flex",
            justifyContent: "center",
            transform: `scale(${ringIn})`,
          }}
        >
          <ReadinessRing size={430} target={76} startFrame={26} durationFrames={60} />
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{ display: "flex", gap: 26 }}>
          {[
            { icon: <FireIcon size={40} />, big: "5 días", small: "de racha", delay: 20 },
            { icon: <CalendarIcon size={40} />, big: "8 días", small: "para el examen", delay: 30 },
            { icon: <TrophyIcon size={40} />, big: "8+", small: "nota objetivo", delay: 40 },
          ].map((c, i) => {
            const s = springIn(frame, fps, c.delay, { damping: 13 });
            return (
              <div key={i} style={{ flex: 1, opacity: Math.min(1, s * 1.3), transform: `translateY(${(1 - s) * 50}px)` }}>
                <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: 28 }}>
                  {c.icon}
                  <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 40, color: colors.textPrimary }}>
                    {c.big}
                  </div>
                  <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 21, color: colors.textSecondary }}>
                    {c.small}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        <div style={{ ...fadeUp(frame, fps, 52) }}>
          <Card style={{ padding: 36 }}>
            <div
              style={{
                fontFamily: headingFont,
                fontWeight: 800,
                fontSize: 30,
                color: colors.textPrimary,
                marginBottom: 26,
              }}
            >
              Dominio por tema
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {topics.map((t, i) => {
                const w = interpolate(
                  frame,
                  [64 + i * 8, 110 + i * 8],
                  [0, t.value * 100],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => 1 - Math.pow(1 - x, 3) }
                );
                return (
                  <div key={i}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontFamily: bodyFont,
                        fontWeight: 600,
                        fontSize: 24,
                        color: colors.textPrimary,
                        marginBottom: 8,
                      }}
                    >
                      <span>{t.name}</span>
                      <span style={{ color: colors.textSecondary }}>{Math.round(w)}%</span>
                    </div>
                    <div style={{ height: 16, borderRadius: 999, background: colors.border }}>
                      <div
                        style={{
                          width: `${w}%`,
                          height: "100%",
                          borderRadius: 999,
                          background: t.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                marginTop: 28,
                display: "inline-flex",
                ...fadeUp(frame, fps, 120),
              }}
            >
              <Chip bg={colors.redLight} color={colors.red} fontSize={24} border="none">
                Este tema está flojo: Integrales dobles
              </Chip>
            </div>
          </Card>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Escena 5: Paywall / Planes ──────────────────────────────────────
const plans = [
  {
    name: "1 examen",
    price: "$5.900",
    features: ["Plan completo", "Simulacros", "Modo Emergencia"],
    highlight: false,
    delay: 22,
  },
  {
    name: "3 exámenes",
    price: "$12.900",
    features: ["Todo lo de 1 examen", "Para 3 materias", "Mejor precio por examen"],
    highlight: true,
    delay: 34,
  },
  {
    name: "Semestre",
    price: "$19.900",
    features: ["Exámenes ilimitados", "Todo el cuatrimestre", "Readiness avanzado"],
    highlight: false,
    delay: 46,
  },
];

const PaywallScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = PAYWALL_END - READY_END;
  const out = fadeOut(frame, dur, 14);
  const ctaIn = springIn(frame, fps, 90, { damping: 12 });

  return (
    <AbsoluteFill style={{ opacity: out, alignItems: "center", padding: `90px ${PAD}px`, gap: 40 }}>
      <div
        style={{
          fontFamily: headingFont,
          fontWeight: 800,
          fontSize: 72,
          letterSpacing: -1.5,
          color: colors.textPrimary,
          textAlign: "center",
          ...fadeUp(frame, fps, 2),
        }}
      >
        Empezá gratis. <span style={{ color: colors.purple }}>Desbloqueá</span> cuando lo necesites.
      </div>
      <div
        style={{
          fontFamily: bodyFont,
          fontWeight: 500,
          fontSize: 32,
          color: colors.textSecondary,
          marginTop: -14,
          ...fadeUp(frame, fps, 10),
        }}
      >
        Unidades 1 y 2 gratis para siempre. El plan completo, por examen.
      </div>

      <div style={{ display: "flex", gap: 34, marginTop: 10 }}>
        {plans.map((p, i) => {
          const s = springIn(frame, fps, p.delay, { damping: 13 });
          const lift = p.highlight ? -22 : 0;
          return (
            <div
              key={i}
              style={{
                width: 440,
                opacity: Math.min(1, s * 1.3),
                transform: `translateY(${(1 - s) * 90 + lift}px)`,
              }}
            >
              <Card
                style={{
                  padding: 40,
                  position: "relative",
                  border: p.highlight ? `4px solid ${colors.purple}` : `2px solid ${colors.border}`,
                  boxShadow: p.highlight ? "0 30px 70px rgba(139,92,246,0.25)" : softShadow,
                }}
              >
                {p.highlight ? (
                  <div
                    style={{
                      position: "absolute",
                      top: -22,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: colors.purple,
                      color: "#fff",
                      fontFamily: headingFont,
                      fontWeight: 800,
                      fontSize: 22,
                      borderRadius: 999,
                      padding: "8px 24px",
                      boxShadow: "0 5px 0 #6D3EE0",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Más elegido
                  </div>
                ) : null}
                <div
                  style={{
                    fontFamily: headingFont,
                    fontWeight: 800,
                    fontSize: 34,
                    color: colors.textPrimary,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontFamily: headingFont,
                    fontWeight: 800,
                    fontSize: 62,
                    color: p.highlight ? colors.purple : colors.primaryDark,
                  }}
                >
                  {p.price}
                </div>
                <div
                  style={{
                    marginTop: 26,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <CheckIcon size={26} color={colors.primary} />
                      <span
                        style={{
                          fontFamily: bodyFont,
                          fontWeight: 600,
                          fontSize: 25,
                          color: colors.textSecondary,
                        }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      <div style={{ transform: `scale(${ctaIn})`, marginTop: 8 }}>
        <CTAButton label="Empezar gratis" fontSize={36} pressAt={110} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Escena 6: CTA final ─────────────────────────────────────────────
const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const btnIn = springIn(frame, fps, 22, { damping: 12 });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 40 }}>
      <div style={{ ...fadeUp(frame, fps, 2) }}>
        <Wordmark size={84} />
      </div>
      <div
        style={{
          fontFamily: headingFont,
          fontWeight: 800,
          fontSize: 58,
          letterSpacing: -1,
          color: colors.textPrimary,
          textAlign: "center",
          maxWidth: 1200,
          lineHeight: 1.2,
          ...fadeUp(frame, fps, 10),
        }}
      >
        Convertí tus apuntes en un{" "}
        <span style={{ color: colors.primaryDark }}>camino para aprobar</span>.
      </div>
      <div style={{ transform: `scale(${btnIn})`, marginTop: 14 }}>
        <CTAButton label="Crear mi plan de estudio" fontSize={40} pressAt={45} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Composición ─────────────────────────────────────────────────────
export const Demo169: React.FC = () => {
  return (
    <AbsoluteFill>
      <SoftBackground />
      <Sequence durationInFrames={PROBLEM_END} name="Problema">
        <ProblemScene />
      </Sequence>
      <Sequence from={PROBLEM_END} durationInFrames={UPLOAD_END - PROBLEM_END} name="Upload">
        <UploadScene />
      </Sequence>
      <Sequence from={UPLOAD_END} durationInFrames={TRACK_END - UPLOAD_END} name="Track">
        <TrackScene />
      </Sequence>
      <Sequence from={TRACK_END} durationInFrames={READY_END - TRACK_END} name="Readiness">
        <ReadinessScene />
      </Sequence>
      <Sequence from={READY_END} durationInFrames={PAYWALL_END - READY_END} name="Paywall">
        <PaywallScene />
      </Sequence>
      <Sequence from={PAYWALL_END} durationInFrames={DEMO_DURATION - PAYWALL_END} name="CTA">
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};
