// utils/places.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function getNearbyPlaces(lat, lng, type) {
    const key = process.env.GOOGLE_PLACES_API_KEY;
    // We search within a 2000 meter radius (2km)
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=${type}&key=${key}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // We only want the most relevant info to keep the AI response clean
        return data.results.slice(0, 4).map(p => ({
            name: p.name,
            rating: p.rating || "No rating",
            address: p.vicinity,
            open_now: p.opening_hours ? p.opening_hours.open_now : "Unknown"
        }));
    } catch (err) {
        console.error("Google Places Error:", err);
        return [];
    }
}

module.exports = getNearbyPlaces;