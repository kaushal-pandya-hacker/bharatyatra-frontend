'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapMarker {
  id: string;
  title: string;
  category: 'ATTRACTION' | 'HOTEL' | 'RESTAURANT' | 'ACTIVITY' | string;
  latitude: number;
  longitude: number;
  description?: string;
  address?: string;
  price?: string;
  rating?: number | string;
  stepNumber?: number;
}

export interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  routePolyline?: [number, number][];
  isEstimated?: boolean;
  height?: string;
  onMarkerClick?: (marker: MapMarker) => void;
}

export default function LeafletMapInner({
  center,
  zoom = 12,
  markers = [],
  routePolyline = [],
  isEstimated = false,
  height = '420px',
  onMarkerClick,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const createMarkerIcon = (category: string, stepNumber?: number) => {
    let bgColor = '#f59e0b'; // Amber default
    let iconSymbol = '📍';

    const catUpper = category.toUpperCase();
    if (catUpper.includes('HOTEL') || catUpper.includes('STAY')) {
      bgColor = '#3b82f6'; // Blue
      iconSymbol = '🏨';
    } else if (catUpper.includes('RESTAURANT') || catUpper.includes('DINING') || catUpper.includes('EAT')) {
      bgColor = '#ef4444'; // Red
      iconSymbol = '🍽️';
    } else if (catUpper.includes('ACTIVITY') || catUpper.includes('EXPERIENCE')) {
      bgColor = '#10b981'; // Green
      iconSymbol = '🎟️';
    } else if (catUpper.includes('ATTRACTION') || catUpper.includes('SIGHT')) {
      bgColor = '#8b5cf6'; // Purple
      iconSymbol = '🏛️';
    }

    const badgeText = stepNumber ? `${stepNumber}` : iconSymbol;

    const html = `
      <div style="
        background-color: ${bgColor};
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: ${stepNumber ? '14px' : '16px'};
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
        border: 2px solid white;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        ${badgeText}
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-leaflet-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center,
        zoom,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Chalo Farva GeoEngine',
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    } else {
      mapRef.current.setView(center, zoom);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    const bounds = L.latLngBounds([]);

    markers.forEach((m) => {
      if (typeof m.latitude !== 'number' || typeof m.longitude !== 'number') return;
      const latLng: [number, number] = [m.latitude, m.longitude];
      bounds.extend(latLng);

      const icon = createMarkerIcon(m.category, m.stepNumber);
      const marker = L.marker(latLng, { icon });

      let popupContent = `
        <div style="font-family: sans-serif; padding: 4px; min-width: 180px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #1e293b;">
            ${m.stepNumber ? `${m.stepNumber}. ` : ''}${m.title}
          </h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b; font-weight: 500;">
            ${m.category} ${m.rating ? `• ⭐ ${m.rating}` : ''}
          </p>
          ${m.description ? `<p style="margin: 0 0 6px 0; font-size: 12px; color: #334155; line-height: 1.3;">${m.description}</p>` : ''}
          ${m.price ? `<p style="margin: 0; font-size: 12px; font-weight: bold; color: #d97706;">${m.price}</p>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onMarkerClick) onMarkerClick(m);
      });

      layerGroupRef.current?.addLayer(marker);
    });

    if (routePolyline && routePolyline.length > 1) {
      routePolyline.forEach((pt) => bounds.extend(pt));
      const polyline = L.polyline(routePolyline, {
        color: isEstimated ? '#f59e0b' : '#0d9488', // Teal for real road, Amber for estimated
        weight: isEstimated ? 4 : 5,
        opacity: isEstimated ? 0.8 : 0.9,
        dashArray: isEstimated ? '8, 8' : undefined,
      });
      layerGroupRef.current.addLayer(polyline);
    }

    if (markers.length > 0 || routePolyline.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [markers, routePolyline, isEstimated, onMarkerClick]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%' }}
      className="rounded-xl overflow-hidden shadow-inner border border-slate-700/50 bg-slate-900"
    />
  );
}
