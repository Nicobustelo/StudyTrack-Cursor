import React from "react";
import { colors, softShadow } from "../theme";
import { headingFont, bodyFont } from "../fonts";
import { DocIcon, CameraIcon, PencilIcon, BookIcon } from "./icons";

export type FileKind = "pdf" | "photo" | "notes" | "guide";

const kindMeta: Record<
  FileKind,
  { icon: (size: number) => React.ReactNode; bg: string; tag: string; tagColor: string }
> = {
  pdf: {
    icon: (s) => <DocIcon size={s} color={colors.red} />,
    bg: colors.redLight,
    tag: "PDF",
    tagColor: colors.red,
  },
  photo: {
    icon: (s) => <CameraIcon size={s} color={colors.purple} />,
    bg: colors.purpleLight,
    tag: "FOTO",
    tagColor: colors.purple,
  },
  notes: {
    icon: (s) => <PencilIcon size={s} color={colors.orange} />,
    bg: colors.orangeLight,
    tag: "APUNTE",
    tagColor: colors.orange,
  },
  guide: {
    icon: (s) => <BookIcon size={s} color={colors.blue} />,
    bg: colors.blueLight,
    tag: "GUÍA",
    tagColor: colors.blue,
  },
};

export const FileChip: React.FC<{
  kind: FileKind;
  name: string;
  detail?: string;
  scale?: number;
}> = ({ kind, name, detail, scale = 1 }) => {
  const meta = kindMeta[kind];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18 * scale,
        background: colors.surface,
        border: `2px solid ${colors.border}`,
        borderRadius: 22 * scale,
        padding: `${16 * scale}px ${22 * scale}px`,
        boxShadow: softShadow,
        width: "100%",
      }}
    >
      <div
        style={{
          width: 58 * scale,
          height: 58 * scale,
          borderRadius: 16 * scale,
          background: meta.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {meta.icon(32 * scale)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 * scale, minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: headingFont,
            fontWeight: 700,
            fontSize: 24 * scale,
            color: colors.textPrimary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </div>
        {detail ? (
          <div
            style={{
              fontFamily: bodyFont,
              fontWeight: 500,
              fontSize: 19 * scale,
              color: colors.textSecondary,
              whiteSpace: "nowrap",
            }}
          >
            {detail}
          </div>
        ) : null}
      </div>
      <div
        style={{
          fontFamily: headingFont,
          fontWeight: 800,
          fontSize: 16 * scale,
          color: meta.tagColor,
          background: meta.bg,
          borderRadius: 999,
          padding: `${5 * scale}px ${12 * scale}px`,
          letterSpacing: 1,
          flexShrink: 0,
        }}
      >
        {meta.tag}
      </div>
    </div>
  );
};
