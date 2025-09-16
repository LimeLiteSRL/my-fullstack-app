import consola from "consola";
import Twilio from "twilio";

// Debug: Log environment variables
consola.info("Twilio Environment Variables Check:");
consola.info("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? "✅ Set" : "❌ Missing");
consola.info("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "✅ Set" : "❌ Missing");
consola.info("TWILIO_SERVICE_ID:", process.env.TWILIO_SERVICE_ID ? "✅ Set" : "❌ Missing");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = Twilio(accountSid, authToken);

const SERVICE_ID = process.env.TWILIO_SERVICE_ID || "";

// Debug: Log client initialization
consola.info("Twilio Client:", client ? "✅ Initialized" : "❌ Failed to initialize");
consola.info("Service ID:", SERVICE_ID || "❌ Empty");

export async function createVerification(phone: string) {
  try {
    consola.info("Attempting to create Twilio verification for phone:", phone);
    consola.info("Using Service ID:", SERVICE_ID);
    
    const verification = await client.verify.v2
      .services(SERVICE_ID)
      .verifications.create({
        channel: "sms",
        to: phone,
      });

    consola.success("Twilio verification created successfully:", verification.status);
    return verification.status;
  } catch (error) {
    consola.error("Twilio verification failed with error:");
    consola.error("Error details:", error);
    
    if (error instanceof Error) {
      consola.error("Error message:", error.message);
      consola.error("Error name:", error.name);
    }
    
    // Handle Twilio specific errors
    if (typeof error === 'object' && error !== null) {
      const twilioError = error as any;
      consola.error("Error code:", twilioError.code);
      consola.error("Error status:", twilioError.status);
    }
    
    return "error";
  }
}

export async function createVerificationCheck(phone: string, code: string) {
  const verificationCheck = await client.verify.v2
    .services(SERVICE_ID)
    .verificationChecks.create({
      code: code,
      to: phone,
    });

  // consola.log(verificationCheck)

  return verificationCheck.valid;
}
