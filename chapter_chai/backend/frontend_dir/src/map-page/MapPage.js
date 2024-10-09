import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, LoadScript, Autocomplete, Marker, Circle } from '@react-google-maps/api';
import axios from 'axios';

const libraries = ["places"];
// Hardcoded API key (for testing only; replace it securely in production)

function MapPage() {
    const [lat, setLat] = useState(33.77705);
    const [lng, setLng] = useState(-84.39896);
    const [map, setMap] = useState(null);
    const autocompleteref = useRef(null);
    const [placesService, setPlacesService] = useState(null);
    const [bookstores, setBookstores] = useState([]);
    const [cafes, setCafes] = useState([]);
    const [maxBookstores, setMaxBookstores] = useState(10);
    const [maxCafes, setMaxCafes] = useState(10);
    const [isBookstoreDropdownOpen, setIsBookstoreDropdownOpen] = useState(false);
    const [isCafeDropdownOpen, setIsCafeDropdownOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [filters, setFilters] = useState({
        bookstores: true,
        cafes: true,
        minPrice: 0,
        maxPrice: 4,
        minRating: 0,
        searchRadius: 16093.4,
        openNow: false // New filter for places open now
    });
    const [searchRadius, setSearchRadius] = useState(16093.4);
    const [aiReviewCache, setAIReviewCache] = useState({});
    const [aiReviewText, setAIReviewText] = useState(""); 
    const [isCachedReview, setIsCachedReview] = useState(false); 

    const [originalCenter, setOriginalCenter] = useState({ lat, lng });
    const [zoom, setZoom] = useState(15);
    const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
    const center = { lat: lat, lng: lng };
    // Utility function to clamp a value between min and max
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    // Linear interpolation function
    const lerp = (value, inputMin, inputMax, outputMin, outputMax) => {
    return outputMin + ((value - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin);
    };
    useEffect(() => {
        if (map && placesService) {
            handleSearch(lat, lng);
        }
    }, [map, lat, lng, filters]);

    useEffect(() => {
        if (map) {
          const newZoom = getZoomLevel(searchRadius);
          setZoom(newZoom);
          map.setZoom(newZoom);
          map.panTo(center);
        }
    }, [searchRadius, map, center]);
    
    const onPlaceChange = () => {
        const place = autocompleteref.current.getPlace();
        if (place && place.geometry) {
            setLat(place.geometry.location.lat());
            setLng(place.geometry.location.lng());
        }
    };

    const getZoomLevel = (radius) => {
        const minZoom = 8; // Max zoom out
        const maxZoom = 15; // Max zoom in
        const minRadius = 1609.34; // 1 mile in meters
        const maxRadius = 80467; // 50 miles in meters

        if (radius < minRadius) radius = minRadius;
        if (radius > maxRadius) radius = maxRadius;

        // Invert the mapping because larger radius should have lower zoom
        const zoom = lerp(radius, minRadius, maxRadius, maxZoom, minZoom);
        return clamp(Math.round(zoom), minZoom, maxZoom);
    };

    const handleRadiusChange = (event) => {
        const radiusInMeters = Number(event.target.value) * 1609.34; // Convert miles to meters
        setFilters((prevFilters) => ({
          ...prevFilters,
          searchRadius: radiusInMeters,
        }));
        setSearchRadius(radiusInMeters);
    };

    const handleSearch = (lat, lng) => {
        if (!placesService) return;
        const location = new window.google.maps.LatLng(lat, lng);

        const searchPlaces = (keyword, setPlaces, applyPriceFilter = false) => {
            const request = {
                keyword: keyword,
                location,
                radius: filters.searchRadius,
                minPriceLevel: applyPriceFilter ? filters.minPrice : undefined,
                maxPriceLevel: applyPriceFilter ? filters.maxPrice : undefined,
                openNow: filters.openNow // Use Google Places API's "openNow" filter
            };
            Object.keys(request).forEach(key => request[key] === undefined && delete request[key]);
            placesService.nearbySearch(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    const filteredResults = results.filter(place => place.rating >= filters.minRating);
                    setPlaces(filteredResults);
                } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    setPlaces([]);
                } else {
                    console.error(`${keyword} request failed with status:`, status);
                }
            });
        };

        if (filters.bookstores) {
            searchPlaces("Bookstores", setBookstores, false);
        } else {
            setBookstores([]);
        }

        if (filters.cafes) {
            searchPlaces("Cafe", setCafes, true);
        } else {
            setCafes([]);
        }
    };

    const showPlaceDetails = (placeId) => {
        setOriginalCenter({ lat, lng });
        setZoom(zoom);

        placesService.getDetails({ placeId }, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                setSelectedPlace({
                    placeId: placeId, 
                    name: place.name,
                    photo: place.photos ? place.photos[0].getUrl() : null,
                    rating: place.rating,
                    price: place.price_level,
                    url: place.url,
                    reviews: place.reviews || [],
                    opening_hours: place.opening_hours // Store opening hours
                });
                setAIReviewText(""); 
                setIsCachedReview(false); 
                if (map) {
                    setLat(place.geometry.location.lat());
                    setLng(place.geometry.location.lng());
                    setTimeout(() => {
                        map.setZoom(18);
                    }, 300);
                }
            } else {
                console.error("Failed to fetch place details:", status);
            }
        });
    };

    const goBackToResults = () => {
        setSelectedPlace(null);
        if (map) {
            setLat(originalCenter.lat);
            setLng(originalCenter.lng);
            setTimeout(() => {
                map.setZoom(zoom);
            }, 300);
        }
    };

    const handlePriceChange = (event) => {
        const [minPrice, maxPrice] = event.target.value.split(',').map(Number);
        setFilters(prevFilters => ({
            ...prevFilters,
            minPrice,
            maxPrice
        }));
    };

    const handleRatingChange = (event) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            minRating: Number(event.target.value)
        }));
    };

    const handleOpenNowChange = () => {
        setFilters(prevFilters => ({
            ...prevFilters,
            openNow: !prevFilters.openNow
        }));
    };

    const resetMap = () => {
        setSelectedPlace(null);
        if (map) {
            setLat(33.77705);
            setLng(-84.39896);
            setTimeout(() => {
                map.setZoom(zoom);
            }, 300);
        }
    };

    const generateAIReview = async (placeId) => {
        if (!selectedPlace) return;

        const reviewsText = selectedPlace.reviews.slice(0, 20).map(r => r.text).join(" ");
        const currentReviewKey = placeId + '-' + reviewsText;

        if (aiReviewCache[currentReviewKey]) {
            setAIReviewText(aiReviewCache[currentReviewKey]);
            setIsCachedReview(true);
            return;
        }

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: `Summarize the following reviews into a concise paragraph: ${reviewsText}` }],
                    max_tokens: 150,
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const aiReview = response.data.choices[0].message.content.trim();
            setAIReviewCache(prevCache => ({
                ...prevCache,
                [currentReviewKey]: aiReview
            }));

            setAIReviewText(aiReview);
            setIsCachedReview(false);
        } catch (error) {
            if (error.response) {
                console.error("Error response:", error.response.data);
            } else {
                console.error("Error generating AI review:", error.message);
            }
            alert("Failed to generate AI review. Please try again.");
        }
    };

    return (
        <>
            <LoadScript
                googleMapsApiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                libraries={libraries}
            >
                <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden" }}>
                    <div style={{
                        width: "320px",
                        height: "100vh",
                        overflowY: "auto",
                        backgroundColor: "#C7AE93",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                        padding: "10px",
                        zIndex: 2,
                        borderRadius: "4px",
                        boxSizing: "border-box"
                    }}>
                        {selectedPlace ? (
                            <div style={{ padding: "10px" }}>
                                <button onClick={goBackToResults} style={{
                                    width: "100%", padding: "12px", marginBottom: "10px", backgroundColor: "#EFAE9F", color: "#FDFAF9", border: "none", borderRadius: "4px",
                                    transition: "background-color 0.3s ease", cursor: "pointer", fontSize: "18px", fontWeight: "bold", textAlign: "center"
                                }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#A35A4A"}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#EFAE9F"}>
                                    BACK TO RESULTS
                                </button>
                                <h2>{selectedPlace.name}</h2>
                                {selectedPlace.photo && <img src={selectedPlace.photo} alt={selectedPlace.name} style={{ width: "100%", height: "auto", borderRadius: "8px" }} />}
                                <h3> ⭐ Rating: {selectedPlace.rating ? `${selectedPlace.rating} / 5` : "No rating available"}</h3>
                                <h3> 💰 Price Level: {selectedPlace.price ? '💰'.repeat(selectedPlace.price) : "not available"}</h3>
                                {selectedPlace.opening_hours && (
                                    <h3> 🕰️ Open Now: {selectedPlace.opening_hours.isOpen() ? 'Yes' : 'No'}</h3>
                                )}
                                {selectedPlace.url && (
                                    <a href={selectedPlace.url} target="_blank" rel="noopener noreferrer" style={{
                                        display: "inline-block", width: "90%", marginTop: "10px", marginBottom: "10px", padding: "12px", backgroundColor: "#77806F", color: "#FDFAF9", borderRadius: "4px",
                                        textDecoration: "none", transition: "background-color 0.3s ease", cursor: "pointer", fontSize: "18px", fontWeight: "bold", textAlign: "center"
                                    }}>
                                        VIEW ON GOOGLE MAPS
                                    </a>
                                )}

                                <button onClick={() => generateAIReview(selectedPlace.placeId)}
                                    style={{
                                        display: "inline-block", width: "100%", padding: "12px", marginBottom: "10px", backgroundColor: "#A35A4A", color: "#FDFAF9", border: "none", borderRadius: "4px",
                                    transition: "background-color 0.3s ease", cursor: "pointer", fontSize: "18px", fontWeight: "bold", textAlign: "center"
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#EFAE9F"}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#A35A4A"}>
                                    GENERATE AI REVIEW
                                </button>

                                {aiReviewText && (
                                    <div style={{ marginTop: "20px" }}>
                                        <h3>AI-Generated Review:</h3>
                                        <p>{aiReviewText}</p>
                                        {isCachedReview && <p style={{ color: 'gray', fontStyle: 'italic' }}>This review is cached and hasn't changed from the previous generation.</p>}
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div>
                                <Autocomplete
                                    onLoad={(autocomplete) => (autocompleteref.current = autocomplete)}
                                    onPlaceChanged={onPlaceChange}
                                >
                                    <input
                                        type="text"
                                        placeholder="SEARCH...   "
                                        className="search-input"
                                        style={{ padding: "8px", width: "100%", fontSize: "14px", border: "1px solid #dcdcdc", borderRadius: "4px", marginBottom: "10px", boxSizing: "border-box" }}
                                    />
                                </Autocomplete>

                                <div style={{ marginTop: "20px", marginBottom: "10px" }}>
                                    <h3>Filters</h3>
                                    <div style={{ marginBottom: "10px" }}>
                                        <label htmlFor="price-range">Price Range for Cafes:</label>
                                        <select id="price-range" onChange={handlePriceChange} value={`${filters.minPrice},${filters.maxPrice}`} style={{ width: "100%", padding: "5px" }}>
                                            <option value="0,4">Any</option>
                                            <option value="0,1">$</option>
                                            <option value="1,2">$$</option>
                                            <option value="2,3">$$$</option>
                                            <option value="3,4">$$$$</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="min-rating">Minimum Rating:</label>
                                        <input
                                            type="range"
                                            id="min-rating"
                                            min="0"
                                            max="5"
                                            step="0.5"
                                            color="#77806F"
                                            value={filters.minRating}
                                            onChange={handleRatingChange}
                                            style={{ width: "100%" }}
                                        />
                                        <span>{filters.minRating} stars</span>
                                    </div>
                                    <div style={{ marginTop: "10px" }}>
                                        <label htmlFor="open-now">Open Now:</label>
                                        <input
                                            type="checkbox"
                                            id="open-now"
                                            checked={filters.openNow}
                                            onChange={handleOpenNowChange}
                                            style={{ marginLeft: "10px" }}
                                        />
                                    </div>
                                    <div style={{display: "flex", justifyContent: "space-around", marginTop: "5px"}}>
                                        <div style={{display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"}}>
                                            <label htmlFor="max-books">Max Bookstores:</label>
                                            <input
                                                type="number"
                                                id="max-books"
                                                defaultValue={maxBookstores}
                                                min={0}
                                                max={25}
                                                onChange={(e) => setMaxBookstores(e.target.value)}
                                                style={{width: "50px", textAlign: "center"}}
                                            />
                                        </div>
                                        <div style={{display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"}}>
                                            <label htmlFor="max-cafes">Max Cafes:</label>
                                            <input
                                                type="number"
                                                id="max-cafes"
                                                defaultValue={maxCafes}
                                                min={0}
                                                max={25}
                                                onChange={(e) => setMaxCafes(e.target.value)}
                                                style={{width: "50px", textAlign: "center"}}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <label htmlFor="radius">Search Radius: {(filters.searchRadius / 1609.34).toFixed(2)} miles</label>
                                <input
                                    type="range"
                                    id="radius"
                                    name="radius"
                                    min="1"
                                    max="50"
                                    value={(searchRadius / 1609.34).toFixed(2)}
                                    onChange={handleRadiusChange}
                                />

                                <div style={{ maxHeight: "calc(100vh - 350px)", overflowY: "auto", padding: "10px", boxSizing: "border-box", textAlign: "center" }}>
                                    <h3>📚 🍵 NEARBY PLACES 🍵 📚</h3>
                                    <div>
                                        <button onClick={() => setIsBookstoreDropdownOpen(!isBookstoreDropdownOpen)} style={{
                                            padding: "8px", width: "100%", textAlign: "center", backgroundColor: "#CA6D5E", border: "1px solid #ddd", borderRadius: "4px", marginBottom: "10px", cursor: "pointer", boxSizing: "border-box",
                                            transition: "background-color 0.3s ease", fontSize: "18px", fontWeight: "bold", color: "#FDFAF9"
                                        }}>
                                            📚 BOOKSTORES ({Math.min(bookstores.length, maxBookstores)})
                                        </button>
                                        {isBookstoreDropdownOpen && (
                                            <ul style={{ listStyleType: "none", padding: "0", marginBottom: "10px", boxSizing: "border-box" }}>
                                                {bookstores.slice(0, Math.min(bookstores.length, maxBookstores)).map((place, index) => (
                                                    <li key={index} style={{
                                                        padding: "8px", borderBottom: "1px solid #ddd", cursor: "pointer",
                                                        transition: "background-color 0.3s ease",
                                                        backgroundColor: "#FDFAF9"
                                                    }}
                                                        onClick={() => showPlaceDetails(place.place_id)}
                                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
                                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#FDFAF9"}
                                                    >
                                                        <strong>{place.name}</strong>
                                                        <br />
                                                        Rating: {place.rating} / 5
                                                        <br />
                                                        Price: {place.price_level ? '💰'.repeat(place.price_level) : "not available"}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div>
                                        <button onClick={() => setIsCafeDropdownOpen(!isCafeDropdownOpen)} style={{
                                            padding: "8px", width: "100%", textAlign: "center", backgroundColor: "#CA6D5E", border: "1px solid #ddd", borderRadius: "4px", marginBottom: "10px", cursor: "pointer", boxSizing: "border-box",
                                            transition: "background-color 0.3s ease", fontSize: "18px", fontWeight: "bold", color: "#FDFAF9"
                                        }}>
                                            🍵 CAFES ({Math.min(cafes.length, maxCafes)})
                                        </button>
                                        {isCafeDropdownOpen && (
                                            <ul style={{ listStyleType: "none", padding: "0", marginBottom: "10px", boxSizing: "border-box" }}>
                                                {cafes.slice(0, Math.min(cafes.length, maxCafes)).map((place, index) => (
                                                    <li key={index} style={{
                                                        padding: "8px", borderBottom: "1px solid #ddd", cursor: "pointer",
                                                        transition: "background-color 0.3s ease",
                                                        backgroundColor: "#FDFAF9"
                                                    }}
                                                        onClick={() => showPlaceDetails(place.place_id)}
                                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
                                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#FDFAF9"}
                                                    >
                                                        <strong>{place.name}</strong>
                                                        <br />
                                                        Rating: {place.rating} / 5
                                                        <br />
                                                        Price: {'💰'.repeat(place.price_level || 0)}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ width: "calc(100vw - 320px)", height: "100vh", boxSizing: "border-box" }}>
                        <GoogleMap
                            mapContainerStyle={{ width: "100%", height: "100%" }}
                            center={center}
                            zoom={15}
                            onLoad={(mapInstance) => {
                                setMap(mapInstance);
                                setPlacesService(new window.google.maps.places.PlacesService(mapInstance));
                            }}
                            options={{
                                mapTypeControl: false,
                                streetViewControl: false,
                                fullscreenControl: false,
                            }}
                        >
                            {filters.bookstores && bookstores.slice(0, Math.min(bookstores.length, maxBookstores)).map((bookstore, index) => (
                                <Marker
                                    key={`bookstore-${index}`}
                                    position={{
                                        lat: bookstore.geometry.location.lat(),
                                        lng: bookstore.geometry.location.lng()
                                    }}
                                    icon={{
                                        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                                    }}
                                    title={bookstore.name}
                                    onClick={() => showPlaceDetails(bookstore.place_id)}
                                />
                            ))}

                            {filters.cafes && cafes.slice(0, Math.min(cafes.length, maxCafes)).map((cafe, index) => (
                                <Marker
                                    key={`cafe-${index}`}
                                    position={{
                                        lat: cafe.geometry.location.lat(),
                                        lng: cafe.geometry.location.lng()
                                    }}
                                    icon={{
                                        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                                    }}
                                    title={cafe.name}
                                    onClick={() => showPlaceDetails(cafe.place_id)}
                                />
                            ))}

                            <Circle
                            center={center}
                            radius={filters.searchRadius}
                            options={{
                                fillColor: "#CA6D5E",
                                fillOpacity: 0.2,
                                strokeColor: "#CA6D5E",
                                strokeOpacity: 0.5,
                                strokeWeight: 1,
                            }}
                            />
                        </GoogleMap>
                        <img style={{
                                width: '50px',
                                height: '50px',
                                position: 'fixed', 
                                top: '10px', 
                                right: '10px', 
                                cursor: 'pointer',
                                transition: 'opacity 0.3s ease',
                            }}
                            src='https://cdn.discordapp.com/attachments/1278357706666676228/1292642631335018536/settings.png?ex=67047ac3&is=67032943&hm=3dad938f24e6f0417e993d29777ad6513942bc249096c13abf0c307751178986&'
                            alt='Settings'
                            onClick={() => setIsSettingsDropdownOpen(!isSettingsDropdownOpen)} 
                            onMouseOver={(e) => e.currentTarget.style.opacity = "0.7"}
                            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                        />
                        {isSettingsDropdownOpen && (
                            <ul style={{
                                listStyleType: 'none',
                                top: '50px',
                                right: '10px',
                                position: 'fixed',
                                boxSizing: 'border-box',
                                backgroundColor: '#FDFAF9',
                                borderRadius: '4px',
                                padding: '8px',
                                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                            }}>
                                <li style={{
                                    borderBottom: '1px solid #ddd',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease',
                                }} onClick={resetMap}>
                                    <strong>Reset Map</strong>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </LoadScript>
        </>
    );
}

export default MapPage;