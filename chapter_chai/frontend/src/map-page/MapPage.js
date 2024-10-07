import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, LoadScript, Autocomplete, Marker } from '@react-google-maps/api';
import axios from 'axios';

const libraries = ["places"];
// Hardcoded API key (for testing only; replace it securely in production)
const OPENAI_API_KEY = 'test';

function MapPage() {
    const [lat, setLat] = useState(33.77705);
    const [lng, setLng] = useState(-84.39896);
    const [map, setMap] = useState(null);
    const autocompleteref = useRef(null);
    const [placesService, setPlacesService] = useState(null);
    const [bookstores, setBookstores] = useState([]);
    const [cafes, setCafes] = useState([]);
    const [isBookstoreDropdownOpen, setIsBookstoreDropdownOpen] = useState(false);
    const [isCafeDropdownOpen, setIsCafeDropdownOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [filters, setFilters] = useState({
        bookstores: true,
        cafes: true,
        minPrice: 0,
        maxPrice: 4,
        minRating: 0
    });

    // Store AI review cache to prevent redundant API calls
    const [aiReviewCache, setAIReviewCache] = useState({});
    const [aiReviewText, setAIReviewText] = useState(""); // Store AI review text
    const [isCachedReview, setIsCachedReview] = useState(false); // Store cache status

    const [originalCenter, setOriginalCenter] = useState({ lat, lng });
    const [zoom, setZoom] = useState(15);
    const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
    const center = { lat: lat, lng: lng };

    useEffect(() => {
        if (map && placesService) {
            handleSearch(lat, lng);
        }
    }, [map, lat, lng, filters]);

    const onPlaceChange = () => {
        const place = autocompleteref.current.getPlace();
        if (place && place.geometry) {
            setLat(place.geometry.location.lat());
            setLng(place.geometry.location.lng());
        }
    };

    const handleSearch = (lat, lng) => {
        if (!placesService) return;
        const location = new window.google.maps.LatLng(lat, lng);

        const searchPlaces = (keyword, setPlaces) => {
            const request = {
                keyword: keyword,
                location,
                radius: 16093.4,
                minPriceLevel: filters.minPrice,
                maxPriceLevel: filters.maxPrice
            };
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
            searchPlaces("Bookstores", setBookstores);
        } else {
            setBookstores([]);
        }

        if (filters.cafes) {
            searchPlaces("Cafe", setCafes);
        } else {
            setCafes([]);
        }
    };

    const toggleBookstoreDropdown = () => {
        setIsBookstoreDropdownOpen(!isBookstoreDropdownOpen);
    };

    const toggleCafeDropdown = () => {
        setIsCafeDropdownOpen(!isCafeDropdownOpen);
    };

    const showPlaceDetails = (placeId) => {
        setOriginalCenter({ lat, lng });
        setZoom(zoom);

        placesService.getDetails({ placeId }, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                setSelectedPlace({
                    placeId: placeId, // Store the placeId for future API calls
                    name: place.name,
                    photo: place.photos ? place.photos[0].getUrl() : null,
                    rating: place.rating,
                    price: place.price_level,
                    url: place.url,
                    reviews: place.reviews || [],
                });
                setAIReviewText(""); // Reset AI review text
                setIsCachedReview(false); // Reset cache status
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

    const toggleSettingsDropdown = () => {
        setIsSettingsDropdownOpen(!isSettingsDropdownOpen);
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

    // Function to call OpenAI API for review summary using /chat/completions
    const generateAIReview = async (placeId) => {
        if (!selectedPlace) return;

        console.log("Selected place for AI review: ", selectedPlace);

        // Check if we have cached reviews
        const reviewsText = selectedPlace.reviews.slice(0, 20).map(r => r.text).join(" ");
        const currentReviewKey = placeId + '-' + reviewsText;

        if (aiReviewCache[currentReviewKey]) {
            setAIReviewText(aiReviewCache[currentReviewKey]);
            setIsCachedReview(true);
            return;
        }

        try {
            // Updated API call to OpenAI's chat completions endpoint
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
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const aiReview = response.data.choices[0].message.content.trim();
            console.log("Response from OpenAI:", response.data);

            // Cache the generated AI review
            setAIReviewCache(prevCache => ({
                ...prevCache,
                [currentReviewKey]: aiReview
            }));

            setAIReviewText(aiReview);
            setIsCachedReview(false); // This is a new review, not from cache
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
                googleMapsApiKey={env.process.REACT_APP_GOOGLE_API_KEY}
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
                                    padding: "8px", marginBottom: "10px", backgroundColor: "#4285F4", color: "#fff", border: "none", borderRadius: "4px",
                                    transition: "background-color 0.3s ease", cursor: "pointer"
                                }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#357AE8"}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#4285F4"}>
                                    Go Back
                                </button>
                                <h2>{selectedPlace.name}</h2>
                                {selectedPlace.photo && <img src={selectedPlace.photo} alt={selectedPlace.name} style={{ width: "100%", height: "auto", borderRadius: "8px" }} />}
                                <h3>Rating: {selectedPlace.rating ? `${selectedPlace.rating} / 5` : "No rating available"}</h3>
                                <h3>Price Level: {selectedPlace.price ? '💰'.repeat(selectedPlace.price) : "Price not available"}</h3>
                                {selectedPlace.url && (
                                    <a href={selectedPlace.url} target="_blank" rel="noopener noreferrer" style={{
                                        display: "inline-block", marginTop: "10px", padding: "8px 16px", backgroundColor: "#34A853", color: "#fff", borderRadius: "4px",
                                        textDecoration: "none", transition: "background-color 0.3s ease", cursor: "pointer"
                                    }}>
                                        View on Google Maps
                                    </a>
                                )}

                                {/* Generate AI Review button */}
                                <button onClick={() => generateAIReview(selectedPlace.placeId)}
                                    style={{
                                        padding: "8px", marginTop: "10px", backgroundColor: "#F39C12", color: "#fff", border: "none", borderRadius: "4px",
                                        transition: "background-color 0.3s ease", cursor: "pointer"
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#E67E22"}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#F39C12"}>
                                    Generate AI Review
                                </button>

                                {/* AI Review Section */}
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
                                        placeholder="   SEARCH   "
                                        className="search-input"
                                        style={{ padding: "8px", width: "100%", fontSize: "14px", border: "1px solid #dcdcdc", borderRadius: "4px", marginBottom: "10px", boxSizing: "border-box" }}
                                    />
                                </Autocomplete>

                                {/* Filters Section */}
                                <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                                    <h3>Filters</h3>
                                    <div style={{ marginBottom: "10px" }}>
                                        <label htmlFor="price-range">Price Range:</label>
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
                                            value={filters.minRating}
                                            onChange={handleRatingChange}
                                            style={{ width: "100%" }}
                                        />
                                        <span>{filters.minRating} stars</span>
                                    </div>
                                </div>

                                <div style={{ maxHeight: "calc(100vh - 350px)", overflowY: "auto", padding: "10px", boxSizing: "border-box" }}>
                                    <h3>Nearby Places</h3>
                                    <div>
                                        <button onClick={toggleBookstoreDropdown} style={{
                                            padding: "8px", width: "100%", textAlign: "left", backgroundColor: "#f1f1f1", border: "1px solid #ddd", borderRadius: "4px", marginBottom: "10px", cursor: "pointer", boxSizing: "border-box",
                                            transition: "background-color 0.3s ease"
                                        }}>
                                            Bookstores ({bookstores.length})
                                        </button>
                                        {isBookstoreDropdownOpen && (
                                            <ul style={{ listStyleType: "none", padding: "0", marginBottom: "10px", boxSizing: "border-box" }}>
                                                {bookstores.map((place, index) => (
                                                    <li key={index} style={{
                                                        padding: "8px", borderBottom: "1px solid #ddd", cursor: "pointer",
                                                        transition: "background-color 0.3s ease",
                                                        backgroundColor: "#FDFAF9",
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

                                    <div>
                                        <button onClick={toggleCafeDropdown} style={{
                                            padding: "8px", width: "100%", textAlign: "left", backgroundColor: "#f1f1f1", border: "1px solid #ddd", borderRadius: "4px", marginBottom: "10px", cursor: "pointer", boxSizing: "border-box",
                                            transition: "background-color 0.3s ease"
                                        }}>
                                            Cafes ({cafes.length})
                                        </button>
                                        {isCafeDropdownOpen && (
                                            <ul style={{ listStyleType: "none", padding: "0", marginBottom: "10px", boxSizing: "border-box" }}>
                                                {cafes.map((place, index) => (
                                                    <li key={index} style={{
                                                        padding: "8px", borderBottom: "1px solid #ddd", cursor: "pointer",
                                                        transition: "background-color 0.3s ease",
                                                        backgroundColor: "#FDFAF9",
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
                            {/* Render bookstore markers */}
                            {filters.bookstores && bookstores.map((bookstore, index) => (
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

                            {/* Render cafe markers */}
                            {filters.cafes && cafes.map((cafe, index) => (
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
                            onClick={toggleSettingsDropdown} 
                            onMouseOver={(e) => e.currentTarget.style.opacity = "0.7"}
                            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                        />
                        {isSettingsDropdownOpen && (
                            <ul style={{
                                listStyleType: 'none',
                                padding: '0',
                                top: '50px',
                                right: '10px',
                                position: 'fixed', 
                                boxSizing: 'border-box',
                                backgroundColor: '#FDFAF9',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                            }}>
                                <li style={{
                                    padding: '8px',
                                    borderBottom: '1px solid #ddd',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease',
                                }} onClick={() => { /* TODO */ }}>
                                    <strong>Log Out</strong>
                                </li>
                                <li style={{
                                    padding: '8px',
                                    borderBottom: '1px solid #ddd',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease',
                                }} onClick={resetMap}>
                                    <strong>Reset Map</strong>
                                </li>
                                <li style={{
                                    padding: '8px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease',
                                }} onClick={() => { /* TODO */ }}>
                                    <strong>Refresh</strong>
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