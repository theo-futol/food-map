'use client';

import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { type Place, stars } from './types';

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
const icon = (cls: string) => L.divIcon({ className: '', html: `<span class="pin ${cls}"></span>`, iconSize: [18, 18] });

function PickHandler({ onPick }: { onPick: Props['onPick'] }) {
  useMapEvents({ click: (e) => onPick([e.latlng.lat, e.latlng.lng]) });
  return null;
}

export default function Map({ places, selectedId, onSelect, onMove, picking, pick, onPick }: Props) {
  return (
    <MapContainer center={[-21.115, 55.536]} zoom={10} className={`map ${picking ? 'picking' : ''}`}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {picking && <PickHandler onPick={onPick} />}
      {picking && pick && <Marker position={pick} icon={icon('pin-draft')} />}
      {places.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={icon(`pin-${p.category}${p.approx_position ? ' approx' : ''}${p.id === selectedId ? ' selected' : ''}`)}
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
            <strong>{p.name}</strong>
            <br />
            {p.category} · {p.city}
            <br />
            {stars(p.avg_stars)} {p.visit_count ? `(${p.visit_count} visit${p.visit_count > 1 ? 's' : ''})` : ''}
            {p.approx_position ? <p className="hint">Approximate position: open details, then drag the marker.</p> : null}
            <br />
            <button onClick={() => onSelect(p.id)}>Details</button>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
