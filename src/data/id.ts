/**
 * Generates a UUID-like random string.
 * @returns {string} A random string.
 */
export function generateId(): string {
  const timestamp = BigInt(Date.now()) ^ 0xffffffffffffffffn;
  const random = (
    timestamp ^
    (BigInt(Math.floor(Math.random() * 0xffffffff)) << 32n) ^
    BigInt(Math.floor(Math.random() * 0xffffffff))
  ).toString(16);
  const [d4, d2] = random
    .padStart(16, '0')
    .match(/^(.{12})(.{4})$/)!
    .slice(1);
  const [_, d0, d1] = timestamp
    .toString(16)
    .match(/^(.{4})(.{8})(.{4})$/)!
    .slice(1);
  const d3 = Math.floor(Math.random() * 0xffff).toString(16);

  return `${d0}-${d1}-${d2}-${d3}-${d4}`;
}
