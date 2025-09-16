"use client";

import React from "react";
import { Button } from "../ui/button";

const MapButton = ({
  children,
  lat,
  lng,
}: {
  children: React.ReactNode;
  lat: number;
  lng: number;
}) => {
  const openMap = () => {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const mapUrl = isIOS
      ? `http://maps.apple.com/?ll=${lat},${lng}&z=15`
      : `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

    window.open(mapUrl, "_blank");
  };

  return (
    <Button className="text-xs font-semibold" variant="pale" onClick={openMap}>
      {children}
    </Button>
  );
};

export default MapButton;
