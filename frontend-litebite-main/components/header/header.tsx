"use client";

import { Button } from "@/components/ui/button";
import LocationBox from "@/components/filters-search/location-box";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import useAuthStore from "@/libs/store/auth-store";
import useProfileStore from "@/libs/store/profile-store";
import { Routes } from "@/libs/routes";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import { useEffect } from "react";
import { queryClient } from "@/libs/query-client";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Authentication state
  const { token } = useAuthStore();
  const { user, setUser } = useProfileStore();
  const isAuthenticated = !!token;
  
  // Fetch user profile when authenticated
  const timezoneOffsetInMinutes = new Date().getTimezoneOffset();
  const hours = Math.floor(Math.abs(timezoneOffsetInMinutes) / 60);
  const minutes = Math.abs(timezoneOffsetInMinutes) % 60;
  const sign = timezoneOffsetInMinutes <= 0 ? "+" : "-";
  const timezoneOffset = `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  
  const { data: profileData } = usersHook.useQueryUserProfile({
    queries: {
      timezoneOffset: timezoneOffset,
    },
    enabled: isAuthenticated && !!token, // Only fetch when authenticated AND has token
  });
  
  // Update profile store when data is fetched
  useEffect(() => {
    if (profileData?.user && isAuthenticated) {
      setUser(profileData.user);
    }
  }, [profileData, isAuthenticated, setUser]);
  
  // Invalidate profile cache when token changes (login/logout)
  useEffect(() => {
    if (isAuthenticated && token) {
      // Invalidate profile queries to force fresh data
      queryClient.invalidateQueries(['queryUserProfile']);
    } else if (!token) {
      // Clear profile cache when no token
      queryClient.removeQueries(['queryUserProfile']);
      setUser(undefined);
    }
  }, [token, isAuthenticated, setUser]); // Depend on both token and isAuthenticated
  


  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Profile Picture Component
  const ProfilePicture = () => {
    const profileImage = user?.profilePicture;
    const hasProfileImage = profileImage && profileImage.trim() !== '';
    
    return (
      <Link href={Routes.Profile} className="flex items-center" title="Go to Profile">
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#4E56D3] transition-colors">
          <Image
            src={hasProfileImage ? profileImage : "/images/Profile_icon.png"}
            alt="Profile"
            width={40}
            height={40}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to default icon if profile image fails to load
              e.currentTarget.src = "/images/Profile_icon.png";
            }}
          />
        </div>
      </Link>
    );
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="w-full max-w-[1460px] px-4 sm:px-6 mx-auto relative">
        <div className="flex items-center h-16">
          {/* Logo Section */}  
          <div className="flex items-center gap-3">
            <Image
              src="/images/Full_logo.png"
              alt="LiteBite Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-lg sm:text-xl lg:text-xl font-bold text-gray-900">LiteBite.ai</span>
          </div>
          
          {/* Center Menu - Hidden at <=1100px (mobile/tablet), visible above */}
          <div className="hidden min-[1101px]:flex items-center space-x-8 lg:space-x-10 whitespace-nowrap absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Link 
                href="/" 
                className={`font-medium transition-colors duration-200 ${
                  pathname === '/' 
                    ? 'text-[#4E56D3]' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Home
              </Link>
              <Link 
                href="/app" 
                className={`font-medium transition-colors duration-200 ${
                  pathname === '/app'
                    ? 'text-[#4E56D3]' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                App
              </Link>
              <Link 
                href="/ai" 
                className={`font-medium transition-colors duration-200 whitespace-nowrap ${
                  pathname === '/ai'
                    ? 'text-[#4E56D3]' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Coach-Ai
              </Link>
              <Link href="/#about" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200">About Us</Link>
              <Link href="/#contact" className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200">Contact Us</Link>
            </div>
          
          {/* Spacer for right side */}
          <div className="flex-1"></div>
          
          {/* CTA Buttons - Hidden at <=1100px, visible above */}
          <div className="hidden min-[1101px]:flex items-center gap-3">
            {/* Location Button */}
            <LocationBox />
            
            {/* Conditional Authentication Button/Profile */}
            {isAuthenticated ? (
              <ProfilePicture />
            ) : (
              <Button asChild className="bg-[#4E56D3] hover:bg-[#4046C7] text-white font-medium rounded-full px-6 py-2.5 shadow-sm transition-all duration-200 hover:shadow-md">
                <Link href="/login">
                  Signup/Login
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button - Visible at <=1100px */}
          <div className="min-[1101px]:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="min-[1101px]:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMobileMenu}
          />
          
          {/* Mobile Menu */}
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-3">
                <Link 
                  href="/" 
                  onClick={closeMobileMenu}
                  className={`block py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    pathname === '/' 
                      ? 'text-[#4E56D3] bg-[#4E56D3]/10' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  href="/app" 
                  onClick={closeMobileMenu}
                  className={`block py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    pathname === '/app' 
                      ? 'text-[#4E56D3] bg-[#4E56D3]/10' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  App
                </Link>
                <Link 
                  href="/ai" 
                  onClick={closeMobileMenu}
                  className={`block py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                    pathname === '/ai' 
                      ? 'text-[#4E56D3] bg-[#4E56D3]/10' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Coach-Ai
                </Link>
                <Link 
                  href="/#about" 
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors duration-200"
                >
                  About Us
                </Link>
                <Link 
                  href="/#contact" 
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-4" />

              {/* Mobile CTA Buttons */}
              <div className="space-y-3">
                {/* Location Button */}
                <Button className="w-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium rounded-xl py-3 shadow-sm transition-all duration-200 hover:shadow-md">
                  <svg className="w-5 h-5 text-[#4E56D3] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  Set Location
                </Button>
                
                {/* Conditional Authentication Button/Profile */}
                {isAuthenticated ? (
                  <Link 
                    href={Routes.Profile} 
                    onClick={closeMobileMenu}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl py-3 shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                      <Image
                        src={user?.profilePicture && user.profilePicture.trim() !== '' ? user.profilePicture : "/images/Profile_icon.png"}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to default icon if profile image fails to load
                          e.currentTarget.src = "/images/Profile_icon.png";
                        }}
                      />
                    </div>
                    Profile
                  </Link>
                ) : (
                  <Button asChild className="w-full bg-[#4E56D3] hover:bg-[#4046C7] text-white font-medium rounded-full py-3 shadow-sm transition-all duration-200 hover:shadow-md">
                    <Link href="/login" onClick={closeMobileMenu}>
                      Signup/Login
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
