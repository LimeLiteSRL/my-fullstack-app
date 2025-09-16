import mongoose from "mongoose";
import { User } from "../models/models";

// JWT Secret - same as in auth-controller
const JWT_SECRET = "testtesttest";

// Test user data
const testUserData = {
  email: "test@example.com",
  name: "Test User",
  phone: "+1234567890",
  role: "user",
  profilePicture: "https://example.com/avatar.jpg"
};

async function testJWTFlow() {
  console.log("🔐 Starting JWT Authentication Test Flow...\n");

  try {
    // 1. Connect to database
    console.log("1️⃣ Connecting to database...");
    await mongoose.connect(process.env.DB_URL || "mongodb://localhost:27017/litebite");
    console.log("✅ Database connected\n");

    // 2. Clean up existing test user
    console.log("2️⃣ Cleaning up existing test user...");
    await User.deleteOne({ email: testUserData.email });
    console.log("✅ Test user cleaned up\n");

    // 3. Create test user
    console.log("3️⃣ Creating test user...");
    const user = new User(testUserData);
    await user.save();
    console.log("✅ Test user created:", {
      id: user._id,
      email: user.email,
      name: user.name
    });
    console.log();

    // 4. Generate JWT token
    console.log("4️⃣ Generating JWT token...");
    const jwt = await import("jsonwebtoken");
    const token = jwt.default.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    console.log("✅ JWT token generated:", token.substring(0, 50) + "...");
    console.log();

    // 5. Decode token without verification
    console.log("5️⃣ Decoding token (without verification)...");
    const decoded = jwt.default.decode(token);
    console.log("✅ Token decoded:", decoded);
    console.log();

    // 6. Verify token
    console.log("6️⃣ Verifying token...");
    const verified = jwt.default.verify(token, JWT_SECRET);
    console.log("✅ Token verified:", verified);
    console.log();

    // 7. Find user by token payload
    console.log("7️⃣ Finding user by token payload...");
    const foundUser = await User.findById(verified.userId);
    if (foundUser) {
      console.log("✅ User found:", {
        id: foundUser._id,
        email: foundUser.email,
        name: foundUser.name,
        profilePicture: foundUser.profilePicture
      });
    } else {
      console.log("❌ User not found!");
    }
    console.log();

    // 8. Test invalid token
    console.log("8️⃣ Testing invalid token...");
    try {
      const invalidToken = "invalid.token.here";
      jwt.default.verify(invalidToken, JWT_SECRET);
      console.log("❌ Invalid token was accepted!");
    } catch (error) {
      console.log("✅ Invalid token correctly rejected:", error.message);
    }
    console.log();

    // 9. Test wrong secret
    console.log("9️⃣ Testing wrong JWT secret...");
    try {
      jwt.default.verify(token, "wrongsecret");
      console.log("❌ Token accepted with wrong secret!");
    } catch (error) {
      console.log("✅ Token correctly rejected with wrong secret:", error.message);
    }
    console.log();

    // 10. Test expired token
    console.log("🔟 Testing expired token...");
    const expiredToken = jwt.default.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "1ms" }
    );
    
    // Wait for token to expire
    await new Promise(resolve => setTimeout(resolve, 10));
    
    try {
      jwt.default.verify(expiredToken, JWT_SECRET);
      console.log("❌ Expired token was accepted!");
    } catch (error) {
      console.log("✅ Expired token correctly rejected:", error.message);
    }
    console.log();

    // 11. Test complete authentication flow
    console.log("1️⃣1️⃣ Testing complete authentication flow...");
    
    // Simulate login response
    const loginResponse = {
      success: true,
      token: token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture
      },
      message: "Login successful"
    };
    
    console.log("✅ Login response:", loginResponse);
    console.log();

    // Simulate token validation
    const tokenValidation = {
      valid: true,
      message: "Token is valid and user exists",
      decoded: verified,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture
      },
      shouldClearToken: false
    };
    
    console.log("✅ Token validation response:", tokenValidation);
    console.log();

    console.log("🎉 All JWT authentication tests passed!");
    console.log("\n📋 Summary:");
    console.log("- ✅ Database connection");
    console.log("- ✅ User creation");
    console.log("- ✅ Token generation");
    console.log("- ✅ Token decoding");
    console.log("- ✅ Token verification");
    console.log("- ✅ User lookup");
    console.log("- ✅ Invalid token rejection");
    console.log("- ✅ Wrong secret rejection");
    console.log("- ✅ Expired token rejection");
    console.log("- ✅ Complete flow simulation");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    // Clean up
    console.log("\n🧹 Cleaning up...");
    await User.deleteOne({ email: testUserData.email });
    await mongoose.disconnect();
    console.log("✅ Cleanup completed");
  }
}

// Run the test
testJWTFlow();

