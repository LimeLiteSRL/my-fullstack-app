"use client";
import React from "react";
import { ThemeProvider } from "./theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/libs/query-client";
import ClientSideRendering from "./client-side-rendering";
import { Toaster } from "sonner";
import useSyncToken from "@/libs/hooks/use-sync-token";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import TourProviderComponent from "./common/tour-provider";
import { APIProvider } from "@vis.gl/react-google-maps";
import { GOOGLE_MAP_API_KEY, GOOGLE_OAUTH_CLIENT_ID } from "@/config";
import Script from "next/script";

const Provider = ({ children }: { children: React.ReactNode }) => {
  useSyncToken();
  return (
    <GoogleOAuthProvider clientId={GOOGLE_OAUTH_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <ClientSideRendering>
          <APIProvider apiKey={GOOGLE_MAP_API_KEY || ""}>
            <TourProviderComponent>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                disableTransitionOnChange
              >
                <Toaster closeButton position="top-center" />
                {children}
              </ThemeProvider>
            </TourProviderComponent>
          </APIProvider>
        </ClientSideRendering>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default Provider;
