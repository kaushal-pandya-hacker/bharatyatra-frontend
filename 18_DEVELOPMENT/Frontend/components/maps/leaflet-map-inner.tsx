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
  imageUrl?: string;
}

export interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  routePolyline?: [number, number][];
  isEstimated?: boolean;
  height?: string;
  mapType?: 'roadmap' | 'satellite' | 'terrain';
  onMarkerClick?: (marker: MapMarker) => void;
}

export default function LeafletMapInner({
  center,
  zoom = 12,
  markers = [],
  routePolyline = [],
  isEstimated = false,
  height = '620px',
  mapType = 'roadmap',
  onMarkerClick,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const createMarkerIcon = (category: string, stepNumber?: number) => {
    let bgColor = '#ea4335'; // Google Red pin default
    let iconSymbol = '📍';

    const catUpper = category.toUpperCase();
    if (catUpper.includes('HOTEL') || catUpper.includes('STAY')) {
      bgColor = '#1a73e8'; // Google Blue
      iconSymbol = '🏨';
    } else if (catUpper.includes('RESTAURANT') || catUpper.includes('DINING') || catUpper.includes('EAT')) {
      bgColor = '#e37400'; // Google Amber
      iconSymbol = '🍽️';
    } else if (catUpper.includes('ACTIVITY') || catUpper.includes('EXPERIENCE')) {
      bgColor = '#1e8e3e'; // Google Green
      iconSymbol = '✨';
    } else if (catUpper.includes('ATTRACTION') || catUpper.includes('HERITAGE') || catUpper.includes('SACRED')) {
      bgColor = '#d97706'; // Saffron Gold
      iconSymbol = '🏛️';
    }

    const badgeText = stepNumber ? `${stepNumber}` : iconSymbol;

    const html = `
      <div style="
        background-color: ${bgColor};
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: ${stepNumber ? '14px' : '16px'};
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        border: 2px solid #ffffff;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      ">
        ${badgeText}
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-leaflet-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });
  };

  const getGoogleTileUrl = (type: string) => {
    if (type === 'satellite') return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
    if (type === 'terrain') return 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
    return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
  };

  // 1. Initialize Map Instance (Runs ONCE on mount)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(containerRef.current, {
      center,
      zoom,
      scrollWheelZoom: true,
    });

    // Google Maps Tile Engine Layer
    const tileUrl = getGoogleTileUrl(mapType);
    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps | BharatYatra GIS Engine',
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    layerGroupRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.stop();
          mapRef.current.remove();
        } catch {
          // Ignore unmount transition edge cases
        }
        mapRef.current = null;
        layerGroupRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, []);

  // 2. Update Map Center & Zoom Safely
  useEffect(() => {
    if (!mapRef.current) return;
    try {
      mapRef.current.stop();
      mapRef.current.setView(center, zoom, { animate: false });
    } catch {
      // Safe guard against view transition errors
    }
  }, [center, zoom]);

  // 3. Update Map Tile Layer Safely
  useEffect(() => {
    if (!tileLayerRef.current) return;
    tileLayerRef.current.setUrl(getGoogleTileUrl(mapType));
  }, [mapType]);

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

      const imageHeader = m.imageUrl
        ? `<div style="width: 100%; height: 110px; overflow: hidden; border-radius: 8px 8px 0 0; margin-bottom: 8px;">
            <img src="${m.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${m.title}" />
           </div>`
        : '';

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 2px; min-width: 220px; max-width: 260px;">
          ${imageHeader}
          <div style="padding: 0 4px 4px 4px;">
            <div style="display: flex; items-center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #d97706; background: #fffbeb; padding: 2px 6px; border-radius: 4px;">${m.category}</span>
              ${m.rating ? `<span style="font-size: 11px; font-weight: bold; color: #059669;">⭐ ${m.rating}</span>` : ''}
            </div>
            <h4 style="margin: 4px 0; font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.2;">
              ${m.stepNumber ? `${m.stepNumber}. ` : ''}${m.title}
            </h4>
            ${m.description ? `<p style="margin: 4px 0 8px 0; font-size: 11px; color: #475569; line-height: 1.4;">${m.description}</p>` : ''}
            ${m.price ? `<p style="margin: 0; font-size: 12px; font-weight: 700; color: #d97706;">${m.price}</p>` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280 });
      marker.on('click', () => {
        if (onMarkerClick) onMarkerClick(m);
      });

      layerGroupRef.current?.addLayer(marker);
    });

    if (routePolyline && routePolyline.length > 1) {
      routePolyline.forEach((pt) => bounds.extend(pt));
      const polyline = L.polyline(routePolyline, {
        color: isEstimated ? '#f59e0b' : '#d97706',
        weight: isEstimated ? 4 : 6,
        opacity: isEstimated ? 0.8 : 0.95,
        dashArray: isEstimated ? '8, 8' : undefined,
      });
      layerGroupRef.current.addLayer(polyline);
    }

    if (markers.length > 0 && center[0] === 22.2587 && center[1] === 71.1924) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [markers, routePolyline, isEstimated, onMarkerClick, center]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%' }}
      className="rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/30 bg-surface-container-dark z-0"
    />
  );
}
