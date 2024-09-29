import React, { useState } from "react";
import { APIProvider, Map, ColorScheme, useMapsLibrary } from "@vis.gl/react-google-maps";

function MapPage() {

    // values from inputs
    const [lat_temp, setLat_temp] = useState(0);
    const [lng_temp, setLng_temp] = useState(0);

    // values used for map
    const [lat, setLat] = useState(33.77705);
    const [lng, setLng] = useState(-84.39896);
    
    // map if need be
    // const map = useMap();

    const handleSearch = () => {
        // TODO: only set if valid
        setLat(lat_temp);
        setLng(lng_temp);

        // const request = {
        //     textQuery: "Bookstores",
        //     fields: ["displayName", "formattedAddress", "businessStatus", "googleMapsURI", "reviews"],
        //     locationRestriction: {location: {lat: lat, lng: lng}, radius: 16093.4},
        //     isOpenNow: true,
        //     language: "en-US",
        //     maxResultCount: 10
        // };
        // const { places } = await useMapsLibrary("places"); // TODO
    };

    return (
        <div>
            <div id="TEMP-UI-SEARCH_REPLACE-WITH-ACTUAL-UI">
                <input id="lat" type="number" onChange={(e) => setLat_temp(parseFloat(e.target.value))}/>
                <input id="lng" type="number" onChange={(e) => setLng_temp(parseFloat(e.target.value))}/>
                <button id="search-button" onClick={handleSearch}>Search</button>
            </div>        
            <APIProvider apiKey={'AIzaSyBeuiQ_LwAf8N0zXgI56UPyDxqq7M2Vwn8'} onLoad={() => console.log('Maps API has loaded.')}>
                <Map
                    colorScheme={ColorScheme.LIGHT}
                    style={{width: '100vw', height: '100vh'}}
                    gestureHandling={'none'}
                    disableDefaultUI={true}
                    zoom={15}
                    center={{lat: lat, lng: lng}}
                    
                />
            </APIProvider>
        </div>
    );
}
// TODO: make it pan-able or not interactable
export default MapPage;
