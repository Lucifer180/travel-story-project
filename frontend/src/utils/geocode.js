const CACHE_KEY = "geocodeCache";

const readCache = () => {
    try {
        return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
    } catch {
        return {};
    }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Look up coordinates for a list of place names using OpenStreetMap's free
// Nominatim service. Results (including misses) are cached in localStorage,
// and requests are spaced out to respect Nominatim's 1 req/sec policy.
export const geocodeLocations = async (names, onResult) => {
    const cache = readCache();
    for (const name of names) {
        if (Object.prototype.hasOwnProperty.call(cache, name)) {
            onResult(name, cache[name]);
            continue;
        }
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(name)}`
            );
            const data = await res.json();
            const coords = data[0]
                ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
                : null;
            cache[name] = coords;
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            onResult(name, coords);
        } catch (error) {
            console.error("Geocoding failed for", name, error);
            onResult(name, null);
        }
        await sleep(1100);
    }
};
