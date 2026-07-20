/**
 * Compact, URL-safe encoding for a finished Cursteroids run.
 *
 * The payload is bit-packed into 8 bytes (no JSON) and base64url-encoded so a
 * shareable run code stays short in a URL: `/run/<code>`.
 *
 * `decodeRunCode` treats its input as hostile — it never throws, always
 * validates the version byte, and clamps every numeric field back into range
 * before returning. Any malformed input yields `null`.
 */
import { type ProfileId, profileIdFromIndex, profileIndex } from "@/game/profiles";

export const RUN_CODE_VERSION = 1 as const;

export type RunDimensionScores = {
  diagnosis: number;
  trust: number;
  systems: number;
  tools: number;
};

export type RunResultPayload = {
  version: typeof RUN_CODE_VERSION;
  profileId: ProfileId;
  dimensions: RunDimensionScores;
  /** Campaign phase reached, 1-4. */
  phase: number;
  /** Impact score, clamped 0-99999. */
  impact: number;
  completed: boolean;
  /** Index into AI_ADOPTION_ENGINEER_ROLE.artifacts, or -1 if none. */
  topArtifactIndex: number;
};

export type EncodeRunInput = {
  profileId: ProfileId;
  dimensions: RunDimensionScores;
  phase: number;
  impact: number;
  completed: boolean;
  topArtifactIndex: number;
};

// Field order and bit widths. Total = 61 bits, packed into 8 bytes (3 bits of
// trailing zero padding). Keep this array in sync between encode and decode.
const FIELD_BITS = [4, 4, 7, 7, 7, 7, 3, 17, 1, 4] as const;
const TOTAL_BITS = FIELD_BITS.reduce((sum, bits) => sum + bits, 0);
const BYTE_LENGTH = Math.ceil(TOTAL_BITS / 8);

function clampInt(value: unknown, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

// BigInt literals (e.g. `0n`) require an ES2020+ target; this project
// compiles to ES2017, so every BigInt value below goes through the `BigInt()`
// constructor instead.
const BIG_ZERO = BigInt(0);
const BIG_EIGHT = BigInt(8);
const BIG_ONE = BigInt(1);
const BYTE_MASK = BigInt(0xff);

function packFields(values: number[]): Uint8Array {
  const paddedBits = BYTE_LENGTH * 8;
  let acc = BIG_ZERO;
  for (let i = 0; i < FIELD_BITS.length; i++) {
    const bits = FIELD_BITS[i];
    const max = (1 << bits) - 1;
    const v = clampInt(values[i], 0, max);
    acc = (acc << BigInt(bits)) | BigInt(v);
  }
  acc <<= BigInt(paddedBits - TOTAL_BITS);

  const bytes = new Uint8Array(BYTE_LENGTH);
  for (let i = BYTE_LENGTH - 1; i >= 0; i--) {
    bytes[i] = Number(acc & BYTE_MASK);
    acc >>= BIG_EIGHT;
  }
  return bytes;
}

function unpackFields(bytes: Uint8Array): number[] | null {
  if (bytes.length !== BYTE_LENGTH) return null;

  let acc = BIG_ZERO;
  for (let i = 0; i < bytes.length; i++) {
    acc = (acc << BIG_EIGHT) | BigInt(bytes[i]);
  }
  const paddedBits = BYTE_LENGTH * 8;
  acc >>= BigInt(paddedBits - TOTAL_BITS);

  const values = new Array<number>(FIELD_BITS.length);
  for (let i = FIELD_BITS.length - 1; i >= 0; i--) {
    const bits = FIELD_BITS[i];
    const mask = (BIG_ONE << BigInt(bits)) - BIG_ONE;
    values[i] = Number(acc & mask);
    acc >>= BigInt(bits);
  }
  return values;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(bytes).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(input)) return null;
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) base64 += "=";
  try {
    const binary =
      typeof atob === "function" ? atob(base64) : Buffer.from(base64, "base64").toString("binary");
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

export function encodeRunCode(input: EncodeRunInput): string {
  const profileIdx = profileIndex(input.profileId);
  const values = [
    RUN_CODE_VERSION,
    profileIdx,
    clampInt(input.dimensions?.diagnosis, 0, 100),
    clampInt(input.dimensions?.trust, 0, 100),
    clampInt(input.dimensions?.systems, 0, 100),
    clampInt(input.dimensions?.tools, 0, 100),
    clampInt(input.phase, 1, 4) - 1,
    clampInt(input.impact, 0, 99999),
    input.completed ? 1 : 0,
    clampInt(input.topArtifactIndex, -1, 14) + 1,
  ];
  return toBase64Url(packFields(values));
}

/**
 * Decodes a run code produced by `encodeRunCode`. The input is treated as
 * hostile: any wrong length, bad characters, unsupported version, or out of
 * range value results in `null` rather than a thrown error or garbage data.
 */
export function decodeRunCode(code: unknown): RunResultPayload | null {
  if (typeof code !== "string" || code.length === 0 || code.length > 32) {
    return null;
  }
  const bytes = fromBase64Url(code);
  if (!bytes) return null;

  const values = unpackFields(bytes);
  if (!values) return null;

  const [version, profileIdx, diagnosis, trust, systems, tools, phaseRaw, impact, completedRaw, artifactIdxRaw] =
    values;

  if (version !== RUN_CODE_VERSION) return null;

  return {
    version: RUN_CODE_VERSION,
    profileId: profileIdFromIndex(profileIdx),
    dimensions: {
      diagnosis: clampInt(diagnosis, 0, 100),
      trust: clampInt(trust, 0, 100),
      systems: clampInt(systems, 0, 100),
      tools: clampInt(tools, 0, 100),
    },
    phase: clampInt(phaseRaw + 1, 1, 4),
    impact: clampInt(impact, 0, 99999),
    completed: completedRaw === 1,
    topArtifactIndex: clampInt(artifactIdxRaw - 1, -1, 14),
  };
}
