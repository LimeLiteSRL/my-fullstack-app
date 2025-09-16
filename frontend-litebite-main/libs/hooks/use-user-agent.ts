import { useEffect, useState } from "react";

const useUserAgent = () => {
  const [device, setDevice] = useState<"android" | "ios" | "other">("other");

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isAndroid = /android/i.test(userAgent);
    const isMacOS = /Macintosh|Mac OS X/i.test(userAgent);

    if (isIOS || isMacOS) {
      setDevice("ios");
    }
    if (isAndroid) {
      setDevice("android");
    }
  }, []);

  return { device };
};

export default useUserAgent;
