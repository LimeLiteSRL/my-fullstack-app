"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Clock, Users, Zap, Heart, Shield, Award } from "lucide-react";
import Image from "next/image";
import Footer from "@/components/footer";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useAddToProfile from "@/libs/hooks/use-add-to-profile";
import { useRouter } from "next/navigation";
import { BASE_API_URL, test_lat, test_lng } from "@/config";
import Header from "@/components/header/header";
import BottomNavigation from "@/components/bottom-navigation";
import SearchPopup from "@/components/search-popup";
import { Routes } from "@/libs/routes";
import { Skeleton } from "@/components/ui/skeleton";

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

// Text truncation component
const TruncatedText = ({ text, maxLength = 50 }: { text: string; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (text.length <= maxLength) {
    return <span>{text}</span>;
  }
  
  return (
    <span>
      {isExpanded ? text : `${text.slice(0, maxLength)}...`}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-600 hover:text-blue-800 ml-1 text-sm underline"
      >
        {isExpanded ? 'Show less' : 'Show more'}
      </button>
    </span>
  );
};

// Skeleton Components for Landing Page
const MealCardSkeleton = () => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white rounded-2xl border border-gray-100 relative w-[280px] min-[420px]:w-[191px] md:w-auto lg:w-full h-[337px] md:h-[400px]">
    <div className="relative h-32 md:h-48 bg-gray-50">
      <Skeleton className="w-full h-full" />
    </div>
    <CardContent className="p-3 md:p-4 pb-12 md:pb-16">
      {/* Name section skeleton with fixed height */}
      <div className="h-10 md:h-12 mb-1">
        <Skeleton className="h-4 md:h-6 w-3/4" />
      </div>
      
      {/* Price section skeleton with fixed height */}
      <div className="h-6 md:h-8 mb-1 md:mb-2">
        <Skeleton className="h-4 md:h-6 w-16" />
      </div>
      
      {/* Nutrition badges skeleton with fixed height */}
      <div className="h-16 mb-3 md:mb-2">
        {/* Mobile: 2x2 grid skeleton */}
        <div className="grid grid-cols-2 gap-1.5 md:hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-1 bg-gray-50 rounded-lg px-1.5 py-1">
              <Skeleton className="w-4 h-4 rounded-full" />
              <div className="leading-tight">
                <Skeleton className="w-6 h-2 mb-1" />
                <Skeleton className="w-5 h-3" />
              </div>
            </div>
          ))}
        </div>
        
        {/* Desktop: 1x4 row skeleton */}
        <div className="hidden md:flex justify-between gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-1 bg-gray-50 rounded-lg px-1.5 py-1 flex-1">
              <Skeleton className="w-5 h-5 rounded-full" />
              <div className="leading-tight">
                <Skeleton className="w-8 h-3 mb-1" />
                <Skeleton className="w-6 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
    
    {/* Action buttons skeleton - Always at the same position */}
    <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 flex gap-2" style={{ height: '32px' }}>
      <Skeleton className="flex-1 h-8 md:h-10 rounded-lg" />
      <Skeleton className="flex-1 h-8 md:h-10 rounded-lg" />
    </div>
  </Card>
);

const RestaurantCardSkeleton = () => (
  <Card className="aspect-square p-4 text-center hover:shadow-lg transition-shadow cursor-pointer bg-white rounded-2xl border border-gray-100 flex flex-col justify-center">
    <div className="w-full flex-1 flex items-center justify-center mb-2">
      <Skeleton className="w-28 h-28 rounded-lg" />
    </div>
    <Skeleton className="h-4 w-20 mx-auto" />
  </Card>
);

const MobileRestaurantCardSkeleton = () => (
  <Card className="aspect-square p-4 text-center hover:shadow-lg transition-shadow cursor-pointer bg-white rounded-2xl border border-gray-100 flex flex-col justify-center min-w-[100px] flex-shrink-0">
    <div className="w-full flex-1 flex items-center justify-center mb-2">
      <Skeleton className="w-16 h-16 rounded-lg" />
    </div>
    <Skeleton className="h-3 w-16 mx-auto" />
  </Card>
);

const FeatureCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 text-left hover:shadow-lg transition-all duration-500">
    <Skeleton className="w-12 h-12 rounded-lg mb-4" />
    <Skeleton className="h-6 w-3/4 mb-4" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);

const MobileFeatureCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 shadow-lg">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-5 w-3/4 mb-1" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  </div>
);

// Meal card component with expandable text and perfect alignment
const MealCard = ({ 
  meal, 
  index, 
  imageFallback, 
  firstCompareId, 
  handleCompareClick 
}: { 
  meal: any; 
  index: number; 
  imageFallback: string;
  firstCompareId: string | null;
  handleCompareClick: (mealId: string, mealName?: string) => void;
}) => {
  const [isNameExpanded, setIsNameExpanded] = useState(false);
  const { handleAddToProfile } = useAddToProfile();
  const nameLength = meal?.name?.length || 0;
  const needsTruncation = nameLength > 35;

  return (
    <Card 
      className={`overflow-hidden hover:shadow-lg transition-shadow bg-white rounded-2xl border border-gray-100 relative ${index >= 2 ? 'hidden md:block' : ''} w-[280px] min-[420px]:w-[191px] md:w-auto lg:w-full h-[337px] md:h-[400px] md:min-h-[400px]`} 
      style={{ 
        ...(isNameExpanded && { height: 'auto' })
      }}
    >
      <div className="relative h-32 md:h-48 bg-gray-50">
        <Image
          src={meal.image || imageFallback}
          alt={meal.name}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover"
        />
        {/* Restaurant Image */}
        {meal.restaurant?.heroUrl && (
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-md">
            <Image
              src={meal.restaurant.heroUrl}
              alt={meal.restaurant.name || "Restaurant"}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      <CardContent className="p-3 md:p-4 pb-12 md:pb-16">
        {/* Name section height collapses/expands */}
        <div className={`${isNameExpanded ? 'h-auto' : 'h-10 md:h-12'} mb-1`}>
          <h3 className="font-semibold text-gray-900 text-base md:text-lg">
            {needsTruncation ? (
              <span>
                {isNameExpanded ? meal?.name : `${meal?.name?.slice(0, 35)}...`}
                <button
                  onClick={() => setIsNameExpanded(!isNameExpanded)}
                  className="text-blue-600 hover:text-blue-800 ml-1 text-sm underline"
                >
                  {isNameExpanded ? 'Show less' : 'Show more'}
                </button>
              </span>
            ) : (
              meal?.name
            )}
          </h3>
        </div>
        
        {/* Price section remains fixed height */}
        <div className="h-6 md:h-8 mb-1 md:mb-2">
          <p className="text-base md:text-lg font-bold text-[#4E56D3]">{meal ? `${(meal.price ?? 0) / 100}$` : ""}</p>
        </div>
        
        {/* Nutrition badges section collapses/expands */}
        <div className={`${isNameExpanded ? 'h-auto' : 'h-16 md:h-16'} mb-3 md:mb-6`}>
          {/* Mobile: 2x2 grid layout */}
          <div className="grid grid-cols-2 gap-1.5 md:hidden">
            <div className="flex items-center gap-1 bg-green-50 rounded-lg px-1.5 py-1">
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                <Image src="/images/Fat.png" alt="Fat" width={8} height={8} className="w-2 h-2" />
              </div>
              <div className="leading-tight">
                <div className="text-[8px] text-gray-600">Fat</div>
                <div className="text-[10px] font-extrabold text-gray-900">{meal?.nutritionalInformation?.totalFatGrams ?? "-"}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 rounded-lg px-1.5 py-1">
              <div className="w-4 h-4 rounded-full bg-yellow-100 flex items-center justify-center">
                <Image src="/images/Cal.png" alt="Calories" width={8} height={8} className="w-2 h-2" />
              </div>
              <div className="leading-tight">
                <div className="text-[8px] text-gray-600">cal</div>
                <div className="text-[10px] font-extrabold text-gray-900">{meal?.nutritionalInformation?.caloriesKcal ?? "-"}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-green-50 rounded-lg px-1.5 py-1">
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                <Image src="/images/Prot.png" alt="Protein" width={8} height={8} className="w-2 h-2" />
              </div>
              <div className="leading-tight">
                <div className="text-[8px] text-gray-600">Prot</div>
                <div className="text-[10px] font-extrabold text-gray-900">{meal?.nutritionalInformation?.proteinGrams ?? "-"}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 rounded-lg px-1.5 py-1">
              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Image src="/images/Carb.png" alt="Carbohydrates" width={8} height={8} className="w-2 h-2" />
              </div>
              <div className="leading-tight">
                <div className="text-[8px] text-gray-600">Carb</div>
                <div className="text-[10px] font-extrabold text-gray-900">{meal?.nutritionalInformation?.totalCarbsGrams ?? "-"}</div>
              </div>
            </div>
          </div>
          
          {/* Desktop: 1x4 row layout */}
          <div className="hidden md:flex justify-between gap-1.5">
            <div className="flex items-center gap-1 bg-green-50 rounded-lg px-1.5 py-1 flex-1">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <Image src="/images/Fat.png" alt="Fat" width={10} height={10} className="w-2.5 h-2.5" />
              </div>
              <div className="leading-tight">
                <div className="text-[9px] text-gray-600">Fat</div>
                <div className="text-xs font-extrabold text-gray-900">{meal?.nutritionalInformation?.totalFatGrams ?? "-"}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 rounded-lg px-1.5 py-1 flex-1">
              <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center">
                <Image src="/images/Cal.png" alt="Calories" width={10} height={10} className="w-2.5 h-2.5" />
              </div>
              <div className="leading-tight">
                <div className="text-[9px] text-gray-600">cal</div>
                <div className="text-xs font-extrabold text-gray-900">{meal?.nutritionalInformation?.caloriesKcal ?? "-"}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-green-50 rounded-lg px-1.5 py-1 flex-1">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <Image src="/images/Prot.png" alt="Protein" width={10} height={10} className="w-2.5 h-2.5" />
              </div>
              <div className="leading-tight">
                <div className="text-[9px] text-gray-600">Prot</div>
                <div className="text-xs font-extrabold text-gray-900">{meal?.nutritionalInformation?.proteinGrams ?? "-"}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 rounded-lg px-1.5 py-1 flex-1">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <Image src="/images/Carb.png" alt="Carbohydrates" width={10} height={10} className="w-2.5 h-2.5" />
              </div>
              <div className="leading-tight">
                <div className="text-[9px] text-gray-600">Carb</div>
                <div className="text-xs font-extrabold text-gray-900">{meal?.nutritionalInformation?.totalCarbsGrams ?? "-"}</div>
              </div>
            </div>
          </div>
        </div>
        

      </CardContent>
      
      {/* Action buttons */}
      <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 flex gap-2" style={{ height: '32px' }}>
        <Button onClick={() => handleAddToProfile(meal?._id)} className="flex-1 bg-[#4E56D3] hover:bg-[#4046C7] text-white rounded-lg h-8 md:h-10 text-sm md:text-base">
          Add
        </Button>
        <Button onClick={() => handleCompareClick(meal?._id, meal?.name)} variant="ghost" className="flex-1 text-[#4E56D3] hover:bg-gray-50 rounded-lg border-none h-8 md:h-10 text-sm md:text-base">
          {firstCompareId === meal?._id ? "Selected" : "Compare"}
        </Button>
      </div>
    </Card>
  );
};

// Hero Section Component
const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState({
    calorie: "",
    diet: "",
    allergies: ""
  });
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);

  const handleSearchInputClick = (field: 'calorie' | 'diet' | 'allergies') => {
    setIsSearchPopupOpen(true);
  };

  const handleSearchQueryUpdate = (newQuery: { calorie: string; diet: string; allergies: string }) => {
    setSearchQuery(newQuery);
  };

  return (
    <section className="relative bg-[#4E56D3] w-full pt-16 pb-0 overflow-hidden">
      <div className="min-h-[60vh] lg:min-h-[50vh] xl:min-h-[45vh] flex flex-col justify-between">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-6 py-8 lg:py-8 mt-[64px]"> 
          <div className="max-w-[1280px] mx-auto text-center text-white w-full">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 lg:mb-6 leading-tight">
              Healthy choices made
              <br />
              <span className="text-[#CEFF65]">easy with AI</span>
            </h1>
            
            <p className="text-base sm:text-xl md:text-2xl lg:text-2xl mb-8 lg:mb-8 opacity-90 max-w-4xl mx-auto font-light">
            Discover restaurant meals that fit your calories and diet with AI, making it easier to reach your health goals
            </p>
            
            {/* Search Bar - always visible */}
            <div className="block relative max-w-4xl mx-auto mb-8 lg:mb-6">
              {/* Desktop Search Bar - 3 fields */}
              <div className="hidden sm:flex bg-white rounded-full p-3 shadow-2xl">
                <div className="flex-1 flex items-center">
                  <Input
                    type="text"
                    placeholder="Calorie"
                    value={searchQuery.calorie}
                    readOnly
                    onClick={() => handleSearchInputClick('calorie')}
                    className="flex-1 border-none text-black placeholder:text-gray-400 focus-visible:ring-0 bg-transparent rounded-l-full cursor-pointer hover:bg-gray-50 transition-colors"
                  />
                  <div className="w-px bg-gray-200 mx-2 h-6"></div>
                  <Input
                    type="text"
                    placeholder="Diet"
                    value={searchQuery.diet}
                    readOnly
                    onClick={() => handleSearchInputClick('diet')}
                    className="flex-1 border-none text-black placeholder:text-gray-400 focus-visible:ring-0 bg-transparent cursor-pointer hover:bg-gray-50 transition-colors"
                  />
                  <div className="w-px bg-gray-200 mx-2 h-6"></div>
                  <Input
                    type="text"
                    placeholder="Allergies"
                    value=""
                    readOnly
                    onClick={() => setIsSearchPopupOpen(true)}
                    className="flex-1 border-none text-black placeholder:text-gray-400 focus-visible:ring-0 bg-transparent rounded-r-full cursor-pointer hover:bg-gray-50 transition-colors"
                  />
                </div>
                <Button 
                  className="rounded-full px-6 py-3 bg-[#4E56D3] text-white hover:bg-[#4046C7] ml-2"
                  onClick={() => setIsSearchPopupOpen(true)}
                >
                  <Image
                    src="/images/Setting.png"
                    alt="Search"
                    width={20}
                    height={20}
                    className="w-5 h-5 filter brightness-0 invert"
                  />
                </Button>
              </div>

              {/* Mobile Search Bar - 2 fields */}
              <div className="sm:hidden bg-white p-3 shadow-2xl" style={{borderRadius: '40px'}}>
                <div className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Calorie"
                    value={searchQuery.calorie}
                    readOnly
                    onClick={() => handleSearchInputClick('calorie')}
                    className="flex-1 border-none text-black placeholder:text-gray-400 focus-visible:ring-0 bg-transparent cursor-pointer hover:bg-gray-50 transition-colors"
                  />
                  <div className="w-px bg-gray-200 mx-2 h-6"></div>
                  <Input
                    type="text"
                    placeholder="Diet"
                    value={searchQuery.diet}
                    readOnly
                    onClick={() => handleSearchInputClick('diet')}
                    className="flex-1 border-none text-black placeholder:text-gray-400 focus-visible:ring-0 bg-transparent cursor-pointer hover:bg-gray-50 transition-colors"
                  />
                  <Button 
                    className="rounded-full p-3 bg-[#4E56D3] text-white hover:bg-[#4046C7] ml-2"
                    onClick={() => setIsSearchPopupOpen(true)}
                  >
                    <Image
                      src="/images/Setting.png"
                      alt="Search"
                      width={20}
                      height={20}
                      className="w-5 h-5 filter brightness-0 invert"
                    />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Location Message - Left aligned on mobile */}
            <div className="flex items-center justify-start sm:justify-center gap-2 text-white/80 mb-8 lg:mb-6 px-0 sm:px-0">
              <MapPin className="w-5 h-5 text-[#CEFF65] flex-shrink-0" />
              <p className="text-base sm:text-lg md:text-lg text-left sm:text-center">
                Available in <span className="text-[#CEFF65] font-semibold">New York</span> and expanding to more cities soon!
              </p>
            </div>
          </div>
        </div>
        
        {/* Hero Food Image - Rice Bowl with Egg - Fixed at bottom */}
        <div className="flex justify-center pb-0">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
            <Image
              src="/images/egg.png"
              alt="Delicious rice bowl with fried egg and vegetables"
              width={500}
              height={400}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Search Popup */}
      <SearchPopup
        isOpen={isSearchPopupOpen}
        onClose={() => setIsSearchPopupOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchQueryUpdate}
      />
    </section>
  );
};

// Products Section Component
const ProductsSection = () => {
  const products = [
    {
      icon: (
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-6">
          <svg className="w-6 h-6 text-[#4E56D3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      ),
      title: "AI-Powered Meal Finder",
      description: "Discover restaurant dishes tailored to your calorie goals, dietary preferences, and allergy needs."
    },
    {
      icon: (
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-6">
          <svg className="w-6 h-6 text-[#4E56D3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      ),
      title: "Personalized Nutrition Dashboard",
      description: "Track your eating habits and progress with an easy-to-use, customized dashboard."
    },
    {
      icon: (
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-6">
          <svg className="w-6 h-6 text-[#4E56D3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      ),
      title: "Smart Food Logging & Recipes",
      description: "Use AI to log your meals effortlessly and get personalized healthy recipe suggestions."
    }
  ];

  return (
    <section className="py-8 sm:py-16 bg-gray-50 w-full mb-[-40px]">
      <div className="w-full max-w-[1280px] mx-auto mt-[-30px]">
        <div className="text-center mb-10 relative hidden sm:block">
          <div className="w-screen relative left-1/2 transform -translate-x-1/2">
            <div className="flex items-center mb-6">
              <div className="flex-1 h-px bg-gray-400"></div>
              <div className="px-8">
                <h2 className="font-medium text-black mb-4 leading-tight tracking-wide md:text-3xl lg:text-4xl" style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
              Discover How We Help
              <br />
              You Eat Smarter
            </h2>
              </div>
              <div className="flex-1 h-px bg-gray-400"></div>
            </div>
          </div>
          <p className="text-xl md:text-lg lg:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-light">
            Our AI-powered platform helps you make healthier food choices without sacrificing taste or convenience when dining out.
          </p>
        </div>
      
        <div className="grid md:grid-cols-3 gap-8 lg:gap-5 mt-0 sm:mt-0 w-full max-w-[1280px] mx-auto"> 
          {products.map((product, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 sm:p-8 md:p-6 lg:p-8 shadow-sm border border-gray-100 text-left hover:shadow-lg transition-all duration-500">
              {product.icon}
              <h3 className="text-xl md:text-lg lg:text-xl font-bold text-[#4E56D3] mb-4 leading-tight">
                {product.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-base md:text-sm lg:text-base">
                {product.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
    );
};

// Discover Section - Mobile Only
const DiscoverSection = () => {
  return (
    <section className="py-8 bg-white w-full sm:hidden">
      <div className="w-full max-w-[1280px] mx-auto px-6 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-6 leading-tight">
          Discover How We Help You Eat Smarter
        </h2>
        <p className="text-sm text-gray-600 max-w-4xl mx-auto leading-relaxed">
          Our AI-powered platform helps you make healthier food choices without sacrificing taste or convenience when dining out.
        </p>
      </div>
    </section>
  );
};
  
// Meal Categories Section
const MealCategoriesSection = () => {
  const categories = [
    { name: "Low Calorie meals", count: "View more", emoji: "🥗" },
    { name: "Popular restaurants", count: "", emoji: "" },
    { name: "Low Carb meals", count: "View more", emoji: "🥩" },
    { name: "High Protein meals", count: "View more", emoji: "🍗" }
  ];
  
  // Compare functionality state
  const [firstCompareId, setFirstCompareId] = useState<string | null>(null);
  const [firstCompareName, setFirstCompareName] = useState<string | null>(null);
  const [compareBanner, setCompareBanner] = useState<string | null>(null);
  const router = useRouter();

  const handleCompareClick = async (mealId: string, mealName?: string) => {
    if (!firstCompareId) {
      setFirstCompareId(mealId);
      setFirstCompareName(mealName || null);
      setCompareBanner("Select one more item to compare");
      return;
    }
    if (firstCompareId === mealId) {
      // ignore same click; keep waiting for a different item
      setCompareBanner("Please select a different item to compare");
      return;
    }
    try {
      const params = new URLSearchParams({ foodIds: `${firstCompareId},${mealId}` });
      const url = `${BASE_API_URL}/foods/compare?${params.toString()}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        // still navigate, backend page can fetch again; but provide quick feedback
        console.error("Compare request failed", await res.text());
      }
      router.push(`${Routes.Compare}/result?first=${firstCompareId}&last=${mealId}`);
    } catch (err) {
      console.error("Compare error", err);
      router.push(`${Routes.Compare}/result?first=${firstCompareId}&last=${mealId}`);
    } finally {
      setFirstCompareId(null);
      setFirstCompareName(null);
      setCompareBanner(null);
    }
  };

  const restaurants = [
    { name: "McDonald's", logo: "/images/MacDonalds.jpg" },
    { name: "Starbucks", logo: "/images/starbucks.jpg" },
    { name: "Subway", logo: "/images/subway.jpg" },
    { name: "El Pollo Loco", logo: "https://s3.eu-north-1.amazonaws.com/litebite.cloud/production/static/others/ep.webp" },
    { name: "Chick-fil-A", logo: "/images/chickfil.jpg" },
    { name: "Panera Bread", logo: "/images/paner bread.jpg" }
  ];

  const meals = [
    {
      name: "Grilled Chicken Salad",
      restaurant: "Healthy Bites",
      calories: "320 cal",
      carbs: "12g carbs",
      protein: "28g protein",
      rating: 4.8,
      price: "$12.99",
      image: "🥗"
    },
    {
      name: "Quinoa Buddha Bowl",
      restaurant: "Green Garden",
      calories: "380 cal",
      carbs: "45g carbs", 
      protein: "15g protein",
      rating: 4.6,
      price: "$14.50",
      image: "🥙"
    },
    {
      name: "Salmon Poke Bowl",
      restaurant: "Ocean Fresh",
      calories: "420 cal",
      carbs: "38g carbs",
      protein: "32g protein", 
      rating: 4.9,
      price: "$16.99",
      image: "🍣"
    },
    {
      name: "Veggie Wrap",
      restaurant: "Plant Power",
      calories: "290 cal",
      carbs: "35g carbs",
      protein: "12g protein",
      rating: 4.4,
      price: "$9.99",
      image: "🌯"
    }
  ];

  // Low Calorie: fetch specified IDs
  const lowCalorieIds: string[] = useMemo(() => [
    "67a570f097a7c5c68ca43a41",
    "678fc81ec71777bd0d2adc80",
    "6791a2c6d862800917b46e94",
    "67a03e0d5cc49db4b87f8d4b",
    "679f2de268e49446b9eb7b83",
    "67a1a659a6c6484e5f72af6f",
  ], []);
  const [lowCalMeals, setLowCalMeals] = useState<any[]>([]);
  const [lcLoading, setLcLoading] = useState(false);
  const [lcError, setLcError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLowCal = async () => {
      setLcLoading(true);
      setLcError(null);
      try {
        const results = await Promise.allSettled(
          lowCalorieIds.map(async (id) => {
            const res = await fetch(`${BASE_API_URL}/foods/${id}`);
            if (!res.ok) throw new Error(`Failed ${id}`);
            const json = await res.json();
            const meal = json?.data;
            
            // Fetch restaurant information for this meal
            try {
              const restaurantsRes = await fetch(`${BASE_API_URL}/foods/${id}/restaurants`);
              if (restaurantsRes.ok) {
                const restaurantsData = await restaurantsRes.json();
                const restaurants = restaurantsData?.data;
                
                if (restaurants && restaurants.length > 0) {
                  const restaurantId = restaurants[0]._id;
                  const restaurantRes = await fetch(`${BASE_API_URL}/restaurants/${restaurantId}`);
                  if (restaurantRes.ok) {
                    const restaurantData = await restaurantRes.json();
                    const restaurant = restaurantData?.data;
                    
                    // Calculate distance from user location to restaurant
                    let distance: number | undefined;
                    if (restaurant?.location?.coordinates && Array.isArray(restaurant.location.coordinates) && restaurant.location.coordinates.length >= 2) {
                      const [restaurantLng, restaurantLat] = restaurant.location.coordinates;
                      distance = calculateDistance(test_lat, test_lng, restaurantLat, restaurantLng);

                    }

                    // Add restaurant information to the meal
                    meal.restaurant = {
                      _id: restaurantId,
                      name: restaurant?.name || restaurants[0].name,
                      heroUrl: restaurant?.heroUrl,
                      distance: distance
                    };
                  }
                }
              }
            } catch (restaurantError) {
              console.error('Error fetching restaurant info:', restaurantError);
            }
            
            return meal;
          })
        );
        const items = results
          .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled" && r.value)
          .map((r) => r.value);
        setLowCalMeals(items);
      } catch (e: any) {
        setLcError(e?.message || "Failed to load");
      } finally {
        setLcLoading(false);
      }
    };
    fetchLowCal();
  }, [lowCalorieIds]);

  // Low Carb: fetch specified IDs
  const lowCarbIds: string[] = useMemo(() => [
    "67954f47337392f38b4c3f3e",
    "6796de1fcbc62d2ff2bebb7e",
    "679c9312f1f1124b2a24c0656",
    "679010dcc71777bd0d2b1583",
    "67954f34337392f38b4c3f2c",
  ], []);
  const [lowCarbMeals, setLowCarbMeals] = useState<any[]>([]);
  const [lcCarbLoading, setLcCarbLoading] = useState(false);
  const [lcCarbError, setLcCarbError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLowCarb = async () => {
      setLcCarbLoading(true);
      setLcCarbError(null);
      try {
        const results = await Promise.allSettled(
          lowCarbIds.map(async (id) => {
            const res = await fetch(`${BASE_API_URL}/foods/${id}`);
            if (!res.ok) throw new Error(`Failed ${id}`);
            const json = await res.json();
            const meal = json?.data;
            
            // Fetch restaurant information for this meal
            try {
              const restaurantsRes = await fetch(`${BASE_API_URL}/foods/${id}/restaurants`);
              if (restaurantsRes.ok) {
                const restaurantsData = await restaurantsRes.json();
                const restaurants = restaurantsData?.data;
                
                if (restaurants && restaurants.length > 0) {
                  const restaurantId = restaurants[0]._id;
                  const restaurantRes = await fetch(`${BASE_API_URL}/restaurants/${restaurantId}`);
                  if (restaurantRes.ok) {
                    const restaurantData = await restaurantRes.json();
                    const restaurant = restaurantData?.data;
                    
                    // Calculate distance from user location to restaurant
                    let distance: number | undefined;
                    if (restaurant?.location?.coordinates && Array.isArray(restaurant.location.coordinates) && restaurant.location.coordinates.length >= 2) {
                      const [restaurantLng, restaurantLat] = restaurant.location.coordinates;
                      distance = calculateDistance(test_lat, test_lng, restaurantLat, restaurantLng);

                    }

                    // Add restaurant information to the meal
                    meal.restaurant = {
                      _id: restaurantId,
                      name: restaurant?.name || restaurants[0].name,
                      heroUrl: restaurant?.heroUrl,
                      distance: distance
                    };
                  }
                }
              }
            } catch (restaurantError) {
              console.error('Error fetching restaurant info:', restaurantError);
            }
            
            return meal;
          })
        );
        const items = results
          .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled" && r.value)
          .map((r) => r.value);
        setLowCarbMeals(items);
      } catch (e: any) {
        setLcCarbError(e?.message || "Failed to load");
      } finally {
        setLcCarbLoading(false);
      }
    };
    fetchLowCarb();
  }, [lowCarbIds]);

  // High Protein: fetch specific food IDs from backend and render
  const highProteinIds: string[] = useMemo(() => [
    "6799aa255cd267035b5342eb",
    "6799aa305cd267035b5342f7",
    "67a13a77a6c6484e5f724b20",
    "67a0406d5cc49db4b87f8faf",
    "6791a36ed862800917b46f30",
    "679d347df94d1f4add527a5e",
  ], []);
  const [highProteinMeals, setHighProteinMeals] = useState<any[]>([]);
  const [hpLoading, setHpLoading] = useState(false);
  const [hpError, setHpError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHP = async () => {
      setHpLoading(true);
      setHpError(null);
      try {
        const results = await Promise.allSettled(
          highProteinIds.map(async (id) => {
            const res = await fetch(`${BASE_API_URL}/foods/${id}`);
            if (!res.ok) throw new Error(`Failed ${id}`);
            const json = await res.json();
            const meal = json?.data;
            
            // Fetch restaurant information for this meal
            try {
              const restaurantsRes = await fetch(`${BASE_API_URL}/foods/${id}/restaurants`);
              if (restaurantsRes.ok) {
                const restaurantsData = await restaurantsRes.json();
                const restaurants = restaurantsData?.data;
                
                if (restaurants && restaurants.length > 0) {
                  const restaurantId = restaurants[0]._id;
                  const restaurantRes = await fetch(`${BASE_API_URL}/restaurants/${restaurantId}`);
                  if (restaurantRes.ok) {
                    const restaurantData = await restaurantRes.json();
                    const restaurant = restaurantData?.data;
                    
                    // Calculate distance from user location to restaurant
                    let distance: number | undefined;
                    if (restaurant?.location?.coordinates && Array.isArray(restaurant.location.coordinates) && restaurant.location.coordinates.length >= 2) {
                      const [restaurantLng, restaurantLat] = restaurant.location.coordinates;
                      distance = calculateDistance(test_lat, test_lng, restaurantLat, restaurantLng);

                    }

                    // Add restaurant information to the meal
                    meal.restaurant = {
                      _id: restaurantId,
                      name: restaurant?.name || restaurants[0].name,
                      heroUrl: restaurant?.heroUrl,
                      distance: distance
                    };
                  }
                }
              }
            } catch (restaurantError) {
              console.error('Error fetching restaurant info:', restaurantError);
            }
            
            return meal;
          })
        );
        const items = results
          .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled" && r.value)
          .map((r) => r.value);
        setHighProteinMeals(items);
      } catch (e: any) {
        setHpError(e?.message || "Failed to load");
      } finally {
        setHpLoading(false);
      }
    };
    fetchHP();
  }, [highProteinIds]);

  return (
    <section className="pt-8 sm:pt-16 pb-4 sm:pb-6 bg-gray-50 w-full">
      <div className="w-full max-w-[1280px] mx-auto px-6 sm:px-6">
        {/* Low Calorie Meals */}
        <div className="mb-12 sm:mb-16 w-full max-w-[1280px] mx-auto">
          <div className="flex justify-between items-center mb-8 sm:mb-8">
            <h2 className="text-xl sm:text-3xl md:text-2xl lg:text-3xl font-bold text-gray-900">Low Calorie meals</h2>
            <Button 
              variant="outline" 
              className="text-[#4E56D3] border-[#4E56D3] hover:bg-[#4E56D3] hover:text-white text-sm sm:text-base"
              onClick={() => router.push('/app')}
            >
              View more →
            </Button>
          </div>
          
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 min-[1100px]:grid-cols-4 gap-4 sm:gap-6 md:gap-4 lg:gap-6 w-full max-w-[1280px] mx-auto justify-items-center lg:justify-items-stretch min-[1101px]:justify-items-stretch">
            {lcLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <MealCardSkeleton key={i} />
                ))}
              </>
            ) : (
              lowCalMeals.slice(0,4).map((meal: any, index: number) => (
                <MealCard
                  key={index}
                  meal={meal}
                  index={index}
                  imageFallback="/images/LowCaloriesMealPic.png"
                  firstCompareId={firstCompareId}
                  handleCompareClick={handleCompareClick}
                />
              ))
            )}
          </div>
        </div>

        {/* Popular Restaurants */}
        <div className="mb-12 sm:mb-16 w-full max-w-[1280px] mx-auto">
          <h2 className="text-xl sm:text-3xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-8 sm:mb-8">Popular restaurants</h2>
          {/* Mobile: Horizontal scroll */}
          <div className="flex overflow-x-auto gap-4 pb-2 sm:hidden no-scrollbar">
            {restaurants.map((restaurant, index) => (
              <Card key={index} className="aspect-square p-4 text-center hover:shadow-lg transition-shadow cursor-pointer bg-white rounded-2xl border border-gray-100 flex flex-col justify-center w-[120px] h-[120px] flex-shrink-0">
                <div className="w-full flex-1 flex items-center justify-center mb-2">
                  <Image
                    src={restaurant.logo}
                    alt={restaurant.name}
                    width={120}
                    height={120}
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <p className="text-xs font-medium text-gray-700 truncate w-full">{restaurant.name}</p>
              </Card>
            ))}
          </div>
          
          {/* Desktop: Grid */}
          <div className="hidden sm:grid grid-cols-2 min-[420px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 min-[1100px]:grid-cols-6 gap-4 sm:gap-6 md:gap-4 lg:gap-6 w-full max-w-[1280px] mx-auto">
            {restaurants.map((restaurant, index) => (
              <Card key={index} className="aspect-square p-4 text-center hover:shadow-lg transition-shadow cursor-pointer bg-white rounded-2xl border border-gray-100 flex flex-col justify-center w-full">
                <div className="w-full flex-1 flex items-center justify-center mb-2">
                  <Image
                    src={restaurant.logo}
                    alt={restaurant.name}
                    width={120}
                    height={120}
                    className="w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 lg:w-26 lg:h-26 object-contain"
                  />
                </div>
                <p className="text-xs font-medium text-gray-700">{restaurant.name}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Low Carb Meals */}
        <div className="mb-12 sm:mb-16 w-full max-w-[1280px] mx-auto">
          <div className="flex justify-between items-center mb-8 sm:mb-8">
            <h2 className="text-xl sm:text-3xl md:text-2xl lg:text-3xl font-bold text-gray-900">Low Carb meals</h2>
            <Button 
              variant="outline" 
              className="text-[#4E56D3] border-[#4E56D3] hover:bg-[#4E56D3] hover:text-white text-sm sm:text-base"
              onClick={() => router.push('/app')}
            >
              View more →
            </Button>
            </div>
          
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 min-[1100px]:grid-cols-4 gap-4 sm:gap-6 md:gap-4 lg:gap-6 w-full max-w-[1280px] mx-auto justify-items-center lg:justify-items-stretch min-[1101px]:justify-items-stretch">
            {lcCarbLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <MealCardSkeleton key={i} />
                ))}
              </>
            ) : (
              lowCarbMeals.slice(0,4).map((meal: any, index: number) => (
                <MealCard
                  key={index}
                  meal={meal}
                  index={index}
                  imageFallback="/images/low crab meals.jpg"
                  firstCompareId={firstCompareId}
                  handleCompareClick={handleCompareClick}
                />
              ))
            )}
            </div>
          </div>

        {/* High Protein Meals */}
        <div className="mb-12 sm:mb-16 max-w-7xl mx-auto w-full max-w-[1280px]">
          <div className="flex justify-between items-center mb-8 sm:mb-8">
            <h2 className="text-xl sm:text-3xl md:text-2xl lg:text-3xl font-bold text-gray-900">High Protein meals</h2>
            <Button 
              variant="outline" 
              className="text-[#4E56D3] border-[#4E56D3] hover:bg-[#4E56D3] hover:text-white text-sm sm:text-base"
              onClick={() => router.push('/app')}
            >
              View more →
            </Button>
            </div>
          
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 min-[1100px]:grid-cols-4 gap-4 sm:gap-6 md:gap-4 lg:gap-6 w-full max-w-[1280px] mx-auto justify-items-center lg:justify-items-stretch min-[1101px]:justify-items-stretch">
            {hpLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <MealCardSkeleton key={i} />
                ))}
              </>
            ) : (
              highProteinMeals.slice(0,4).map((meal: any, index: number) => (
                <MealCard
                  key={index}
                  meal={meal}
                  index={index}
                  imageFallback="/images/LowCaloriesMealPic.png"
                  firstCompareId={firstCompareId}
                  handleCompareClick={handleCompareClick}
                />
              ))
            )}
                  </div>
          {hpError && (
            <div className="text-red-600 text-sm mt-3">{hpError}</div>
          )}
        </div>
      </div>
      
      {/* Compare Banner */}
      {compareBanner && (
        <div className="fixed right-2 md:right-4 bottom-20 md:bottom-4 z-50">
          <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-white shadow-lg px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-bold">1</div>
            <div className="min-w-[180px] max-w-[260px]">
              <div className="text-[13px] text-gray-800 font-medium mb-0.5">{compareBanner}</div>
              {firstCompareName && (
                <div className="text-[12px] text-gray-500 truncate">Selected item: <span className="font-semibold text-gray-800">{firstCompareName}</span></div>
              )}
            </div>
            <button
              onClick={() => { setCompareBanner(null); setFirstCompareId(null); setFirstCompareName(null); }}
              className="ml-2 rounded-full p-1 text-gray-400 hover:text-gray-600"
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

// About Us Section
const AboutSection = () => {
  const features = [
    { 
      icon: "/images/heart.png", 
      title: "Smart decisions", 
      description: "Make informed food choices that align with your health goals" 
    },
    { 
      icon: "/images/leaf.png", 
      title: "Diet friendly", 
      description: "Discover restaurants that accommodate your dietary restrictions" 
    },
    { 
      icon: "/images/timer.png", 
      title: "Time saving", 
      description: "Save time searching for healthy options when dining out" 
    },
    { 
      icon: "/images/star.png", 
      title: "Balanced Enjoyment", 
      description: "Enjoy dining out while staying healthy and losing weight" 
    }
  ];

  return (
    <section id="about" className="py-8 sm:py-16 bg-gray-50 w-full scroll-mt-[120px]">
        <div className="w-full max-w-[1280px] mx-auto px-6 sm:px-6">
        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="bg-gradient-to-br from-[#4E56D3] to-[#8B5CF6] rounded-3xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-4 text-center">About Us</h2>
            <p className="text-sm mb-6 opacity-90 leading-relaxed text-center">
            We know eating healthy isn’t easy—especially when most of us eat out. That’s why we created LiteBite: an AI-powered app that helps you find restaurant meals that match your goals, diet, and allergies. Simple, smart, and made to keep you on track
            </p>

            {/* 75% highlight on top for mobile */}
            <div className="bg-white/20 rounded-2xl p-4 text-center backdrop-blur-sm mb-6">
              <div className="text-3xl font-bold text-[#CEFF65] mb-1">100%</div>
              <p className="text-xs text-white/90">Of users make healthier choices</p>
            </div>

            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-2xl p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Image
                        src={feature.icon}
                        alt={feature.title}
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1 text-base">{feature.title}</h3>
                      <p className="text-gray-600 text-xs leading-tight">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:block mt-[-100px] mb-[-40px]">
          <div className="bg-gradient-to-br from-[#4E56D3] to-[#8B5CF6] rounded-[32px] p-8 md:p-10 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center">
              <div className="text-white">
                <h2 className="text-3xl md:text-3xl lg:text-4xl font-bold mb-6">About Us</h2>
                <p className="text-lg md:text-lg lg:text-xl mb-8 opacity-90 leading-relaxed">
                  Healthy eating on the go is hard.<br />
                  LiteBite uses AI to find meals that<br />
                  match your goals, diet, and allergies—<br />
                  so you can eat out and stay on track.
                </p>
                
                <div className="mt-8 bg-white/20 rounded-2xl p-4 md:p-5 lg:p-6 text-center backdrop-blur-sm inline-block">
                  <div className="text-3xl md:text-3xl lg:text-4xl font-bold text-[#CEFF65] mb-2">100%</div>
                  <p className="text-sm text-white/90">Of users make healthier choices</p>
                </div>
              </div>
              
              <div className="relative w-full max-w-[1280px] mx-auto">
                <div className="space-y-3 md:space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="bg-white rounded-2xl p-4 md:p-5 lg:p-6 shadow-lg h-20 md:h-22 lg:h-24 flex items-center">
                      <div className="flex items-center gap-3 md:gap-4 w-full">
                        <div className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                          <Image
                            src={feature.icon}
                            alt={feature.title}
                            width={24}
                            height={24}
                            className="w-5 h-5 md:w-5 md:h-5 lg:w-6 lg:h-6"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1 text-base md:text-base lg:text-lg">{feature.title}</h3>
                          <p className="text-gray-600 text-sm leading-tight">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Launch Program Section
const LaunchSection = () => {
  return (
    <section className="py-8 sm:py-16 bg-gray-50 w-full">
      <div className="w-full max-w-[800px] mx-auto">
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-lg relative overflow-hidden mb-[-40px]">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-gray-200 rounded-full opacity-50 -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-gray-200 rounded-full opacity-50 translate-x-20 translate-y-20"></div>
          <div className="absolute top-1/2 right-0 w-24 h-24 bg-gray-200 rounded-full opacity-30 translate-x-12"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
          Join Our Launch Program
        </h2>
            <p className="text-base sm:text-lg md:text-base lg:text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Be among the first to test BiteLite and help shape the future of AI-powered nutrition. Sign up now and get early access!
            </p>
            
            <Button asChild className="bg-[#4E56D3] hover:bg-[#4046C7] text-white px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg rounded-full shadow-lg">
              <Link href="/login">Join Now!</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

// FAQ Section
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(1); // Second item open by default

  const faqs = [
    {
      question: "How does litebite\'s AI find healthy meal options?",
      answer: "Our AI analyzes nutritional information, ingredients, and dietary restrictions from restaurant menus to provide personalized recommendations."
    },
    {
      question: "Is LiteBite available in my city?",
      answer: "We are first launching our app in New Yor and are planning to launch in other cities soon."
    },
    {
      question: "How accurate is the nutritional information?",
      answer: "Our nutritional information is sourced directly from restaurant databases and verified by our AI system for accuracy and consistency."
    },
    {
      question: "Can LiteBite accommodate my food allergies?",
      answer: "Yes! Our AI can filter out foods containing allergens and suggest safe alternatives based on your specific dietary restrictions."
    }
  ];

  return (
    <section className="py-8 sm:py-16 bg-gray-50 w-full">
      <div className="w-full max-w-[800px] mx-auto px-4">
        {/* Title with decorative lines */}
        <div className="text-center mb-10 sm:mb-16 relative">
          <div className="w-screen relative left-1/2 transform -translate-x-1/2">
            <div className="flex items-center">
              <div className="flex-1 h-px bg-gray-300"></div>
              <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-gray-900 px-0 sm:px-8">FAQs</h2>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <button
                className="w-full px-4 sm:px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              >
                <span className="font-semibold text-gray-900 text-base sm:text-lg md:text-base lg:text-lg">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-4 sm:px-6 pb-4 pt-2">
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base md:text-sm lg:text-base">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Contact Section
const ContactSection = () => {
  return (
    <section id="contact" className="pt-0 pb-16 sm:pt-0 sm:pb-24  sm:mb-[-100px] bg-gray-50 w-full scroll-mt-[80px] mb-1 sm:mb-[-70px]">
      <div className="w-full max-w-[500px] mx-auto px-6 sm:px-6">
        <div className="flex justify-center items-center">
          {/* Contact Us Section - Centered */}
          <div className="max-w-lg mx-auto w-full text-center">
            <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-4">Contact Us</h2>
            <p className="text-base sm:text-lg md:text-base lg:text-lg text-gray-600 mb-8">
              Let us know what you think and where we should launch next! We are constantly expanding to new cities and adding new features.
            </p>

            <div className="space-y-6 mb-8">
              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">Ask questions</h3>
                <p className="text-gray-600">we are ready to help</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">Share Feedback</h3>
                <p className="text-gray-600">Your ideas make us better.</p>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-900 mb-1 text-lg">Work With Us</h3>
                <p className="text-gray-600">Lets create something great.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 justify-center">
              <div className="w-10 h-10 bg-[#4E56D3] rounded-lg flex items-center justify-center">
                <Image
                  src="/images/mail.png"
                  alt="E-mail"
                  width={18}
                  height={18}
                  className="w-5 h-5 filter brightness-0 invert"
                />
              </div>
              <div className="leading-tight text-left">
                <div className="text-sm text-gray-800 font-medium">E-mail Us</div>
                <div className="text-sm text-gray-600">hello@litebite.ai</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


// Main Landing Page Component
export default function LandingPage() {
  return (
    <div className="w-full min-h-screen">
      {/* Header */}
      <Header />
      {/* Bottom Navigation on mobile/tablet (<=1100px) */}
      <div className="max-[1100px]:block min-[1101px]:hidden">
        <BottomNavigation hideFilter={true} />
      </div>

      {/* Page Sections */}
      <HeroSection />
      <DiscoverSection />
      <ProductsSection />
      <MealCategoriesSection />
      <AboutSection />
      <LaunchSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
