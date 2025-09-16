import axios from "axios";

const BASE_URL = "http://localhost:3000";

async function testAPIEndpoints() {
  console.log("🔐 Testing API Endpoints...\n");

  try {
    // 1. Test health check
    console.log("1️⃣ Testing health check...");
    const healthResponse = await axios.get(`${BASE_URL}/health-check`);
    console.log("✅ Health check:", healthResponse.data);
    console.log();

    // 2. Test generate test token
    console.log("2️⃣ Testing generate test token...");
    const tokenResponse = await axios.post(`${BASE_URL}/auth/generate-test-token`, {
      email: "api-test@example.com",
      name: "API Test User",
      role: "user"
    });
    console.log("✅ Token generated:", {
      success: tokenResponse.data.success,
      token: tokenResponse.data.token.substring(0, 30) + "...",
      user: tokenResponse.data.user
    });
    console.log();

    const token = tokenResponse.data.token;

    // 3. Test debug token
    console.log("3️⃣ Testing debug token...");
    const debugResponse = await axios.post(`${BASE_URL}/auth/debug-token`, {
      token: token
    });
    console.log("✅ Token debug:", {
      valid: debugResponse.data.valid,
      message: debugResponse.data.message,
      user: debugResponse.data.user
    });
    console.log();

    // 4. Test with Authorization header
    console.log("4️⃣ Testing with Authorization header...");
    const authResponse = await axios.get(`${BASE_URL}/auth/get-user-by-email?email=api-test@example.com`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("✅ Auth header test:", authResponse.data);
    console.log();

    // 5. Test invalid token
    console.log("5️⃣ Testing invalid token...");
    try {
      await axios.post(`${BASE_URL}/auth/debug-token`, {
        token: "invalid.token.here"
      });
      console.log("❌ Invalid token was accepted!");
    } catch (error: any) {
      console.log("✅ Invalid token correctly rejected:", error.response?.data?.message || error.message);
    }
    console.log();

    // 6. Test missing token
    console.log("6️⃣ Testing missing token...");
    try {
      await axios.post(`${BASE_URL}/auth/debug-token`, {});
      console.log("❌ Missing token was accepted!");
    } catch (error: any) {
      console.log("✅ Missing token correctly rejected:", error.response?.data?.message || error.message);
    }
    console.log();

    console.log("🎉 All API endpoint tests completed!");

  } catch (error: any) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Run test
testAPIEndpoints();

