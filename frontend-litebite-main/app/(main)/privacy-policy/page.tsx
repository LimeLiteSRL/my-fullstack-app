import { ArrowLeftIcon } from "@/components/icons/icons";
import BackButton from "@/components/profile/back-button";
import { Routes } from "@/libs/routes";
import { cn } from "@/libs/utils";

export default function Page() {
  return (
    <div className="scroll-smooth p-4 text-[#212427]">
      <div>
        <BackButton />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-semibold">LiteBite – Privacy Policy & Terms of Use</h1>
      </div>

      <div className="mt-6 space-y-6 text-sm leading-6">
        <div className="relative space-y-2 rounded-lg bg-offWhite p-4">
          <div className="flex flex-wrap items-center gap-1">
            <span className="font-semibold">Effective Date:</span>
            <span>1 September 2025</span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="font-semibold">Company Name:</span>
            <span>Lime Lite SRL (operating as LiteBite)</span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="font-semibold">Address:</span>
            <span>Vredelaan, 1081 Brussels, Belgium</span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="font-semibold">VAT Number:</span>
            <span>BE1015549220</span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="font-semibold">Contact:</span>
            <a href="mailto:hello@litebite.ai" className="text-blue-600">hello@litebite.ai</a>
          </div>
        </div>

        <section>
          <h2 className="font-semibold mb-1">1. Introduction</h2>
          <p>
            Welcome to LiteBite, an AI-powered platform that helps you find restaurant meals aligned with your dietary preferences, health goals, and allergies. By using LiteBite, you agree to the following Privacy Policy and Terms of Use. Please read them carefully before using our services.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">2. Data Collection &amp; Use</h2>
          <p className="mb-2">We collect limited information to provide and improve LiteBite’s services:</p>
          <ul className="list-disc pl-6 mb-2">
            <li><span className="font-medium">Personal Data:</span> Name, email, phone number, payment details (for subscriptions), and optional location.</li>
            <li><span className="font-medium">Usage Data:</span> Search history, meal choices, preferences, and in-app interactions.</li>
            <li><span className="font-medium">Device Data:</span> Browser type, operating system, IP address, and device identifiers.</li>
          </ul>
          <p className="mb-2">Why we collect data:</p>
          <ul className="list-disc pl-6">
            <li>Provide personalized meal recommendations.</li>
            <li>Process subscriptions and payments (via secure providers such as Stripe).</li>
            <li>Improve app functionality and run analytics.</li>
            <li>Send service-related messages and, if you consent, marketing updates.</li>
          </ul>
          <p className="mt-2">We never sell personal data.</p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">3. AI-Generated Information Disclaimer</h2>
          <p>
            LiteBite uses AI (including OpenAI’s API) to estimate nutritional values, meal suitability, and allergy risks. While we aim for accuracy, LiteBite cannot guarantee that all AI-generated information is correct. Always verify information before making dietary decisions. We are not liable for health outcomes or meal choices based on AI outputs.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">4. Subscriptions &amp; Payments</h2>
          <ul className="list-disc pl-6">
            <li>LiteBite may offer free and paid subscription tiers.</li>
            <li>Payments are processed securely by third-party providers (e.g., Stripe).</li>
            <li>Subscriptions renew automatically unless cancelled.</li>
            <li>Refunds are handled according to applicable consumer protection laws.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold mb-1">5. User Responsibilities</h2>
          <ul className="list-disc pl-6">
            <li>Be at least 18 years old.</li>
            <li>Use LiteBite only for personal, lawful purposes.</li>
            <li>Not misuse or manipulate the AI system.</li>
            <li>Report inaccuracies or concerns to <a href="mailto:hello@litebite.ai" className="text-blue-600">hello@litebite.ai</a>.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold mb-1">6. User Rights</h2>
          <p className="mb-2">We comply with GDPR, CCPA, and global privacy frameworks. You may:</p>
          <ul className="list-disc pl-6">
            <li>Request a copy of your personal data.</li>
            <li>Correct or delete your data.</li>
            <li>Restrict or object to data processing.</li>
            <li>Opt-out of marketing communications.</li>
          </ul>
          <p className="mt-2">Contact <a href="mailto:hello@litebite.ai" className="text-blue-600">hello@litebite.ai</a> to exercise your rights.</p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">7. Cookies &amp; Tracking</h2>
          <p className="mb-2">We use:</p>
          <ul className="list-disc pl-6">
            <li><span className="font-medium">Essential Cookies</span> – to operate the app.</li>
            <li><span className="font-medium">Analytics Cookies</span> – to improve LiteBite.</li>
            <li><span className="font-medium">Marketing Cookies</span> – only with your consent.</li>
          </ul>
          <p className="mt-2">You can adjust cookie preferences in your device or browser settings.</p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">8. Third-Party Services</h2>
          <p className="mb-2">LiteBite integrates third parties such as:</p>
          <ul className="list-disc pl-6">
            <li>OpenAI (ChatGPT API) – to process queries.</li>
            <li>Stripe – for secure payments.</li>
            <li>Google Analytics &amp; Meta Pixel – for analytics and advertising.</li>
          </ul>
          <p>These providers handle your data under their own privacy policies.</p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">9. Restaurants &amp; Content Disclaimer</h2>
          <ul className="list-disc pl-6">
            <li>LiteBite is a platform only. We do not own or operate the restaurants listed.</li>
            <li>Prices, menus, and availability may change.</li>
            <li>Nutritional values are estimates.</li>
            <li>We are not responsible for restaurant actions, food quality, or accuracy of third-party information.</li>
          </ul>
          <p className="mt-2">Restaurant owners may contact <a href="mailto:hello@litebite.ai" className="text-blue-600">hello@litebite.ai</a> for listing concerns.</p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">10. Security &amp; Data Retention</h2>
          <p>
            We use industry-standard measures to protect data. If a breach occurs, affected users will be notified within 72 hours where required by law. We retain personal data only as long as necessary for services, legal, or business purposes.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">11. Limitation of Liability</h2>
          <p className="mb-2">LiteBite is provided “as is” without warranties. We are not liable for:</p>
          <ul className="list-disc pl-6">
            <li>Inaccurate or incomplete nutritional/dietary information.</li>
            <li>Health outcomes or dietary decisions made using the app.</li>
            <li>Restaurant pricing, menu, or service discrepancies.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold mb-1">12. Governing Law &amp; Dispute Resolution</h2>
          <p>
            This Policy and Terms are governed by the laws of Belgium. Disputes will first be resolved through good-faith negotiations. If unresolved, disputes may proceed to binding arbitration unless prohibited by local laws.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">13. Changes to this Policy</h2>
          <p>
            We may update this Privacy Policy &amp; Terms of Use from time to time. Updates will be posted here with a new effective date. Continued use of LiteBite means you accept the updated terms.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-1">14. Contact Us</h2>
          <p>
            For privacy, subscription, or legal inquiries: <a href="mailto:hello@litebite.ai" className="text-blue-600">hello@litebite.ai</a>
          </p>
        </section>
      </div>
    </div>
  );
}
