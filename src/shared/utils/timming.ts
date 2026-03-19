export function parseDurationToMs(duration: string): number {
  const match = duration.match(/^(\d+)(m|h|d)$/);

  if (!match) {
    throw new Error(`Duration is invalid: "${duration}". Use s, m, h or d (ex: 15m, 7d).`);
  }

  const value = Number(match[1]);
  const unit = match[2];

  if (unit === "m") return value * 60 * 1000;
  if (unit === "h") return value * 60 * 60 * 1000;
  return value * 24 * 60 * 60 * 1000;
}

export function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h|d)$/);

  if (!match) {
    throw new Error(`Duration is invalid: "${duration}". Use s, m, h or d (ex: 15m, 7d).`);
  }

  const value = Number(match[1]);
  const unit = match[2];

  if (unit === "s") return value;
  if (unit === "m") return value * 60;
  if (unit === "h") return value * 60 * 60;
  return value * 24 * 60 * 60;
}
