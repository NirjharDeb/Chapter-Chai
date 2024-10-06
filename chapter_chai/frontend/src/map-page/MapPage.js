import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, LoadScript, Autocomplete, Marker } from '@react-google-maps/api';

const libraries = ["places"];

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

    const center = {
        lat: lat, 
        lng: lng,
    };

    useEffect(() => {
        if (map) {
            map.panTo({ lat, lng });
            const service = new window.google.maps.places.PlacesService(map);
            setPlacesService(service);
            handleSearch(lat, lng);
        }
    }, [map, lat, lng]);

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
                    // Filter results by rating
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
        placesService.getDetails({ placeId }, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                setSelectedPlace({
                    name: place.name,
                    photo: place.photos ? place.photos[0].getUrl() : null,
                    rating: place.rating,
                    price: place.price_level,
                    url: place.url,
                });
            } else {
                console.error("Failed to fetch place details:", status);
            }
        });
    };

    const goBackToResults = () => {
        setSelectedPlace(null);
    };

    const toggleFilter = (filterType) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [filterType]: !prevFilters[filterType]
        }));
        handleSearch(lat, lng);
    };

    const handlePriceChange = (event) => {
        const [minPrice, maxPrice] = event.target.value.split(',').map(Number);
        setFilters(prevFilters => ({
            ...prevFilters,
            minPrice,
            maxPrice
        }));
        handleSearch(lat, lng);
    };

    const handleRatingChange = (event) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            minRating: Number(event.target.value)
        }));
        handleSearch(lat, lng);
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
                            // Place Details Tab
                            <div style={{ padding: "10px" }}>

                                <button onClick={goBackToResults} style={{ 
                                    padding: "8px", marginBottom: "10px", backgroundColor: "#4285F4", color: "#fff", border: "none", borderRadius: "4px",
                                    transition: "background-color 0.3s ease", cursor: "pointer"

                                }}>
                                    Back to Results
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#357AE8"}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#4285F4"}>

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
                            </div>
                        ) : (
                            // Results Tab
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
                                <button onClick={() => handleSearch(lat, lng)} style={{
                                    padding: "8px",
                                    backgroundColor: "#CA6D5E",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    boxSizing: "border-box",
                                    width: "100%",
                                    transition: "background-color 0.3s ease"
                                }}>
                                    Search
                                </button>

                                {/* Filters Section */}
                                <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                                    <h3>Filters</h3>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                        <button
                                            onClick={() => toggleFilter('bookstores')}
                                            style={{
                                                padding: "8px",
                                                backgroundColor: filters.bookstores ? "#4285F4" : "#f1f1f1",
                                                color: filters.bookstores ? "#fff" : "#000",
                                                border: "1px solid #ddd",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                width: "48%",
                                                transition: "background-color 0.3s ease"
                                            }}
                                        >
                                            Bookstores
                                        </button>
                                        <button
                                            onClick={() => toggleFilter('cafes')}
                                            style={{
                                                padding: "8px",
                                                backgroundColor: filters.cafes ? "#4285F4" : "#f1f1f1",
                                                color: filters.cafes ? "#fff" : "#000",
                                                border: "1px solid #ddd",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                width: "48%",
                                                transition: "background-color 0.3s ease"
                                            }}
                                        >
                                            Cafes
                                        </button>
                                    </div>
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
                            onLoad={(mapInstance) => setMap(mapInstance)}
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
                    </div>
                </div>
            </LoadScript>
        </>
    );
}

export default MapPage;
