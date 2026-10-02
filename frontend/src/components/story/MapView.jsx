import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import React, { useEffect, useMemo, useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { geocodeLocations } from '../../utils/geocode';

// leaflet's default marker images don't resolve under bundlers without this
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const MapView = ({ allStories, onClose, onSelectStory }) => {
    const [coordsByName, setCoordsByName] = useState({});
    const [pending, setPending] = useState(0);

    // location name -> stories that mention it
    const storiesByLocation = useMemo(() => {
        const grouped = {};
        allStories.forEach((story) => {
            (story.visitedLocation || []).forEach((loc) => {
                const name = loc.trim();
                if (!name) return;
                if (!grouped[name]) grouped[name] = [];
                grouped[name].push(story);
            });
        });
        return grouped;
    }, [allStories]);

    useEffect(() => {
        const names = Object.keys(storiesByLocation);
        setPending(names.length);
        geocodeLocations(names, (name, coords) => {
            setPending((p) => p - 1);
            if (coords) {
                setCoordsByName((prev) => ({ ...prev, [name]: coords }));
            }
        });
    }, [storiesByLocation]);

    const markers = Object.entries(coordsByName);

    return (
        <div className='h-full flex flex-col'>
            <div className="flex items-center justify-between pb-3">
                <h5 className='text-xl font-medium text-slate-700'>Places you have been</h5>
                <div className='flex items-center gap-4'>
                    {pending > 0 && (
                        <span className='text-xs text-slate-400'>Locating places... ({pending} left)</span>
                    )}
                    <button onClick={onClose}>
                        <IoMdClose className='text-xl text-slate-400' />
                    </button>
                </div>
            </div>
            <div className='flex-1 rounded-lg overflow-hidden'>
                <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {markers.map(([name, coords]) => (
                        <Marker key={name} position={[coords.lat, coords.lng]}>
                            <Popup>
                                <p className='font-medium mb-1'>{name}</p>
                                {storiesByLocation[name].map((story) => (
                                    <button
                                        key={story._id}
                                        className='block text-cyan-600 underline text-sm mb-1'
                                        onClick={() => onSelectStory(story)}
                                    >
                                        {story.title}
                                    </button>
                                ))}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapView;
