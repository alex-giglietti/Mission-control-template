// IntakeForm has been removed — the dashboard now opens directly.
// This file is kept as a stub to avoid import errors during migration.

export default function IntakeForm({ onComplete }: { onComplete?: () => void }) {
  // Immediately call onComplete if somehow invoked
  if (typeof window !== "undefined" && onComplete) onComplete();
  return null;
}
