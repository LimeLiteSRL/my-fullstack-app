"use client";

import React, { useEffect, useState } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  MapCameraChangedEvent,
  MapCameraProps,
} from "@vis.gl/react-google-maps";
import { GOOGLE_MAP_API_KEY, MAP_ID } from "@/config";
import useLocationStore from "@/libs/store/location-store";
import RestaurantsMarkers from "./restaurants-marker";
import Direction from "./direction";
import { haversineDistance } from "@/libs/utils";

const GoogleMap = () => {
  const {
    userLocation,
    isCameraOnUser,
    setIsCameraOnUser,
    fetchingLocation,
    setFetchingLocation,
    distance: fetchingDistance,
  } = useLocationStore();

  const INITIAL_CAMERA = {
    center: { lat: userLocation.lat || 40.7, lng: userLocation.lng || -74 },
    zoom: 17,
  };
  const [cameraProps, setCameraProps] =
    useState<MapCameraProps>(INITIAL_CAMERA);

  const handleCameraChange = (ev: MapCameraChangedEvent) => {
    setCameraProps(ev.detail);
    const newCenter = {
      lat: ev.detail.center.lat,
      lng: ev.detail.center.lng,
    };
    const distance = haversineDistance(fetchingLocation, newCenter);

    if (distance > fetchingDistance) {
      setFetchingLocation(newCenter.lat, newCenter.lng);
    }
    if (
      ev.detail.bounds.west > userLocation.lng ||
      userLocation.lng > ev.detail.bounds.east ||
      userLocation.lat > ev.detail.bounds.south ||
      ev.detail.bounds.north < userLocation.lat
    ) {
      if (isCameraOnUser) {
        setIsCameraOnUser(false);
      }
    }
  };

  useEffect(() => {
    if (userLocation.lat && userLocation.lng && isCameraOnUser) {
      setCameraProps({
        center: { lat: userLocation.lat, lng: userLocation.lng },
        zoom: 17,
      });
    }
  }, [userLocation, isCameraOnUser]);

  return (
    // <APIProvider apiKey={GOOGLE_MAP_API_KEY || ""}>
    <Map
      mapId={MAP_ID}
      style={{ width: "100%", height: "100vh" }}
      {...cameraProps}
      onCameraChanged={handleCameraChange}
      defaultZoom={20}
      gestureHandling={"greedy"}
      disableDefaultUI={true}
      // onTilesLoaded={(val) => console.log(val)}
      // onCenterChanged={(val) => console.log(val)}
    >
      {userLocation.lat && userLocation.lng && (
        <AdvancedMarker
          zIndex={99}
          position={userLocation}
          title="Your Location"
        />
      )}
      <RestaurantsMarkers />
      <Direction />
    </Map>
    // {/* </APIProvider> */}
  );
};

export default GoogleMap;
