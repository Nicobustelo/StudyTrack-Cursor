import { ImageResponse } from "next/og";

export const SOCIAL_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

export const SOCIAL_IMAGE_ALT =
  "StudyTrack — tu camino de estudio personalizado hasta el examen";

export function createSocialImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          overflow: "hidden",
          background: "#f5f9f6",
          color: "#14241b",
          padding: "72px 82px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: 720,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            <div
              style={{
                width: 66,
                height: 66,
                borderRadius: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#35c977",
                color: "white",
                boxShadow: "0 6px 0 #159553",
                fontSize: 34,
                fontWeight: 900,
              }}
            >
              S
            </div>
            <div style={{ display: "flex" }}>
              Study<span style={{ color: "#35c977" }}>Track</span>
            </div>
          </div>

          <div
            style={{
              marginTop: 48,
              display: "flex",
              flexDirection: "column",
              fontSize: 64,
              lineHeight: 1.04,
              letterSpacing: -2,
              fontWeight: 900,
            }}
          >
            <span>Un camino claro</span>
            <span>hasta tu examen.</span>
          </div>

          <div
            style={{
              marginTop: 30,
              width: 680,
              display: "flex",
              fontSize: 27,
              lineHeight: 1.35,
              color: "#526259",
            }}
          >
            Subí tus materiales y convertí el temario en un plan personalizado,
            con práctica y progreso visible.
          </div>

          <div
            style={{
              marginTop: 38,
              display: "flex",
              alignItems: "center",
              borderRadius: 999,
              background: "#dcf8e8",
              color: "#137a45",
              padding: "14px 24px",
              fontSize: 21,
              fontWeight: 800,
            }}
          >
            Empezá gratis · Sin tarjeta
          </div>
        </div>

        <div
          style={{
            position: "relative",
            width: 300,
            height: 470,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 38,
            border: "2px solid #dce8e0",
            background: "white",
            boxShadow: "0 22px 55px rgba(27, 67, 44, 0.13)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 55,
              left: 148,
              width: 5,
              height: 350,
              display: "flex",
              background: "#d7e5dc",
              borderRadius: 999,
            }}
          />
          {[
            [86, 86, "1", "#35c977", "#159553"],
            [205, 112, "2", "#4c8dff", "#2f63bd"],
            [326, 86, "3", "#d9e1dc", "#a9b5ad"],
          ].map(([top, size, label, background, shadow]) => (
            <div
              key={String(label)}
              style={{
                position: "absolute",
                top: Number(top),
                left: (300 - Number(size)) / 2,
                width: Number(size),
                height: Number(size),
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: String(background),
                color: "white",
                boxShadow: `0 7px 0 ${String(shadow)}`,
                fontSize: Number(size) > 100 ? 42 : 34,
                fontWeight: 900,
              }}
            >
              {String(label)}
            </div>
          ))}
        </div>
      </div>
    ),
    SOCIAL_IMAGE_SIZE,
  );
}
