import {
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { useCallback, useState } from "react";

type IPosition = google.maps.LatLngLiteral;

const AdvancedMarkerWindowInfo = ({
  position,
  children,
  anchor,
}: {
  position: IPosition;
  children: React.ReactNode;
  anchor?: React.ReactNode;
}) => {
  const [infoWindowShown, setInfoWindowShown] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();

  const handleMarkerClick = useCallback(
    () => setInfoWindowShown((isShown) => !isShown),
    [],
  );
  const handleClose = useCallback(() => setInfoWindowShown(false), []);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={position}
        clickable
        onClick={handleMarkerClick}
      >
        {anchor && anchor}
      </AdvancedMarker>

      {infoWindowShown && (
        <InfoWindow
          // headerContent={<h3>Overview</h3>}
          anchor={marker}
          onClose={handleClose}
        >
          {children}
        </InfoWindow>
      )}
    </>
  );
};

export default AdvancedMarkerWindowInfo;
