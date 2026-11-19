'use client';

import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { AttributionControl, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { CATEGORY_PATHS } from './icons';
import Stars from './Stars';
import { CATEGORY_LABELS, type Place } from './types';

type Props = {
  places: Place[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onMove: (id: number, lat: number, lng: number) => void;
  picking: boolean;
  pick: [number, number] | null;
  onPick: (p: [number, number]) => void;
};

// divIcon avoids Leaflet's default PNG markers, which break under bundlers.
const icon = (cls: string, d = '') =>
  L.divIcon({
    className: '',
    html: `<span class="pin ${cls}">${d && `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`}</span>`,
    iconSize: [30, 30],
  });

// La Réunion plus a little sea; the map can neither pan nor zoom out beyond it.
const BOUNDS = L.latLngBounds([-21.42, 55.18], [-20.84, 55.87]);

function LockToIsland() {
  const map = useMap();
  useEffect(() => {
    const fit = () => map.setMinZoom(map.getBoundsZoom(BOUNDS));
    fit();
    map.on('resize', fit);
    return () => {
      map.off('resize', fit);
    };
  }, [map]);
  return null;
}

function ZoomSlider() {
  const map = useMap();
  const ref = useRef<HTMLDivElement>(null);
  const [, rerender] = useState(0);

  useEffect(() => {
    // Keep slider drags and wheel from also panning or zooming the map.
    L.DomEvent.disableClickPropagation(ref.current!);
    L.DomEvent.disableScrollPropagation(ref.current!);
    const update = () => rerender((n) => n + 1);
    map.on('zoomend zoomlevelschange', update);
    update(); // LockToIsland may have set the min zoom before this listener existed
    return () => {
      map.off('zoomend zoomlevelschange', update);
    };
  }, [map]);

  return (
    <div ref={ref} className="zoom-slider">
      <input
        type="range"
        aria-label="Zoom"
        min={map.getMinZoom()}
        max={map.getMaxZoom()}
        step={1}
        value={map.getZoom()}
        onChange={(e) => map.setZoom(Number(e.target.value))}
      />
    </div>
  );
}

function PickHandler({ onPick }: { onPick: Props['onPick'] }) {
  useMapEvents({ click: (e) => onPick([e.latlng.lat, e.latlng.lng]) });
  return null;
}

export default function Map({ places, selectedId, onSelect, onMove, picking, pick, onPick }: Props) {
  return (
    <MapContainer
      bounds={BOUNDS}
      maxBounds={BOUNDS.pad(0.1)}
      maxBoundsViscosity={1}
      className={`map ${picking ? 'picking' : ''}`}
      attributionControl={false}
      zoomControl={false}
      maxZoom={18}
    >
      <LockToIsland />
      <ZoomSlider />
      {/* prefix={false} drops the "Leaflet" link; the OSM credit is required by its licence. */}
      <AttributionControl prefix={false} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {picking && <PickHandler onPick={onPick} />}
      {picking && pick && <Marker position={pick} icon={icon('pin-draft')} />}
      {places.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={icon(
            `pin-${p.category}${p.approx_position ? ' approx' : ''}${p.id === selectedId ? ' selected' : ''}`,
            CATEGORY_PATHS[p.category],
          )}
          draggable={p.id === selectedId}
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = (e.target as L.Marker).getLatLng();
              onMove(p.id, lat, lng);
            },
          }}
          title={p.name}
        >
          <Popup>
            <div className="pop">
              <span className="pop-meta">
                <span className={`tag cat-${p.category}`}>{CATEGORY_LABELS[p.category]}</span> {p.city}
              </span>
              <strong className="pop-name">{p.name}</strong>
              {p.stars != null && <Stars value={p.stars} />}
              <button className="primary" onClick={() => onSelect(p.id)}>
                Voir la fiche
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
