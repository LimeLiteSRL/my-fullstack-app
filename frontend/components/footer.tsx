"use client";

import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[#C4CCFF] text-gray-900 py-8 sm:py-12 w-full">
      <div className="w-full max-w-[1280px] mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
          {/* Logo and Description */}
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Image
                src="/images/Full_logo.png"
                alt="LiteBite Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold">LiteBite.ai</span>
            </div>
            <p className="text-gray-700 leading-relaxed max-w-md mx-auto">
              AI-powered platform helping you make healthier food choices when dining out. Find restaurant meals that fit your dietary needs and preferences.
            </p>
            <div className="flex justify-center gap-3">
              <Link 
                href="https://www.instagram.com/litebite.ai/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#4E56D3] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#4046C7] transition-colors"
              >
                <Image src="/images/instagram.png" alt="Instagram" width={20} height={20} className="w-5 h-5 filter brightness-0 invert" />
              </Link>
              <Link 
                href="https://x.com/litebite_ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#4E56D3] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#4046C7] transition-colors"
              >
                <Image src="/images/x.png" alt="X (Twitter)" width={20} height={20} className="w-5 h-5 filter brightness-0 invert" />
              </Link>
              <Link 
                href="https://www.facebook.com/people/LiteBiteai/61564284326059/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#4E56D3] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#4046C7] transition-colors"
              >
                <Image src="/images/facebook.png" alt="Facebook" width={20} height={20} className="w-5 h-5 filter brightness-0 invert" />
              </Link>
              <Link 
                href="https://www.linkedin.com/company/104949177/admin/dashboard/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#4E56D3] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#4046C7] transition-colors"
              >
                <Image src="/images/linkedin.png" alt="LinkedIn" width={20} height={20} className="w-5 h-5 filter brightness-0 invert" />
              </Link>
            </div>
          </div>
          
          {/* Company Section */}
          <div className="space-y-4 text-center">
            <h3 className="font-bold text-lg">Company</h3>
            <ul className="space-y-2 text-gray-700">
              <li><Link href="#about" className="hover:text-gray-900 transition-colors">About Us</Link></li>
              <li><Link href="#contact" className="hover:text-gray-900 transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          {/* Legal Section */}
          <div className="space-y-4 text-center">
            <h3 className="font-bold text-lg">Legal</h3>
            <ul className="space-y-2 text-gray-700">
              <li>
                <Link href="https://litebite.ai/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Newsletter Section */}
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-center">Stay in the loop</h3>
            <p className="text-gray-700 text-sm leading-relaxed text-center">
            Get healthy eating tips, recipes, and exclusive offers—straight in your inbox
            </p>
            <div className="flex justify-center">
              <div className="w-full max-w-[420px]">
                <iframe
                  src="https://preview.mailerlite.io/forms/85801/163179695764931666/share"
                  width="100%"
                  height="200"
                  frameBorder="0"
                  className="rounded-lg border-0"
                  title="Newsletter Subscription"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-400 mt-8 pt-6 flex items-center justify-center text-gray-600">
          <p className="text-sm text-center">© 2025 LiteBite.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


