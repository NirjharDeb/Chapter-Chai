import React, { useEffect, useRef, useState } from "react";
// import { APIProvider, Map, ColorScheme } from "@vis.gl/react-google-maps";
import { GoogleMap, LoadScript } from '@react-google-maps/api';

function MapPage() {

    // values from inputs
    const [lat_temp, setLat_temp] = useState(0);
    const [lng_temp, setLng_temp] = useState(0);

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

    const handleSearch = () => {
        // const request = {
        //     textQuery: "Bookstores",
        //     fields: ["displayName", "formattedAddress", "businessStatus", "googleMapsURI", "reviews"],
        //     locationRestriction: {location: {lat: lat, lng: lng}, radius: 16093.4},
        //     isOpenNow: true,
        //     language: "en-US",
        //     maxResultCount: 10
        // };
        // placesService.textSearch(request, (results, status) => {
        //     if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        //         setPlaces(results);
        //     }
        // });
    };

    return (
        <>
            <div id="TEMP-UI-SEARCH_REPLACE-WITH-ACTUAL-UI">
                <input id="lat" type="number" onChange={(e) => setLat_temp(parseFloat(e.target.value))}/>
                <input id="lng" type="number" onChange={(e) => setLng_temp(parseFloat(e.target.value))}/>
                <button id="search-button" onClick={handleSearch}>Search</button>
            </div>

            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_API_KEY} libraries={["places"]}>
                <GoogleMap
                    mapContainerStyle={{width: "100vw", height: "100vh"}}
                    center={center}
                    zoom={15}
                    onLoad={(mapInstance) => setMap(mapInstance)}
                />
            </LoadScript>

            {/* <div>
                <h3>Places Found:</h3>
                <ul>
                    {places.map((place, index) => (
                        <li key={index}>
                            {place.name} - {place.geometry.location.lat()}, {place.geometry.location.lng()}
                        </li>
                    ))}
                </ul>
            </div> */}

            {/* <APIProvider apiKey={process.env.REACT_APP_GOOGLE_API_KEY} onLoad={() => console.log('Maps API has loaded.')}>
                <Map
                    colorScheme={ColorScheme.LIGHT}
                    style={{width: '100vw', height: '100vh'}}
                    gestureHandling={'none'}
                    disableDefaultUI={true}
                    zoom={15}
                    center={{lat: lat, lng: lng}}
                    
                />
            </APIProvider> */}
        </>
    );
}
// TODO: make it pan-able or not interactable
export default MapPage;
