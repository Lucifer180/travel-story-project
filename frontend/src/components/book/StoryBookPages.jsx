import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import moment from 'moment';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MdAddAPhoto, MdClose } from 'react-icons/md';
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { cn } from '../../lib/utils';
import { geocodeLocations } from '../../utils/geocode';

// Extra pages for StoryBook: a photo gallery, the most memorable photo, and a
// map with a badge per place. Everything interactive carries data-no-flip so
// clicking it doesn't also turn the page.

export const GALLERY_FRAMES = 6;

// Gallery with every frame present ("" = empty), so a photo keeps its frame.
export const galleryFrames = (story) =>
  Array.from({ length: GALLERY_FRAMES }, (_, i) => story.gallery?.[i] || '');

export const placeInitial = (name) => (name || '?').trim().charAt(0).toUpperCase();

const Heading = ({ children }) => (
  <h3 className='mb-4 text-center text-xl font-medium tracking-tight text-neutral-800'>{children}</h3>
);

// A photo slot. Empty + editable shows an "add photo" prompt; filled +
// editable shows replace / remove controls on hover.
function PhotoFrame({ url, editable, onUpload, onRemove, className, imgClassName, emptyLabel = 'Add photo' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  const pick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) run(() => onUpload(file));
  };

  if (!url && !editable) return null;

  return (
    <div data-no-flip className={cn('group relative overflow-hidden', className)}>
      {url ? (
        <img src={url} alt='' className={cn('h-full w-full object-cover', imgClassName)} />
      ) : (
        <button
          type='button'
          onClick={() => inputRef.current?.click()}
          className='flex h-full w-full flex-col items-center justify-center gap-1 border-2 border-dashed border-neutral-300 font-sans text-[11px] text-neutral-400 transition-colors hover:border-cyan-400 hover:text-cyan-600'
        >
          <MdAddAPhoto className='text-xl' />
          {emptyLabel}
        </button>
      )}
      {url && editable && (
        <div className='absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100'>
          <button
            type='button'
            onClick={() => inputRef.current?.click()}
            className='rounded bg-white/90 px-1.5 py-0.5 font-sans text-[10px] text-neutral-700'
          >
            Replace
          </button>
          <button
            type='button'
            aria-label='Remove photo'
            onClick={() => run(onRemove)}
            className='rounded bg-white/90 px-1 py-0.5 text-neutral-700'
          >
            <MdClose />
          </button>
        </div>
      )}
      {busy && (
        <div className='absolute inset-0 flex items-center justify-center bg-white/70 font-sans text-[11px] text-neutral-500'>
          Saving…
        </div>
      )}
      {editable && <input ref={inputRef} type='file' accept='image/*' className='hidden' onChange={pick} />}
    </div>
  );
}

// Slight tilts so the frames look like prints pinned to the page.
const TILTS = ['-rotate-2', 'rotate-1', 'rotate-2', '-rotate-1', '-rotate-2', 'rotate-1'];

export function GalleryPage({ story, editable, onSavePhotos }) {
  const frames = galleryFrames(story);
  const setFrame = (i, file) =>
    onSavePhotos(story, (s, url) => {
      const next = galleryFrames(s);
      next[i] = url;
      return { gallery: next };
    }, file);

  return (
    <>
      <Heading>Photo Gallery</Heading>
      <div className='grid grid-cols-2 gap-x-3 gap-y-3'>
        {frames.map((url, i) =>
          url || editable ? (
            <div key={i} className={cn('bg-white p-1.5 pb-3.5 shadow-md ring-1 ring-black/5', TILTS[i])}>
              <PhotoFrame
                url={url}
                editable={editable}
                onUpload={(file) => setFrame(i, file)}
                onRemove={() => setFrame(i, null)}
                className='h-[62px] w-full bg-neutral-100'
              />
            </div>
          ) : null,
        )}
      </div>
      {editable && (
        <p className='mt-3 text-center font-sans text-[10px] uppercase tracking-widest text-neutral-400'>
          Click a frame to add a photo
        </p>
      )}
    </>
  );
}

export function MemorablePage({ story, editable, onSavePhotos }) {
  const save = (file) => onSavePhotos(story, (_s, url) => ({ memorableImage: url }), file);
  return (
    <div className='flex h-full flex-col'>
      <Heading>Most Memorable</Heading>
      <div className='mx-auto w-full rotate-1 bg-white p-2 pb-8 shadow-lg ring-1 ring-black/5'>
        <PhotoFrame
          url={story.memorableImage}
          editable={editable}
          onUpload={save}
          onRemove={() => save(null)}
          className='h-[220px] w-full bg-neutral-100'
          emptyLabel='Add your most memorable photo'
        />
        <p className='mt-2 text-center font-serif text-sm italic text-neutral-600'>
          {story.title}, {moment(story.visitedDate).format('MMMM YYYY')}
        </p>
      </div>
    </div>
  );
}

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
      if (points.length === 1) map.setView(points[0], 9);
      else if (points.length > 1) map.fitBounds(points, { padding: [24, 24], maxZoom: 9 });
    }, 300);
    return () => clearTimeout(id);
  }, [map, points]);
  return null;
}

export function MapPage({ story }) {
  const places = useMemo(() => (story.visitedLocation || []).map((p) => p.trim()).filter(Boolean), [story.visitedLocation]);
  const [coords, setCoords] = useState({});

  useEffect(() => {
    let cancelled = false;
    geocodeLocations(places, (name, c) => {
      if (!cancelled && c) setCoords((prev) => ({ ...prev, [name]: c }));
    });
    return () => {
      cancelled = true;
    };
  }, [places]);

  const located = places.filter((p) => coords[p]);
  const points = useMemo(() => located.map((p) => [coords[p].lat, coords[p].lng]), [located.join('|'), coords]); // eslint-disable-line react-hooks/exhaustive-deps
  const main = places[0];

  return (
    <div className='flex h-full flex-col'>
      <Heading>On the Map</Heading>
      <div data-no-flip className='relative h-[205px] overflow-hidden rounded-md shadow-inner ring-1 ring-black/10'>
        <MapContainer
          center={[20, 0]}
          zoom={1}
          scrollWheelZoom={false}
          attributionControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url='https://tile.openstreetmap.org/{z}/{x}/{y}.png' />
          {located.map((name) => (
            <Marker key={name} position={[coords[name].lat, coords[name].lng]} icon={badgeIcon(name)}>
              <Tooltip direction='top' offset={[0, -14]}>
                {name}
              </Tooltip>
            </Marker>
          ))}
          <FitToPlaces points={points} />
        </MapContainer>
        {located.length < places.length && (
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
}
