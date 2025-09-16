export const BASE_API_URL = "https://api.litebite.ai/v1"
  process.env.BASE_API_URL || "http://localhost:3001/v1";
export const GOOGLE_MAP_API_KEY =
  process.env.GOOGLE_MAP_API_KEY || "AIzaSyAOzhEXiL87zsVPy7sVs6JI1trv6r7Nb68";
export const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID;
export const HOTJAR_ID = process.env.HOTJAR_ID;
export const MAP_ID = process.env.MAP_ID || "2ea27e3d913b627c";
export const GOOGLE_TAG_MANAGER_ID =
  process.env.GOOGLE_TAG_MANAGER_ID || "GTM-";
export const GOOGLE_OAUTH_CLIENT_ID = 
  process.env.GOOGLE_OAUTH_CLIENT_ID || "1008128884544-d7p93kfosb8rn8mjcgivca91joa85tk2.apps.googleusercontent.com";
export const UBER_EATS_URL = "https://www.ubereats.com";

// Test coordinates for New York area (Baskin-Robbins location)
export const test_lng = -74.00733;
export const test_lat = 40.70997;
export const maxDistance = 20; // 100km in meters