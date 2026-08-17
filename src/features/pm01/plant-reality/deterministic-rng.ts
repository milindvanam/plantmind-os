const UINT32_RANGE = 4_294_967_296;

function hashSeed(value: string) {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

/** A deterministic PRNG stream. Never use this for security-sensitive values. */
export function createDeterministicRng(seed: string, namespace: string) {
  if (seed.trim().length === 0) throw new Error("PM-01 simulation seed cannot be empty");
  if (namespace.trim().length === 0) throw new Error("PM-01 RNG namespace cannot be empty");
  let state = hashSeed(`${seed}::${namespace}`);

  const nextUint32 = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return (value ^ (value >>> 14)) >>> 0;
  };

  const next = () => nextUint32() / UINT32_RANGE;

  return {
    next,
    nextUint32,
    between(minimum: number, maximum: number) {
      if (!Number.isFinite(minimum) || !Number.isFinite(maximum) || maximum < minimum)
        throw new Error("PM-01 RNG range is invalid");
      return minimum + next() * (maximum - minimum);
    },
    integer(minimum: number, maximum: number) {
      if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || maximum < minimum)
        throw new Error("PM-01 RNG integer range is invalid");
      return minimum + Math.floor(next() * (maximum - minimum + 1));
    },
    snapshot() {
      return state;
    }
  } as const;
}
