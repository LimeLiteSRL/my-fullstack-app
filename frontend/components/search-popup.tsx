"use client";


import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: { calorie: string; diet: string; allergies: string };
  setSearchQuery: (query: { calorie: string; diet: string; allergies: string }) => void;
}

export default function SearchPopup({ isOpen, onClose, searchQuery, setSearchQuery }: SearchPopupProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Calorie");
  const [calorieRange, setCalorieRange] = useState([0, 3500]);
  const [calorieInputs, setCalorieInputs] = useState({ min: "0", max: "3500" });
  const [distance, setDistance] = useState(3.8);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const [isDraggingDistance, setIsDraggingDistance] = useState(false);
  const distanceTrackRef = useRef<Element | null>(null);
  const [selectedAllergies, setSelectedAllergies] = useState<number[]>([]);
  const [selectedDiets, setSelectedDiets] = useState<number[]>([]);

  // Align options with products page
  const dietOptions = [
    { id: "glutenFree", label: "Gluten Free" },
    { id: "nutFree", label: "Nut Free" },
    { id: "sesame", label: "Sesame" },
    { id: "vegan", label: "Vegan" },
    { id: "vegetarian", label: "Vegetarian" },
    { id: "halal", label: "Halal" },
    { id: "kosher", label: "Kosher" },
    { id: "mediterranean", label: "Mediterranean" },
    { id: "carnivore", label: "Carnivore" },
    { id: "keto", label: "Keto" },
    { id: "lowCarb", label: "Low Carb" },
    { id: "paleo", label: "Paleo" },
  ];
  const allergyOptions = [
    { id: "milk", label: "Milk" },
    { id: "egg", label: "Egg" },
    { id: "wheat", label: "Wheat (Gluten)" },
    { id: "soy", label: "Soy" },
    { id: "fish", label: "Fish" },
    { id: "peanuts", label: "Peanuts" },
    { id: "treeNuts", label: "Tree Nuts" },
  ];

  const tabs = ["Calorie", "Allergies", "Diet"];

  const allergyOptionsFiltered = allergyOptions;

  const dietOptionsFiltered = dietOptions;

  const handleAllergyToggle = (index: number) => {
    setSelectedAllergies((prev: number[]) => 
      prev.includes(index) 
        ? prev.filter((i: number) => i !== index)
        : [...prev, index]
    );
  };

  const handleDietToggle = (index: number) => {
    setSelectedDiets((prev: number[]) => 
      prev.includes(index) 
        ? prev.filter((i: number) => i !== index)
        : [...prev, index]
    );
  };

  const handleCalorieInputChange = (type: 'min' | 'max', value: string) => {
    let numValue = parseInt(value);
    if (!Number.isFinite(numValue)) numValue = 0;
    // snap to nearest 100
    numValue = Math.round(numValue / 100) * 100;
    if (type === 'min') numValue = Math.max(0, Math.min(3500, numValue));
    if (type === 'max') numValue = Math.max(0, Math.min(3500, numValue));
    setCalorieInputs((prev: { min: string; max: string }) => ({ ...prev, [type]: String(numValue) }));
    
    if (type === 'min') {
      const snappedMax = Math.max(numValue + 100, Math.round(calorieRange[1] / 100) * 100);
      setCalorieRange([numValue, Math.min(3500, Math.max(snappedMax, numValue))]);
    } else {
      const snappedMin = Math.min(numValue - 100, Math.round(calorieRange[0] / 100) * 100);
      const newMin = Math.max(0, Math.min(3500, Math.min(snappedMin, numValue - 100)));
      setCalorieRange([newMin, numValue]);
    }
  };

  const handleRangeChange = (values: number[]) => {
    // snap both to nearest 100
    const min = Math.round(values[0] / 100) * 100;
    const max = Math.round(values[1] / 100) * 100;
    setCalorieRange([min, max]);
    setCalorieInputs({ min: min.toString(), max: max.toString() });
  };

  const handleSliderMouseDown = (handle: 'min' | 'max') => {
    setIsDragging(handle);
  };

  const handleSliderTouchStart = (handle: 'min' | 'max') => {
    setIsDragging(handle);
  };

  const handleSliderMouseMove = useCallback((e: React.MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    
    let clientX: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    const rect = (e.currentTarget as Element).getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    // snap value to nearest 100
    const raw = Math.round(0 + percentage * 3500);
    const value = Math.round(raw / 100) * 100;
    
    if (isDragging === 'min') {
      const newMin = Math.min(value, Math.max(0, calorieRange[1] - 100));
      const snappedMin = Math.round(newMin / 100) * 100;
      setCalorieRange([snappedMin, Math.round(calorieRange[1] / 100) * 100]);
      setCalorieInputs((prev: { min: string; max: string }) => ({ ...prev, min: snappedMin.toString() }));
    } else {
      const newMax = Math.max(value, Math.min(3500, calorieRange[0] + 100));
      const snappedMax = Math.round(newMax / 100) * 100;
      setCalorieRange([Math.round(calorieRange[0] / 100) * 100, snappedMax]);
      setCalorieInputs((prev: { min: string; max: string }) => ({ ...prev, max: snappedMax.toString() }));
    }
  }, [isDragging, calorieRange]);

  const handleSliderMouseUp = () => {
    setIsDragging(null);
  };

  const handleSliderTouchEnd = () => {
    setIsDragging(null);
  };

  // Distance slider draggable support (1 → 15)
  const updateDistanceFromPointer = (clientX: number, element: Element) => {
    const rect = (element as Element).getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newDistance = Math.round((1 + percentage * 14) * 10) / 10;
    setDistance(newDistance);
  };
  const onDistanceMouseDown = (e: React.MouseEvent) => {
    setIsDraggingDistance(true);
    distanceTrackRef.current = e.currentTarget as Element;
    updateDistanceFromPointer(e.clientX, e.currentTarget as Element);
  };
  const onDistanceMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingDistance) return;
    updateDistanceFromPointer(e.clientX, (distanceTrackRef.current || e.currentTarget) as Element);
  };
  const onDistanceMouseUp = () => setIsDraggingDistance(false);
  const onDistanceMouseLeave = () => {};
  const onDistanceTouchStart = (e: React.TouchEvent) => {
    setIsDraggingDistance(true);
    distanceTrackRef.current = e.currentTarget as Element;
    updateDistanceFromPointer(e.touches[0].clientX, e.currentTarget as Element);
  };
  const onDistanceTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingDistance) return;
    updateDistanceFromPointer(e.touches[0].clientX, (distanceTrackRef.current || e.currentTarget) as Element);
  };
  const onDistanceTouchEnd = () => setIsDraggingDistance(false);

  // Global listeners for distance dragging (easier to reach ends)
  useEffect(() => {
    if (!isDraggingDistance) return;
    const onDocMouseMove = (e: MouseEvent) => {
      if (!distanceTrackRef.current) return;
      updateDistanceFromPointer(e.clientX, distanceTrackRef.current);
    };
    const onDocMouseUp = () => setIsDraggingDistance(false);
    const onDocTouchMove = (e: TouchEvent) => {
      if (!distanceTrackRef.current || e.touches.length === 0) return;
      updateDistanceFromPointer(e.touches[0].clientX, distanceTrackRef.current);
    };
    const onDocTouchEnd = () => setIsDraggingDistance(false);
    document.addEventListener('mousemove', onDocMouseMove);
    document.addEventListener('mouseup', onDocMouseUp);
    document.addEventListener('touchmove', onDocTouchMove);
    document.addEventListener('touchend', onDocTouchEnd);
    return () => {
      document.removeEventListener('mousemove', onDocMouseMove);
      document.removeEventListener('mouseup', onDocMouseUp);
      document.removeEventListener('touchmove', onDocTouchMove);
      document.removeEventListener('touchend', onDocTouchEnd);
    };
  }, [isDraggingDistance]);

  const handleSliderClick = (e: React.MouseEvent | TouchEvent) => {
    let clientX: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    
    const rect = (e.currentTarget as Element).getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const raw = Math.round(0 + percentage * 3500);
    const value = Math.round(raw / 100) * 100;
    
    if (Math.abs(value - calorieRange[0]) < Math.abs(value - calorieRange[1])) {
      const newMin = Math.min(value, Math.max(0, calorieRange[1] - 100));
      const snappedMin = Math.round(newMin / 100) * 100;
      setCalorieRange([snappedMin, Math.round(calorieRange[1] / 100) * 100]);
      setCalorieInputs((prev: { min: string; max: string }) => ({ ...prev, min: snappedMin.toString() }));
    } else {
      const newMax = Math.max(value, Math.min(3500, calorieRange[0] + 100));
      const snappedMax = Math.round(newMax / 100) * 100;
      setCalorieRange([Math.round(calorieRange[0] / 100) * 100, snappedMax]);
      setCalorieInputs((prev: { min: string; max: string }) => ({ ...prev, max: snappedMax.toString() }));
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const syntheticEvent = {
          currentTarget: e.target as Element,
          touches: undefined,
          clientX: e.clientX
        } as any;
        handleSliderMouseMove(syntheticEvent);
      }
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        const syntheticEvent = {
          currentTarget: e.target as Element,
          touches: e.touches,
          clientX: e.touches[0].clientX
        } as any;
        handleSliderMouseMove(syntheticEvent);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(null);
    };

    const handleGlobalTouchEnd = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('touchmove', handleGlobalTouchMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, handleSliderMouseMove]);

  const handleApply = () => {
    const newQuery = { ...searchQuery };
    
    if (activeTab === "Calorie") {
      newQuery.calorie = `${calorieInputs.min}-${calorieInputs.max} calories`;
    } else if (activeTab === "Allergies") {
      const selectedAllergyNames = selectedAllergies.map((index: number) => allergyOptions[index]?.label).filter(Boolean) as string[];
      newQuery.allergies = selectedAllergyNames.join(", ") || "";
    } else if (activeTab === "Diet") {
      const selectedDietNames = selectedDiets.map((index: number) => dietOptions[index]?.label).filter(Boolean) as string[];
      newQuery.diet = selectedDietNames.join(", ") || "";
    }
    
    setSearchQuery(newQuery);
    // Navigate to products with filter params applied (align with products page expectations)
    const params = new URLSearchParams();
    params.set("minCal", calorieInputs.min || "0");
    params.set("maxCal", calorieInputs.max || "3500");
    params.set("distance", String(distance));
    // Map diets and allergies to products params
    const mappedDietIds = selectedDiets
      .map((idx: number) => dietOptions[idx]?.id)
      .filter((v: string | undefined): v is string => Boolean(v));
    if (mappedDietIds.length > 0) params.set("diets", mappedDietIds.join(","));
    const mappedAllergyIds = selectedAllergies
      .map((idx: number) => allergyOptions[idx]?.id)
      .filter((v: string | undefined): v is string => Boolean(v));
    if (mappedAllergyIds.length > 0) params.set("allergies", mappedAllergyIds.join(","));
    router.push(`/app?${params.toString()}`);
    onClose();
  };

  const handleClearAll = () => {
    setCalorieRange([0, 3500]);
    setCalorieInputs({ min: "0", max: "3500" });
    setDistance(3.8);
    setSelectedAllergies([]);
    setSelectedDiets([]);
    setSearchQuery({ calorie: "", diet: "", allergies: "" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Desktop Layout */}
      <div className="hidden md:flex bg-white rounded-3xl w-[640px] max-h-[90vh] flex-col" style={{ borderRadius: '24px' }}>
        {/* Header with Filter Name */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {activeTab === "Calorie" ? "Calorie" : 
             activeTab === "Allergies" ? "Allergies" : 
             activeTab === "Diet" ? "Diet" : "Filter"}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter Tabs and Nearby Slider */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            {/* Filter Tabs */}
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-[#4E56D3] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {/* Nearby Filter Slider - positioned on the same line as tabs */}
            <div className="flex items-center space-x-3">
              <div className="text-sm font-medium text-gray-700">Nearby</div>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-48 h-3 bg-gray-200 rounded-full cursor-pointer"
                  onMouseDown={onDistanceMouseDown}
                  onMouseMove={onDistanceMouseMove}
                  onMouseUp={onDistanceMouseUp}
                  onMouseLeave={onDistanceMouseLeave}
                  onTouchStart={onDistanceTouchStart}
                  onTouchMove={onDistanceTouchMove}
                  onTouchEnd={onDistanceTouchEnd}
                >
                  <div 
                    className="h-3 bg-[#4E56D3] rounded-full relative"
                    style={{ 
                      width: `${(distance / 15) * 100}%`
                    }}
                  >
                    <div 
                      className="absolute -top-1.5 w-5 h-5 bg-[#4E56D3] rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
                      style={{ right: '0%' }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-700 whitespace-nowrap">{distance >= 15 ? '15+' : distance.toFixed(1)} mile</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Filter Section */}
        <div className="p-4 border-b border-gray-200 flex-1 min-h-0 overflow-y-auto">
          {activeTab === "Calorie" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Calories</h3>
              <div className="mb-4">
                <div className="relative">
                  <div 
                    className="w-full h-2 bg-gray-200 rounded-full cursor-pointer"
                    onMouseMove={handleSliderMouseMove}
                    onClick={handleSliderClick}
                    onTouchMove={(e) => {
                      const syntheticEvent = {
                        currentTarget: e.currentTarget,
                        touches: e.touches,
                        clientX: e.touches[0].clientX
                      } as any;
                      handleSliderMouseMove(syntheticEvent);
                    }}
                    onTouchEnd={handleSliderTouchEnd}
                  >
                    <div 
                      className="h-2 bg-[#4E56D3] rounded-full relative"
                      style={{ 
                        left: `${((calorieRange[0] - 0) / (3500 - 0)) * 100}%`,
                        width: `${((calorieRange[1] - calorieRange[0]) / (3500 - 0)) * 100}%`
                      }}
                    >
                      <div 
                        className="absolute -top-1 w-4 h-4 bg-[#4E56D3] rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
                        style={{ left: '0%' }}
                        onMouseDown={() => handleSliderMouseDown('min')}
                        onTouchStart={() => handleSliderTouchStart('min')}
                      />
                      <div 
                        className="absolute -top-1 w-4 h-4 bg-[#4E56D3] rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
                        style={{ right: '0%' }}
                        onMouseDown={() => handleSliderMouseDown('max')}
                        onTouchStart={() => handleSliderTouchStart('max')}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Min: {calorieInputs.min}</span>
                  <span>Max: {(parseInt(calorieInputs.max) >= 3500 ? '3500+' : calorieInputs.max)}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="w-20">
                  <input
                    type="number"
                    placeholder="number"
                    value={calorieInputs.min}
                    onChange={(e) => handleCalorieInputChange('min', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4E56D3] focus:border-transparent text-center"
                  />
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    placeholder="number"
                    value={calorieInputs.max}
                    onChange={(e) => handleCalorieInputChange('max', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4E56D3] focus:border-transparent text-center"
                  />
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "Allergies" && (
            <div className="space-y-4">
              {/* Allergy List - 4 columns */}
              <div className="grid grid-cols-4 gap-3">
                {allergyOptionsFiltered.map((opt) => {
                  const idx = allergyOptions.findIndex((o) => o.id === opt.id);
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center justify-center p-2 rounded-lg cursor-pointer h-12 ${
                        selectedAllergies.includes(idx)
                          ? 'bg-[#4E56D3] border-[#4E56D3]'
                          : 'bg-white border border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleAllergyToggle(idx)}
                    >
                      <span className={`font-semibold text-xs text-center ${
                        selectedAllergies.includes(idx) ? 'text-white' : 'text-gray-900'
                      }`}>{opt.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {activeTab === "Diet" && (
            <div className="space-y-4">
              {/* Diet List - 4 columns */}
              <div className="grid grid-cols-4 gap-3">
                {dietOptionsFiltered.map((opt) => {
                  const idx = dietOptions.findIndex((o) => o.id === opt.id);
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center justify-center p-2 rounded-lg cursor-pointer h-12 ${
                        selectedDiets.includes(idx)
                          ? 'bg-[#4E56D3] border-[#4E56D3]'
                          : 'bg-white border border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleDietToggle(idx)}
                    >
                      <span className={`font-semibold text-xs text-center ${
                        selectedDiets.includes(idx) ? 'text-white' : 'text-gray-900'
                      }`}>{opt.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* AI Feature Box */}
        <div className="px-4 py-4 flex-shrink-0">
          <div className="bg-gray-100 rounded-xl p-4 text-center">
            <div className="flex justify-center mb-2">
              <Image
                src="/images/Micro Chip.png"
                alt="AI Icon"
                width={32}
                height={32}
                className="w-8 h-8"
              />
            </div>
            <div className="text-gray-900 font-medium mb-1">Our AI is coming soon</div>
            <div className="text-sm text-gray-600 mb-2">
            Find healthy meals that perfectly match your diet in a completely new way
            </div>
            <div className="text-xs text-gray-500 bg-white rounded-lg p-2">
              e.g. I just left the gym, where can I get a high protein meal near me?
            </div>
          </div>
        </div>

        {/* Footer with Search and Clear buttons */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 rounded-b-3xl">
          <div className="flex justify-between">
            <button 
              onClick={handleClearAll}
              className="w-24 px-4 py-2 text-red-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear all
            </button>
            <button 
              onClick={handleApply}
              className="w-24 px-4 py-2 bg-[#4E56D3] text-white rounded-lg hover:bg-[#4046C7] transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden mobile-popup fixed inset-x-0 bottom-0 bg-white rounded-t-3xl max-h-[90vh] flex flex-col" style={{ maxHeight: '90vh' }}>
        <style jsx>{`
          @media (max-height: 750px) {
            .mobile-popup {
              max-height: 95vh !important;
              height: 100vh !important;
            }
          }
        `}</style>
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header with Tabs */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {activeTab}
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-[#4E56D3] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "Allergies" && (
          <>
            {/* Nearby Slider */}
            <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">Nearby</div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-32 h-3 bg-gray-200 rounded-full cursor-pointer"
                    onMouseDown={onDistanceMouseDown}
                    onMouseMove={onDistanceMouseMove}
                    onMouseUp={onDistanceMouseUp}
                    onMouseLeave={onDistanceMouseLeave}
                    onTouchStart={onDistanceTouchStart}
                    onTouchMove={onDistanceTouchMove}
                    onTouchEnd={onDistanceTouchEnd}
                  >
                    <div 
                      className="h-3 bg-[#4E56D3] rounded-full relative"
                      style={{ 
                        width: `${(distance / 15) * 100}%`
                      }}
                    >
                      <div 
                        className="absolute -top-1.5 w-5 h-5 bg-[#4E56D3] rounded-full border-2 border-white shadow-md cursor-pointer"
                        style={{ right: '0%' }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 whitespace-nowrap">{distance >= 15 ? '15+' : distance.toFixed(1)} mile</span>
                  <span className="text-xs text-gray-500">Max: 15+ miles</span>
                </div>
              </div>
            </div>


            {/* Allergies List - 4 columns */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              <div className="grid grid-cols-4 gap-3">
                {allergyOptionsFiltered.map((opt) => {
                  const idx = allergyOptions.findIndex((o) => o.id === opt.id);
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center justify-center p-2 rounded-xl cursor-pointer h-12 ${
                        selectedAllergies.includes(idx)
                          ? 'bg-[#4E56D3] border-[#4E56D3]'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => handleAllergyToggle(idx)}
                    >
                      <span className={`font-medium text-xs text-center ${
                        selectedAllergies.includes(idx) ? 'text-white' : 'text-gray-900'
                      }`}>{opt.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clear All Link */}
            <div className="px-4 py-2 flex-shrink-0">
              <button 
                onClick={handleClearAll}
                className="text-red-500 text-sm font-medium"
              >
                Clear all
              </button>
            </div>

            {/* Search Button */}
            <div className="p-4 flex-shrink-0">
              <button 
                onClick={handleApply}
                className="w-full bg-[#4E56D3] hover:bg-[#4046C7] text-white py-3 rounded-full font-medium"
              >
                Search
              </button>
            </div>

            {/* AI Section */}
            <div className="px-4 pb-4 flex-shrink-0">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="flex justify-center mb-2">
                  <Image
                    src="/images/Micro Chip.png"
                    alt="AI Icon"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
                <div className="text-gray-900 font-medium mb-1">Our AI is coming soon</div>
                <div className="text-sm text-gray-600 mb-2">
                Find healthy meals that perfectly match your diet in a completely new way
                </div>
                <div className="text-xs text-gray-500 bg-white rounded-lg p-2">
                  e.g. I just left the gym, where can I get a high protein meal near me?
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "Calorie" && (
          <>
            {/* Nearby Slider */}
            <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">Nearby</div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-32 h-3 bg-gray-200 rounded-full cursor-pointer"
                    onMouseDown={onDistanceMouseDown}
                    onMouseMove={onDistanceMouseMove}
                    onMouseUp={onDistanceMouseUp}
                    onMouseLeave={onDistanceMouseLeave}
                    onTouchStart={onDistanceTouchStart}
                    onTouchMove={onDistanceTouchMove}
                    onTouchEnd={onDistanceTouchEnd}
                  >
                    <div 
                      className="h-3 bg-[#4E56D3] rounded-full relative"
                      style={{ 
                        width: `${(distance / 15) * 100}%`
                      }}
                    >
                      <div 
                        className="absolute -top-1.5 w-5 h-5 bg-[#4E56D3] rounded-full border-2 border-white shadow-md cursor-pointer"
                        style={{ right: '0%' }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 whitespace-nowrap">{distance >= 15 ? '15+' : distance.toFixed(1)} mile</span>
                  <span className="text-xs text-gray-500">Max: 15+ miles</span>
                </div>
              </div>
            </div>

            {/* Calories Section */}
            <div className="flex-1 p-4">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Calories</h3>
                
                {/* Dual Range Slider */}
                <div className="relative">
                  <div 
                    className="w-full h-2 bg-gray-200 rounded-full cursor-pointer relative"
                    onMouseMove={handleSliderMouseMove}
                    onClick={handleSliderClick}
                    onTouchMove={(e) => {
                      const syntheticEvent = {
                        currentTarget: e.currentTarget,
                        touches: e.touches,
                        clientX: e.touches[0].clientX
                      } as any;
                      handleSliderMouseMove(syntheticEvent);
                    }}
                    onTouchEnd={handleSliderTouchEnd}
                  >
                    <div 
                      className="h-2 bg-[#4E56D3] rounded-full relative"
                      style={{ 
                        left: `${((calorieRange[0] - 0) / (3500 - 0)) * 100}%`,
                        width: `${((calorieRange[1] - calorieRange[0]) / (3500 - 0)) * 100}%`
                      }}
                    >
                      {/* Min Handle */}
                      <div 
                        className="absolute -top-1 w-4 h-4 bg-[#4E56D3] rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
                        style={{ left: '0%' }}
                        onMouseDown={() => handleSliderMouseDown('min')}
                        onTouchStart={() => handleSliderTouchStart('min')}
                      />
                      {/* Max Handle */}
                      <div 
                        className="absolute -top-1 w-4 h-4 bg-[#4E56D3] rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
                        style={{ right: '0%' }}
                        onMouseDown={() => handleSliderMouseDown('max')}
                        onTouchStart={() => handleSliderTouchStart('max')}
                      />
                    </div>
                  </div>
                  
                  {/* Range Labels */}
                  <div className="flex justify-between text-sm text-gray-600 mt-3">
                    <span>Min: {calorieInputs.min}</span>
                    <span>Max: {(parseInt(calorieInputs.max) >= 3500 ? '3500+' : calorieInputs.max)}</span>
                  </div>
                </div>

                {/* Number Inputs */}
                <div className="flex gap-4 justify-center">
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      placeholder="number"
                      value={calorieInputs.min}
                      onChange={(e) => handleCalorieInputChange('min', e.target.value)}
                      className="w-20 p-3 border border-gray-300 rounded-full text-center text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4E56D3] focus:border-transparent"
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      placeholder="number"
                      value={calorieInputs.max}
                      onChange={(e) => handleCalorieInputChange('max', e.target.value)}
                      className="w-20 p-3 border border-gray-300 rounded-full text-center text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4E56D3] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Clear All Link */}
            <div className="px-4 py-2 flex-shrink-0">
              <button 
                onClick={handleClearAll}
                className="text-red-500 text-sm font-medium"
              >
                Clear all
              </button>
            </div>

            {/* Search Button */}
            <div className="p-4 flex-shrink-0">
              <button 
                onClick={handleApply}
                className="w-full bg-[#4E56D3] hover:bg-[#4046C7] text-white py-3 rounded-full font-medium"
              >
                Search
              </button>
            </div>

            {/* AI Section */}
            <div className="px-4 pb-4 flex-shrink-0">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="flex justify-center mb-2">
                  <Image
                    src="/images/Micro Chip.png"
                    alt="AI Icon"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
                <div className="text-gray-900 font-medium mb-1">Our AI is coming soon</div>
                <div className="text-sm text-gray-600 mb-2">
                Find healthy meals that perfectly match your diet in a completely new way
                </div>
                <div className="text-xs text-gray-500 bg-white rounded-lg p-2">
                  e.g. I just left the gym, where can I get a high protein meal near me?
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "Diet" && (
          <>
            {/* Nearby Slider */}
            <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">Nearby</div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-32 h-3 bg-gray-200 rounded-full cursor-pointer"
                    onMouseDown={onDistanceMouseDown}
                    onMouseMove={onDistanceMouseMove}
                    onMouseUp={onDistanceMouseUp}
                    onMouseLeave={onDistanceMouseLeave}
                    onTouchStart={onDistanceTouchStart}
                    onTouchMove={onDistanceTouchMove}
                    onTouchEnd={onDistanceTouchEnd}
                  >
                    <div 
                      className="h-3 bg-[#4E56D3] rounded-full relative"
                      style={{ 
                        width: `${(distance / 15) * 100}%`
                      }}
                    >
                      <div 
                        className="absolute -top-1.5 w-5 h-5 bg-[#4E56D3] rounded-full border-2 border-white shadow-md cursor-pointer"
                        style={{ right: '0%' }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 whitespace-nowrap">{distance.toFixed(1)} mile</span>
                  <span className="text-xs text-gray-500">Max: 15 miles</span>
                </div>
              </div>
            </div>


            {/* Suggestions Section */}
            <div className="px-4 py-2 flex-shrink-0">
              <div className="text-sm text-gray-600">Suggestions</div>
            </div>

            {/* Diet Suggestions List - 4 columns */}
            <div className="flex-1 overflow-y-auto px-4 min-h-0">
              <div className="grid grid-cols-4 gap-3">
                {dietOptionsFiltered.map((opt) => {
                  const idx = dietOptions.findIndex((o) => o.id === opt.id);
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center justify-center p-2 rounded-xl cursor-pointer h-12 ${
                        selectedDiets.includes(idx)
                          ? 'bg-[#4E56D3] border-[#4E56D3]'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => handleDietToggle(idx)}
                    >
                      <span className={`font-medium text-xs text-center ${
                        selectedDiets.includes(idx) ? 'text-white' : 'text-gray-900'
                      }`}>{opt.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clear All Link */}
            <div className="px-4 py-2 flex-shrink-0">
              <button 
                onClick={handleClearAll}
                className="text-red-500 text-sm font-medium"
              >
                Clear all
              </button>
            </div>

            {/* Search Button */}
            <div className="p-4 flex-shrink-0">
              <button 
                onClick={handleApply}
                className="w-full bg-[#4E56D3] hover:bg-[#4046C7] text-white py-3 rounded-full font-medium"
              >
                Search
              </button>
            </div>

            {/* AI Section */}
            <div className="px-4 pb-4 flex-shrink-0">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="flex justify-center mb-2">
                  <Image
                    src="/images/Micro Chip.png"
                    alt="AI Icon"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
                <div className="text-gray-900 font-medium mb-1">Our AI is coming soon</div>
                <div className="text-sm text-gray-600 mb-2">
                Find healthy meals that perfectly match your diet in a completely new way
                </div>
                <div className="text-xs text-gray-500 bg-white rounded-lg p-2">
                  e.g. I just left the gym, where can I get a high protein meal near me?
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
