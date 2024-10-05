import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, LoadScript, Autocomplete} from '@react-google-maps/api';

const libraries = ["places"];

function MapPage() {


    /*changed made by mariam:
        1. Change of useEffect --> PAN TO NEW LOCATION
            //before: map wouldn't pan to the new updated location
            //after: now the map changes alongisde the location updates (see the handling function below)
        2. use AUTOCOMPLETE -- takes in a search input from user 
            //replaces the manual input of lat/long
            //uses the autocomplete of the google maps api
            //allows user to 
        3. Change of centering map location -- changed from hardcoded value
        4. Changed SEARCH
            --allowed for ability to search both bookstores and cafes
            --this created the following: 
                --const [bookstores, setBookstores] = useState([]);
                --const [cafes, setCafes] = useState([]);
        5. Created a layer popup to showcase the results
            -- will be changed and fine tuned by Nirjhar
    */
    

    // values from inputs
    const [lat, setLat] = useState(33.77705); //default latitude
    const [lng, setLng] = useState(-84.39896); //default longitude 


    const [map, setMap] = useState(null);
    const autocompleteref = useRef(null);

    //handling search:
    const [placesService, setPlacesService] = useState(null);
    const [bookstores, setBookstores] = useState([]);
    const [cafes, setCafes] = useState([]);

   
    // center should dynamically change based upon specified geolocation or user input
    const center = {
        lat: lat, 
        lng: lng,
    };
    

    //allows the map to pan to wherever lat/lng was updated to -- just better to look at 
    useEffect(() => {
        if (map) {
            map.panTo({lat, lng});
        }
    }, [map, lat, lng]);


    //Initialize PlaceServices
    useEffect(() => {
        if (map) {
            const service = new window.google.maps.places.PlacesService(map);
            setPlacesService(service);
        }
    }, [map]);


    const onPlaceChange = () => {
        const place = autocompleteref.current.getPlace();
        if(place && place.geometry) {
            setLat(place.geometry.location.lat()); //update lat from extracted lat of place
            setLng(place.geometry.location.lng()); //update lng from extracted lng of place
            handleSearch(place.geometry.location.lat(),place.geometry.location.lng()); //call handleSearch
        }
    };

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
                googleMapsApiKey={process.env.REACT_APP_GOOGLE_API_KEY}
                libraries={libraries}
            >
                <GoogleMap
                    mapContainerStyle={{width: "100vw", height: "100vh"}}
                    center={center}
                    zoom={15}
                    onLoad={(mapInstance) => setMap(mapInstance)}
                />

                <div id="search-panel" style = {{
                    position: "absolute", 
                    top: "20px", 
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 1,
                    width: "250px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                    backgroundColor: "#fff",
                    borderRadius: "4px",
                    border: "1px solid #dcdcdc",
                    display: "flex",
                    alignItems: "center",
                    padding: "5px"
                    }}>
                    <Autocomplete
                        onLoad={(autocomplete) => (autocompleteref.current = autocomplete)}
                        onPlaceChanged={onPlaceChange}
                    >
                        <input
                            type = "text"
                            placeholder = "   SEARCH   "
                            className = "search-input"
                            style = {{padding: "8px", width: "100%", fontsize: "14px", border: "none", outline: "none", borderReadius: "4px", backgroundColor: "transparent", whiteSpace: "nowrap", overflow:"hidden", textOverflow: "ellipsis"}}
                        />
                    
                    </Autocomplete>
                </div>

            </LoadScript>

        </>
    );
}
// TODO: make it pan-able or not interactable
export default MapPage;