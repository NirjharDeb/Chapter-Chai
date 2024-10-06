import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, LoadScript, Autocomplete, Marker } from '@react-google-maps/api';

const libraries = ["places"];

function MapPage() {
    const [lat, setLat] = useState(33.77705); //default latitude
    const [lng, setLng] = useState(-84.39896); //default longitude 
    const [map, setMap] = useState(null);
    const autocompleteref = useRef(null);
    const [placesService, setPlacesService] = useState(null);
    const [bookstores, setBookstores] = useState([]);
    const [cafes, setCafes] = useState([]);
    const [isBookstoreDropdownOpen, setIsBookstoreDropdownOpen] = useState(false);
    const [isCafeDropdownOpen, setIsCafeDropdownOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);  // For showing the details tab

    const center = {
        lat: lat, 
        lng: lng,
    };

    useEffect(() => {
        if (map) {
            map.panTo({ lat, lng });
            const service = new window.google.maps.places.PlacesService(map);
            setPlacesService(service);
            handleSearch(lat, lng);  // Trigger search when map location changes
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
        
        // Search for bookstores
        const requestBookstores = {
            keyword: "Bookstores",
            location,
            radius: 16093.4 // 10 mi
        };
        placesService.nearbySearch(requestBookstores, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                setBookstores(results);
            } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                setBookstores([]);
            } else {
                console.error("Bookstores request failed with status:", status);
            }
        });

        // Search for cafes
        const requestCafes = {
            keyword: "Cafe",
            location,
            radius: 16093.4 // 10 mi
        };
        placesService.nearbySearch(requestCafes, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                setCafes(results);
            } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                setCafes([]);
            } else {
                console.error("Cafes request failed with status:", status);
            }
        });
    };

    const toggleBookstoreDropdown = () => {
        setIsBookstoreDropdownOpen(!isBookstoreDropdownOpen);
    };

    const toggleCafeDropdown = () => {
        setIsCafeDropdownOpen(!isCafeDropdownOpen);
    };

    const showPlaceDetails = (placeId) => {
        // Fetch place details using placeId
        placesService.getDetails({ placeId }, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                setSelectedPlace({
                    name: place.name,
                    photo: place.photos ? place.photos[0].getUrl() : null,
                    rating: place.rating, // Show only the overall rating out of 5
                });
            } else {
                console.error("Failed to fetch place details:", status);
            }
        });
    };

    const goBackToResults = () => {
        setSelectedPlace(null);
    };

    return (
        <>
            <LoadScript

                loadingElement={<div>Loading...</div>}
                googleMapsApiKey="AIzaSyAQzSw091TkcMWpTUrwP54WJH2jN-6pzKo"
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
                                <button onClick={goBackToResults} style={{ padding: "8px", marginBottom: "10px", backgroundColor: "#CA6D5E", color: "#fff", border: "none", borderRadius: "4px" }}>
                                    Back to Results
                                </button>
                                <h2>{selectedPlace.name}</h2>
                                {selectedPlace.photo && <img src={selectedPlace.photo} alt={selectedPlace.name} style={{ width: "100%", height: "auto", borderRadius: "8px" }} />}
                                <h3>Rating: {selectedPlace.rating ? `${selectedPlace.rating} / 5` : "No rating available"}</h3>
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
                                    width: "100%"
                                }}>
                                    Search
                                </button>

                                <div style={{ maxHeight: "calc(100vh - 150px)", overflowY: "auto", padding: "10px", boxSizing: "border-box" }}>
                                    <h3>Nearby Places</h3>
                                    <div>
                                        <button onClick={toggleBookstoreDropdown} style={{
                                            padding: "8px", width: "100%", textAlign: "left", backgroundColor: "#f1f1f1", border: "1px solid #ddd", borderRadius: "4px", marginBottom: "10px", cursor: "pointer", boxSizing: "border-box"
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
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div>
                                        <button onClick={toggleCafeDropdown} style={{
                                            padding: "8px", width: "100%", textAlign: "left", backgroundColor: "#f1f1f1", border: "1px solid #ddd", borderRadius: "4px", marginBottom: "10px", cursor: "pointer", boxSizing: "border-box"
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
                            {bookstores.map((bookstore, index) => (
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
                                />
                            ))}

                            {/* Render cafe markers */}
                            {cafes.map((cafe, index) => (
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
