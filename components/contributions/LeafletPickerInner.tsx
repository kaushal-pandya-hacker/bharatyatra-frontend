'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LeafletPickerInnerProps {
  lat: number;
  lng: number;
  onPositionChange: (lat: number, lng: number) => void;
  disabled?: boolean;
}

export default function LeafletPickerInner({
  lat,
  lng,
  onPositionChange,
  disabled = false,
}: LeafletPickerInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Custom SVG marker pin
  const createPinIcon = () => {
    return L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div style="
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translate(-50%, -100%);
        ">
          <div style="
            background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background: white;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [lat || 22.2587, lng || 71.1924], // Gujarat center default
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat || 22.2587, lng || 71.1924], {
        draggable: !disabled,
        icon: createPinIcon(),
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onPositionChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        if (disabled) return;
        const newLat = Number(e.latlng.lat.toFixed(6));
        const newLng = Number(e.latlng.lng.toFixed(6));
        marker.setLatLng([newLat, newLng]);
        onPositionChange(newLat, newLng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker position and pan when lat/lng change externally
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - lat) > 0.0001 || Math.abs(currentPos.lng - lng) > 0.0001) {
        markerRef.current.setLatLng([lat, lng]);
        mapRef.current.panTo([lat, lng]);
      }
    }
  }, [lat, lng]);

  return <div ref={containerRef} className="w-full h-full" />;
}

