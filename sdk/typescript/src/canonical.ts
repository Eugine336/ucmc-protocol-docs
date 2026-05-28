/**
 * Deterministic JSON serializer for UCMC canonical payloads.
 *
 * Object keys are sorted alphabetically; whitespace is collapsed.
 * Not full RFC-8785 (no Unicode normalization, no number canonicalization
 * beyond what JSON.stringify produces) — sufficient for UCMC payload signing
 * where numeric and string fields are constrained by the schema.
 *
 * @see crypto/identity-and-signing.md — canonical payload construction
 */

/**
 * Serialize a value to a deterministic JSON string.
 *
 * Used by the signing pipeline to ensure identical payloads produce
 * identical byte sequences regardless of property insertion order.
 */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const parts = keys.map(
    (k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`,
  );
  return `{${parts.join(",")}}`;
}
