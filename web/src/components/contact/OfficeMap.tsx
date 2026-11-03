'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

const OFFICE: L.LatLngTuple = [50.4474, 30.5226];

/** Interactive OpenStreetMap (Leaflet) with the office marker. */
export default function OfficeMap() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView(OFFICE, 14);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      className: 'map-pin',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });
    L.marker(OFFICE, { icon, title: 'Офіс Canvix' })
      .addTo(map)
      .bindPopup('<strong>Canvix</strong><br>вул. Хрещатик, 22, Київ');

    return () => {
      map.remove();
    };
  }, []);

  return <div ref={ref} className="map-canvas" role="region" aria-label="Карта з розташуванням офісу Canvix" />;
}
