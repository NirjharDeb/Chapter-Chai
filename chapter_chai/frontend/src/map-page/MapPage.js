import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, LoadScript, Autocomplete} from '@react-google-maps/api';

const libraries = ["places"];

function MapPage() {


    /*changed made by mariam:
        1. Change of useEffect --> PAN TO NEW LOCATION
        2. use AUTOCOMPLETE -- takes in a search input from user 
            //replaces the manual input of lat/long
        3. Change of centering map location -- changed from hardcoded value

    */
    

    // values from inputs
    const [lat, setLat] = useState(33.77705); //default latitude
    const [lng, setLng] = useState(-84.39896); //default longitude 


    const [map, setMap] = useState(null);
    const autocompleteref = useRef(null);

       //deleted values: 
    // const [placesService, setPlacesService] = useState(null);
    // const [places, setPlaces] = useState([]);
   

    // center should dynamically change based upon specified geolocation or user input
    const center = {
        lat: lat, 
        lng: lng,
    };
    

    // useEffect(() => {
    //     if (map) {
    //         const service = new window.google.maps.places.PlacesService(map);
    //         setPlacesService(service);
    //     }
    // }, [map]);

         
    


    //allows the map to pan to wherever lat/lng was updated to -- just better to look at 
    useEffect(() => {
        if (map) {
            map.panTo({lat, lng});
        }
    }, [map, lat, lng]);





    const onPlaceChange = () => {
        const place = autocompleteref.current.getPlace();
        if(place && place.geometry) {
            setLat(place.geometry.location.lat()); //update lat from extracted lat of place
            setLng(place.geometry.location.lng()); //update lng from extracted lng of place
        }
    };


    // const handleSearch = async () => {
    //     if (!placesService) return;

    //     const request = {
    //         keyword: "Bookstores",
    //         location: {lat: lat, lng: lng},
    //         radius: 16093.4 // 10 mi
    //     };
    //     placesService.nearbySearch(request, (results, status) => {
    //         if (status === window.google.maps.places.PlacesServiceStatus.OK) {
    //             setPlaces(results);
    //         } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
    //             console.log("No results!");
    //         } else {
    //             console.error("Places API request failed with status:", status);
    //         }
    //     });
    // };

    return (
        <>
            <LoadScript
                loadingElement={<div>Loading...</div>}
                googleMapsApiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                libraries={libraries}
            >
                <div style={{ display: 'flex', height: '100vh' }}>
                    {/* Left side panel */}
                    <div style={{ width: '300px', overflowY: 'auto', padding: '10px', background: '#f4f4f4' }}>
                        <h3>Places Found:</h3>
                        <input id="lat" type="number" defaultValue={33.77705} onChange={(e) => setLat(parseFloat(e.target.value))} style={{ width: '100%', marginBottom: '10px' }} />
                        <input id="lng" type="number" defaultValue={-84.39896} onChange={(e) => setLng(parseFloat(e.target.value))} style={{ width: '100%', marginBottom: '10px' }} />
                        <button id="search-button" onClick={handleSearch} style={{ width: '100%', marginBottom: '20px' }}>Search</button>
                        <ul>
                            {places.map((place, index) => (
                                <li key={index}>
                                    <b>{place.name}</b><br/>{place.geometry.location.lat()}, {place.geometry.location.lng()}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right side map */}
                    <div style={{ flexGrow: 1 }}>
                        <GoogleMap
                            mapContainerStyle={{width: "100%", height: "100%"}}
                            center={center}
                            zoom={15}
                            onLoad={(mapInstance) => setMap(mapInstance)}
                        />
                    </div>
                </div>
            </LoadScript>
        </>
    );
}

export default MapPage;
