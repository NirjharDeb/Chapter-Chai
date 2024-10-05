import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, LoadScript, Autocomplete } from '@react-google-maps/api';

const libraries = ["places"];

function MapPage() {

    // values from inputs
    const [lat, setLat] = useState(33.77705); //default latitude
    const [lng, setLng] = useState(-84.39896); //default longitude 
    const [map, setMap] = useState(null);
    const autocompleteref = useRef(null);
    const [placesService, setPlacesService] = useState(null);
    const [places, setPlaces] = useState([]);
    const [bookstores, setBookstores] = useState([]);
    const [cafes, setCafes] = useState([]);

    // center should dynamically change based upon specified geolocation or user input
    const center = {
        lat: lat, 
        lng: lng,
    };

    //allows the map to pan to wherever lat/lng was updated to
    useEffect(() => {
        if (map) {
            map.panTo({ lat, lng });
            const service = new window.google.maps.places.PlacesService(map);
            setPlacesService(service);
        }
    }, [map, lat, lng]);

    const onPlaceChange = () => {
        const place = autocompleteref.current.getPlace();
        if (place && place.geometry) {
            setLat(place.geometry.location.lat());
            setLng(place.geometry.location.lng());
        }
    };

    // Function to search for bookstores nearby
    const handleSearch = (lat, lng) => {
        if (!placesService) return;
        const location = new window.google.maps.LatLng(lat,lng);
        const requestBookstores = {
            keyword: "Bookstores",
            location,
            radius: 16093.4 // 10 mi
        };
        placesService.nearbySearch(requestBookstores, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                setBookstores(results);
            } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                console.log("No results!");
            } else {
                console.error("Places API request failed with status:", status);
            }
        });
        const requestCafes = {
            keyword: "Cafe",
            location,
            radius: 16093.4 // 10 mi
        };
        placesService.nearbySearch(requestCafes, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                setCafes(results);
            } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                console.log("No results!");
            } else {
                console.error("Places API request failed with status:", status);
            }
        });
    };

            

    return (
        <>
            <LoadScript
                loadingElement={<div>Loading...</div>}
                //googleMapsApiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                googleMapsApiKey={"AIzaSyDac5ECgqd6Bn6C67JwumLnly5ZGm0101g"}
                libraries={libraries}
            >
                <GoogleMap
                    mapContainerStyle={{ width: "calc(100vw - 320px)", height: "100vh", marginLeft: "320px" }} // Adjusted the map width to leave space for results tab
                    center={center}
                    zoom={15}
                    onLoad={(mapInstance) => setMap(mapInstance)}
                    options={{
                        mapTypeControl: false, // This disables terrain and satellite options
                        streetViewControl: false, // Optionally, disable Street View as well if you don't need it
                        fullscreenControl: false, // Optionally, disable the fullscreen button
                    }}
                />

                {/* Results Tab with Search Bar */}
                <div style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "320px",
                    height: "100vh",
                    overflowY: "scroll",
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                    padding: "10px",
                    zIndex: 2,
                    borderRadius: "4px"
                }}>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        marginBottom: "10px"
                    }}>
                        {/* Search Bar */}
                        <Autocomplete
                            onLoad={(autocomplete) => (autocompleteref.current = autocomplete)}
                            onPlaceChanged={onPlaceChange}
                        >
                            <input
                                type="text"
                                placeholder="   SEARCH   "
                                className="search-input"
                                style={{ padding: "8px", width: "100%", fontSize: "14px", border: "1px solid #dcdcdc", borderRadius: "4px", marginBottom: "10px" }}
                            />
                        </Autocomplete>
                        <button onClick={handleSearch} style={{
                            padding: "8px",
                            backgroundColor: "#4285F4",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}>
                            Search
                        </button>
                    </div>

                    {/* Places Found */}
                    <h3 style={{ textAlign: "center", marginBottom: "10px" }}>Places Found</h3>
                    {places.length > 0 ? (
                        <ul style={{ listStyleType: "none", padding: "0" }}>
                            {places.map((place, index) => (
                                <li key={index} style={{ marginBottom: "10px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
                                    <b>{place.name}</b><br />
                                    {place.geometry.location.lat()}, {place.geometry.location.lng()}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No places found.</p>
                    )}
                </div>
            </LoadScript>
        </>
    );
}

export default MapPage;
