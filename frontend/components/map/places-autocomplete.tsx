import React, { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import useLocationStore from "@/libs/store/location-store";
import { GOOGLE_MAP_API_KEY } from "@/config";
import { useJsApiLoader } from "@react-google-maps/api";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

const PlacesAutocomplete = () => {
  const map = useMap(); // Access map instance
  const placesLibrary = useMapsLibrary("places"); // Load 'places' library

  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);
  const [searchInput, setSearchInput] = useState(""); // Input value
  const [searchResults, setSearchResults] = useState<
    google.maps.places.PlaceResult[]
  >([]); // Address list

  const inputRef = useRef<HTMLInputElement>(null); // Input ref for focus

  // Initialize PlacesService
  useEffect(() => {
    if (!placesLibrary || !map) return;

    setPlacesService(new placesLibrary.PlacesService(map));
  }, [placesLibrary, map]);

  // Search locations
  const handleSearch = () => {
    if (!placesService || !searchInput) return;

    placesService.textSearch({ query: searchInput }, (results, status) => {
      if (status === "OK" && results) {
        setSearchResults(results); // Update results
      }
    });
  };

  // Handle location selection
  const handleLocationClick = (place: google.maps.places.PlaceResult) => {
    if (place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      // onLocationSelect(lat, lng); // Pass location to parent
    }
  };
  console.log(searchResults);
  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search a location"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            // disabled={!ready}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <div className="flex max-h-[200px] flex-col gap-2 overflow-y-auto">
          {searchResults.map((place, index) => (
            <div
              key={index}
              className="cursor-pointer p-3"
              onClick={() => handleLocationClick(place)}
            >
              {place.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlacesAutocomplete;
