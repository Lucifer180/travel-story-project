import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { geocodeLocations } from '../../../utils/geocode';
import { Heading, placeInitial } from './parts';

const badgeIcon = (name) =>
  L.divIcon({
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: `<div class="flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white bg-cyan-600 font-serif text-sm font-bold text-white shadow-md">${placeInitial(name)}</div>`,
  });

// Zooms to fit every geocoded place once they're known, and re-measures the
// container, which may have been laid out while the page was still flipping.
function FitToPlaces({ points }) {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => {
      map.invalidateSize();
      if (points.length === 1) map.setView(points[0], 9, { animate: false });
      else if (points.length > 1) map.fitBounds(points, { padding: [24, 24], maxZoom: 9, animate: false });
    }, 300);
    return () => clearTimeout(id);
  }, [map, points]);
  return null;
}

// The trip's places on a map, each marked with a badge of its first letter,
// plus a passport-style stamp for the main place. `data-map-ready` turns
// "true" once every place has been looked up (the PDF export waits on it).
const MapPage = ({ story, forPrint }) => {
  const places = useMemo(
    () => (story.visitedLocation || []).map((p) => p.trim()).filter(Boolean),
    [story.visitedLocation],
  );
  const [coords, setCoords] = useState({});
  const [resolved, setResolved] = useState(0);

  useEffect(() => {
    let cancelled = false;
    geocodeLocations(places, (name, c) => {
      if (cancelled) return;
      setResolved((n) => n + 1);
      if (c) setCoords((prev) => ({ ...prev, [name]: c }));
    });
    return () => {
      cancelled = true;
    };
  }, [places]);

  const located = places.filter((p) => coords[p]);
  const locatedKey = located.join('|');
  const points = useMemo(
    () => located.map((p) => [coords[p].lat, coords[p].lng]),
    [locatedKey, coords], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const main = places[0];
  const ready = resolved >= places.length;

  return (
    <div className='flex h-full flex-col'>
      <Heading className='mb-4'>On the Map</Heading>
      <div
        data-no-flip
        data-map-ready={ready ? 'true' : 'false'}
        className='relative h-[205px] overflow-hidden rounded-md shadow-inner ring-1 ring-black/10'
      >
        <MapContainer
          center={[20, 0]}
          zoom={1}
          scrollWheelZoom={false}
          zoomControl={!forPrint}
          fadeAnimation={!forPrint}
          zoomAnimation={!forPrint}
          attributionControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          {/* crossOrigin lets the PDF export copy the tiles into a canvas */}
          <TileLayer url='https://tile.openstreetmap.org/{z}/{x}/{y}.png' crossOrigin='anonymous' />
          {located.map((name) => (
            <Marker key={name} position={[coords[name].lat, coords[name].lng]} icon={badgeIcon(name)}>
              {!forPrint && (
                <Tooltip direction='top' offset={[0, -14]}>
                  {name}
                </Tooltip>
              )}
            </Marker>
          ))}
          <FitToPlaces points={points} />
        </MapContainer>
        {!ready && (
          <span className='absolute bottom-1.5 left-1.5 z-[500] rounded bg-white/90 px-1.5 py-0.5 font-sans text-[10px] text-neutral-500'>
            Locating places…
          </span>
        )}
      </div>

      {/* Passport-style stamp for the trip's main place */}
      {main && (
        <div className='mt-4 flex items-center gap-3'>
          <div className='flex h-16 w-16 shrink-0 -rotate-6 items-center justify-center rounded-full border-[3px] border-double border-cyan-700 text-cyan-700'>
            <span className='font-serif text-3xl font-bold leading-none'>{placeInitial(main)}</span>
          </div>
          <div className='min-w-0'>
            <p className='truncate font-serif text-base text-neutral-800'>{main}</p>
            <p className='font-sans text-[10px] uppercase tracking-widest text-neutral-400'>
              Visited · {moment(story.visitedDate).format('MMM YYYY')}
            </p>
            {places.length > 1 && (
              <div className='mt-1.5 flex flex-wrap gap-1'>
                {places.slice(1).map((p) => (
                  <span
                    key={p}
                    title={p}
                    className='flex h-5 w-5 items-center justify-center rounded-full bg-cyan-50 font-serif text-[10px] font-bold text-cyan-700 ring-1 ring-cyan-200'
                  >
                    {placeInitial(p)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPage;
