/** Firestore rejects explicit `undefined` field values. Drop those keys before writing. */
export function omitUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  const defined: Partial<T> = {};
  for (const key of Object.keys(value) as Array<keyof T>) {
    if (value[key] !== undefined) {
      defined[key] = value[key];
    }
  }
  return defined;
}
