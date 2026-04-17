/**
 * LiveControl is deprecated.
 * Live location broadcasting is now handled directly in DriverDashboard.jsx
 * as part of the unified trip lifecycle (start/pause/resume/end).
 *
 * This file is kept as an empty re-export to avoid import errors in any
 * legacy page that may still reference it.
 */
export default function LiveControl() {
  return null;
}
