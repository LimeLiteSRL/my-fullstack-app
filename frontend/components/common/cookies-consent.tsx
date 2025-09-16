"use client";

import { Routes } from "@/libs/routes";
import useLocationStore from "@/libs/store/location-store";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import CookieConsent from "react-cookie-consent";

const CookiesConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const { userLocation } = useLocationStore();

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const response = await axios.get("https://ipapi.co/json/");
        const { country_code } = response.data;

        if (europeanCountries.includes(country_code)) {
          setShowBanner(true);
        }
      } catch (error) {
        console.error("GeoIP Error:", error);
      }
    };

    fetchGeoData();
  }, [userLocation.lat]);

  if (!showBanner) return null;

  return (
    <CookieConsent
      location="bottom"
      buttonText=" Accept All Cookies"
      declineButtonText="Reject Cookies"
      enableDeclineButton
      cookieName="yourAppCookieConsent"
      style={{ background: "#fff", color: "#212121", zIndex: "9999999" }}
      buttonStyle={{
        backgroundColor: "#212121",
        color: "#FFF",
        fontSize: "14px",
        borderRadius: "5px",
      }}
      declineButtonStyle={{
        backgroundColor: "#fff",
        border: "1px solid #212121",
        color: "#212121",
        fontSize: "14px",
        borderRadius: "5px",
      }}
      expires={365}
    >
      By clicking &ldquo;Accept&ldquo;, you agree to our use of cookies for
      analytics and personalization. You can learn more in our
      <Link href={Routes.Privacy} className="text-blue-600">
        {" "}
        Privacy Policy.
      </Link>
    </CookieConsent>
  );
};

export default CookiesConsent;

const europeanCountries = [
  "DE",
  "FR",
  "IT",
  "ES",
  "NL",
  "SE",
  "PL",
  "FI",
  "NO",
  "DK",
  "BE",
  "AT",
  "CH",
  "IE",
  "PT",
  "GR",
  "HU",
  "CZ",
  "SK",
  "SI",
  "HR",
  "EE",
  "LV",
  "LT",
  "LU",
  "BG",
  "RO",
  "CY",
  "MT",
];
