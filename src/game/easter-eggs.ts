/**
 * Easter egg helpers for Cursteroids.
 * Pure, framework-free utilities for sequence detection (e.g., Konami code).
 *
 * Usage:
 * In a keydown handler (e.g., useEffect with addEventListener), create a detector:
 *   const detector = createSequenceDetector(KONAMI_SEQUENCE, () => {
 *     console.log('Founding engineer mode unlocked');
 *     // Show toast, set flag, etc.
 *   });
 *   document.addEventListener('keydown', (e) => detector(e.code));
 *
 * This is not wired anywhere yet; integrator can add it to the game loop.
 */

/**
 * Detects a sequence of key presses.
 * Returns a handler function that checks each keystroke.
 * Calls onMatch() when the full sequence is detected.
 * Resets on non-sequence key or timeout.
 */
export function createSequenceDetector(
  sequence: readonly string[],
  onMatch: () => void,
  timeoutMs = 2000
): (key: string) => void {
  let index = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  const resetTimeout = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      index = 0;
    }, timeoutMs);
  };

  return (key: string) => {
    if (key === sequence[index]) {
      index++;
      resetTimeout();

      if (index === sequence.length) {
        onMatch();
        index = 0;
        if (timeoutId) clearTimeout(timeoutId);
      }
    } else {
      index = 0;
      if (timeoutId) clearTimeout(timeoutId);
    }
  };
}

/**
 * Classic Konami code sequence.
 * ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight KeyB KeyA
 * Unlocks a "founding engineer mode" easter egg.
 */
export const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
] as const;
