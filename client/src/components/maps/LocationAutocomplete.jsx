import { useEffect, useRef } from "react";

/**
 * LocationAutocomplete
 * Uses the Google Maps Places Autocomplete API.
 * This component must only be rendered inside a LoadScript context.
 * CreateRoute.jsx ensures that — it only renders this when googleReady=true.
 */
export default function LocationAutocomplete({ onSelect, disabled }) {
  const inputRef = useRef(null);

  useEffect(() => {
    // Guard: if window.google is not available, do nothing silently.
    if (typeof window === "undefined" || !window.google?.maps?.places) {
      console.warn("LocationAutocomplete: Google Maps Places API not loaded.");
      return;
    }

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      { types: ["geocode"] }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place?.geometry) return;

      onSelect({
        name: place.formatted_address || place.name,
        lat:  place.geometry.location.lat(),
        lng:  place.geometry.location.lng()
      });
    });
  }, [onSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Search location (e.g. College Gate, Bus Stand)"
      disabled={disabled}
      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm transition-colors disabled:opacity-50"
    />
  );
}
