/**
 * Input intent: what the player wants the ship to do this frame, decoupled
 * from any particular input device. The engine only ever reads an
 * `InputIntent` — never raw keyboard state — so touch controls can be added
 * later by producing the same shape.
 */
export type InputIntent = {
  turnLeft: boolean;
  turnRight: boolean;
  thrust: boolean;
  firePrimary: boolean;
  /** Edge-triggered: true for exactly one poll() after the key goes down. */
  acceptTab: boolean;
  /** Edge-triggered: true for exactly one poll() after the key goes down. */
  deployAgent: boolean;
  /** Edge-triggered: true for exactly one poll() after the key goes down. */
  pause: boolean;
};

export function emptyIntent(): InputIntent {
  return {
    turnLeft: false,
    turnRight: false,
    thrust: false,
    firePrimary: false,
    acceptTab: false,
    deployAgent: false,
    pause: false,
  };
}

const TURN_LEFT_CODES = ["ArrowLeft", "KeyA"];
const TURN_RIGHT_CODES = ["ArrowRight", "KeyD"];
const THRUST_CODES = ["ArrowUp", "KeyW"];
const FIRE_CODES = ["Space"];

/** Codes the engine cares about — preventDefault so focus/scroll doesn't move. */
const OWNED_CODES = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "KeyA",
  "KeyD",
  "KeyW",
  "KeyS",
  "Space",
  "Tab",
  "KeyE",
  "KeyP",
]);

/**
 * Tracks raw keyboard state *and* touch-intent state, merging both into a
 * single per-frame `InputIntent`. Held movement keys/touches are
 * level-triggered; Tab/E/P are edge-triggered so a held key or a held touch
 * button doesn't repeat the action every frame.
 */
export class InputController {
  private held = new Set<string>();
  private edgePending = new Set<string>();

  // Touch-intent state — set by TouchControls each frame/gesture, merged
  // with keyboard state in poll(). Kept separate from `held` so a virtual
  // joystick released mid-frame can't get confused with keyboard codes.
  private touchAxis: -1 | 0 | 1 = 0;
  private touchThrust = false;
  private touchFire = false;
  private touchTabPending = false;
  private touchDeployPending = false;

  handleKeyDown = (event: KeyboardEvent) => {
    if (OWNED_CODES.has(event.code)) {
      event.preventDefault();
    }
    if (!this.held.has(event.code)) {
      this.edgePending.add(event.code);
    }
    this.held.add(event.code);
  };

  handleKeyUp = (event: KeyboardEvent) => {
    this.held.delete(event.code);
  };

  reset() {
    this.held.clear();
    this.edgePending.clear();
    this.touchAxis = 0;
    this.touchThrust = false;
    this.touchFire = false;
    this.touchTabPending = false;
    this.touchDeployPending = false;
  }

  /** Touch joystick horizontal displacement, quantized to a turn direction. */
  setAxis(turn: -1 | 0 | 1) {
    this.touchAxis = turn;
  }

  /** Touch joystick pushed "up" far enough to count as thrust. */
  setThrust(active: boolean) {
    this.touchThrust = active;
  }

  /** Fire button held/released. */
  pressFire(active: boolean) {
    this.touchFire = active;
  }

  /** Tab (accept-suggestion) button tapped — edge-triggered, like the key. */
  pressTab() {
    this.touchTabPending = true;
  }

  /** Agent-deploy button tapped — edge-triggered, like the key. */
  pressDeploy() {
    this.touchDeployPending = true;
  }

  private consumeEdge(code: string): boolean {
    if (this.edgePending.has(code)) {
      this.edgePending.delete(code);
      return true;
    }
    return false;
  }

  private consumeTouchTab(): boolean {
    if (this.touchTabPending) {
      this.touchTabPending = false;
      return true;
    }
    return false;
  }

  private consumeTouchDeploy(): boolean {
    if (this.touchDeployPending) {
      this.touchDeployPending = false;
      return true;
    }
    return false;
  }

  private anyHeld(codes: string[]): boolean {
    return codes.some((code) => this.held.has(code));
  }

  poll(): InputIntent {
    return {
      turnLeft: this.anyHeld(TURN_LEFT_CODES) || this.touchAxis < 0,
      turnRight: this.anyHeld(TURN_RIGHT_CODES) || this.touchAxis > 0,
      thrust: this.anyHeld(THRUST_CODES) || this.touchThrust,
      firePrimary: this.anyHeld(FIRE_CODES) || this.touchFire,
      acceptTab: this.consumeEdge("Tab") || this.consumeTouchTab(),
      deployAgent: this.consumeEdge("KeyE") || this.consumeTouchDeploy(),
      pause: this.consumeEdge("KeyP"),
    };
  }
}
