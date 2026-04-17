import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

/**
 * RouteMapPreview
 * Renders a Google Maps Directions preview of the route stops.
 * Must only be rendered inside a LoadScript context (handled by CreateRoute).
 */
export default function RouteMapPreview({ stops }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!stops || stops.length < 2) return;

    // Guard: window.google must be available (LoadScript has loaded)
    if (typeof window === "undefined" || !window.google?.maps) {
      console.warn("RouteMapPreview: Google Maps not loaded.");
      return;
    }

    const validStops = stops.filter(s => s.lat != null && s.lng != null);
    if (validStops.length < 2) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: validStops[0].lat, lng: validStops[0].lng },
      zoom: 12
    });

    const directionsService  = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({ suppressMarkers: false });

    directionsRenderer.setMap(map);

    directionsService.route(
      {
        origin:      { lat: validStops[0].lat,                          lng: validStops[0].lng },
        destination: { lat: validStops[validStops.length - 1].lat,      lng: validStops[validStops.length - 1].lng },
        waypoints:   validStops.slice(1, -1).map(s => ({
          location: { lat: s.lat, lng: s.lng },
          stopover: true
        })),
        travelMode: "DRIVING"
      },
      (result, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(result);
        } else {
          console.warn("Directions request failed:", status);
        }
      }
    );
  }, [stops]);

  return (
    <div
      ref={mapRef}
      className="w-full rounded-xl border border-slate-200 dark:border-slate-700"
      style={{ height: 350 }}
    />
  );
}
