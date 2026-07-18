import type { Vector } from "@/game/types";

export function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function distance(a: Vector, b: Vector) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function rotateVector(vector: Vector, angle: number): Vector {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: vector.x * cos - vector.y * sin,
    y: vector.x * sin + vector.y * cos,
  };
}

export function wrapPosition(position: Vector, width: number, height: number, margin = 0) {
  if (position.x < -margin) {
    position.x = width + margin;
  } else if (position.x > width + margin) {
    position.x = -margin;
  }

  if (position.y < -margin) {
    position.y = height + margin;
  } else if (position.y > height + margin) {
    position.y = -margin;
  }
}

export function normalize(vector: Vector): Vector {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return { x: vector.x / length, y: vector.y / length };
}
