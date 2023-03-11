export const collator = new Intl.Collator('ja', { numeric: true, sensitivity: 'base' });

export function sortDict(array: string[]): string[] {
  return array.sort(collator.compare);
}
