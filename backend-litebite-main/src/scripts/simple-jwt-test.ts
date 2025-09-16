import { User } from "../models/models";
import { db } from "../db";

// JWT Secret - same as in auth-controller
const JWT_SECRET = "testtesttest";

async function simpleJWTTest() {
  console.log("🔐 Simple JWT Test Starting...\n");

  try {
    // 1. Create a simple test user
    console.log("1️⃣ Creating test user...");
    const testUser = new User({
      email: "simple-test@example.com",
      name: "Simple Test User",
      phone: "+1234567890",
      role: "user"
    });
    await testUser.save();
    console.log("✅ User created with ID:", testUser._id);
    console.log();

    // 2. Generate token
    console.log("2️⃣ Generating JWT token...");
    const jwt = await import("jsonwebtoken");
    const token = jwt.default.sign(
      {
        userId: testUser._id.toString(),
        email: testUser.email,
        role: testUser.role
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    console.log("✅ Token generated:", token.substring(0, 30) + "...");
    console.log();

    // 3. Verify token
    console.log("3️⃣ Verifying token...");
    const decoded = jwt.default.verify(token, JWT_SECRET) as any;
    console.log("✅ Token verified:", {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    });
    console.log();

    // 4. Find user
    console.log("4️⃣ Finding user by token...");
    const foundUser = await User.findById(decoded.userId);
    if (foundUser) {
      console.log("✅ User found:", {
        id: foundUser._id,
        email: foundUser.email,
        name: foundUser.name
      });
    } else {
      console.log("❌ User not found!");
    }
    console.log();

    // 5. Test response format
    console.log("5️⃣ Testing response format...");
    const response = {
      success: true,
      token: token,
      user: {
        id: foundUser?._id.toString(),
        email: foundUser?.email,
        name: foundUser?.name,
        role: foundUser?.role,
        profilePicture: foundUser?.profilePicture
      },
      message: "Authentication successful"
    };
    console.log("✅ Response format:", response);
    console.log();

    console.log("🎉 Simple JWT test completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    // Clean up
    await User.deleteOne({ email: "simple-test@example.com" });
    console.log("✅ Cleanup completed");
  }
}

// Run test
simpleJWTTest();

