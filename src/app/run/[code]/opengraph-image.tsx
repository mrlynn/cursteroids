import { ImageResponse } from "next/og";
import { decodeRunCode, type RunResultPayload } from "@/game/encode";
import { profileById } from "@/game/profiles";

export const alt = "Cursteroids run result";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#11110f";
const FG = "#ffffff";
const MUTED = "#9c9c94";
const ACCENT = "#2dd4bf";
const ACCENT_DEEP = "#0f766e";
const TRACK = "rgba(255, 255, 255, 0.12)";

const DIMENSION_LABELS: Record<keyof RunResultPayload["dimensions"], string> = {
  diagnosis: "Diagnosis",
  trust: "Trust",
  systems: "Systems",
  tools: "Tool use",
};

const DIMENSION_ORDER: (keyof RunResultPayload["dimensions"])[] = [
  "diagnosis",
  "trust",
  "systems",
  "tools",
];

function CursorGlyph() {
  return (
    <div
      style={{
        display: "flex",
        width: 0,
        height: 0,
        borderTop: "9px solid transparent",
        borderBottom: "9px solid transparent",
        borderLeft: `14px solid ${ACCENT}`,
        transform: "rotate(-18deg)",
      }}
    />
  );
}

function GenericCard() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: BG,
        color: FG,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <CursorGlyph />
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, letterSpacing: -1 }}>
          CURSTEROIDS
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 26, color: MUTED, marginTop: 18 }}>
        The job description you can play.
      </div>
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const payload = decodeRunCode(code);

    if (!payload) {
      return new ImageResponse(<GenericCard />, { ...size });
    }

    const profile = profileById(payload.profileId);

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: BG,
            color: FG,
            fontFamily: "sans-serif",
            padding: 64,
          }}
        >
          {/* Left column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "58%",
              paddingRight: 40,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: 4,
                  color: ACCENT,
                  marginBottom: 26,
                }}
              >
                CURSTEROIDS
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 76,
                  fontWeight: 700,
                  letterSpacing: -2,
                  lineHeight: 1.02,
                  marginBottom: 22,
                }}
              >
                {profile.name}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 27,
                  color: MUTED,
                  lineHeight: 1.35,
                  maxWidth: 520,
                }}
              >
                {profile.tagline}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <CursorGlyph />
              <div style={{ display: "flex", fontSize: 20, color: MUTED }}>
                Cursteroids — the job description you can play
              </div>
            </div>
          </div>

          {/* Right column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "42%",
              justifyContent: "center",
              gap: 22,
            }}
          >
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                fontSize: 20,
                fontWeight: 700,
                color: BG,
                background: ACCENT,
                borderRadius: 999,
                padding: "8px 20px",
                marginBottom: 8,
              }}
            >
              Phase {payload.phase}/4
            </div>

            {DIMENSION_ORDER.map((id) => {
              const score = payload.dimensions[id];
              return (
                <div key={id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 20,
                      color: MUTED,
                    }}
                  >
                    <div style={{ display: "flex" }}>{DIMENSION_LABELS[id]}</div>
                    <div style={{ display: "flex", color: FG, fontWeight: 700 }}>{score}</div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      height: 14,
                      borderRadius: 999,
                      background: TRACK,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        width: `${score}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: `linear-gradient(90deg, ${ACCENT_DEEP}, ${ACCENT})`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ),
      { ...size },
    );
  } catch {
    return new ImageResponse(<GenericCard />, { ...size });
  }
}
