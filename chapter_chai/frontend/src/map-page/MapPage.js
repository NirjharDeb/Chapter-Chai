import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript } from '@react-google-maps/api';

const libraries = ["places"];

function MapPage() {

    // values from inputs
    const [lat, setLat] = useState(33.77705);
    const [lng, setLng] = useState(-84.39896);

    // values used for map
    const center = {
        lat: 33.77705,
        lng: -84.39896,
    };
    
    const [map, setMap] = useState(null);
    const [placesService, setPlacesService] = useState(null);
    const [places, setPlaces] = useState([]);

    useEffect(() => {
        if (map) {
            const service = new window.google.maps.places.PlacesService(map);
            setPlacesService(service);
        }
    }, [map]);

    const handleSearch = async () => {
        if (!placesService) return;

        const request = {
            keyword: "Bookstores",
            location: {lat: lat, lng: lng},
            radius: 16093.4 // 10 mi
        };
        placesService.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                setPlaces(results);
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
                googleMapsApiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                libraries={libraries}
            >
                <GoogleMap
                    mapContainerStyle={{width: "100vw", height: "100vh"}}
                    center={center}
                    zoom={15}
                    onLoad={(mapInstance) => setMap(mapInstance)}
                />
            </LoadScript>

            <div id="TEMP-UI-SEARCH_REPLACE-WITH-ACTUAL-UI">
                <input id="lat" type="number" defaultValue={33.77705} onChange={(e) => setLat(parseFloat(e.target.value))}/>
                <input id="lng" type="number" defaultValue={-84.39896} onChange={(e) => setLng(parseFloat(e.target.value))}/>
                <button id="search-button" onClick={handleSearch}>Search</button>
            </div>

            <div>
                <h3>Places Found:</h3>
                <ul>
                    {places.map((place, index) => (
                        <li key={index}>
                            <b>{place.name}</b><br/>{place.geometry.location.lat()}, {place.geometry.location.lng()}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
// TODO: make it pan-able or not interactable
export default MapPage;
