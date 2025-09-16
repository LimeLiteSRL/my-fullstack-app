"use client";

import React from "react";
import {
  BreadIcon,
  ChatgptIcon,
  DishIcon,
  FilterVerticalIcon,
  FishFoodIcon,
  HomeIcon,
  UserIcon,
} from "./icons/icons";
import { Routes } from "@/libs/routes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/libs/utils";
import FilterComponent from "./filters-search/filter-component";
import useFilterStore from "@/libs/store/filters-store";

type BottomNavigationProps = {
  onFilterClick?: () => void;
  hideFilter?: boolean;
};

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onFilterClick, hideFilter = false }) => {
  const pathName = usePathname();
  const { setIsFilterVisible, isFilterVisible } = useFilterStore();

  return (
    <>
      <div className="fixed bottom-5 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4">
        <div className={cn("flex w-full items-center gap-4", hideFilter ? "justify-center" : "justify-center")}>
          <div className={cn("flex items-center overflow-auto rounded-full bg-white p-1 shadow-md", hideFilter ? "justify-center" : "w-full justify-between")}>
            {bottomNavigationItems.map((nav) => (
              <Link
                className={cn(
                  "flex h-[50px] min-w-[55px] items-center justify-center gap-1 rounded-full px-2 transition-all",
                  pathName === nav.link
                    ? "bg-primary !fill-black text-black"
                    : null,
                )}
                key={nav.link}
                href={nav.link}
              >
                {nav.icon}
                <div
                  className={cn(
                    "w-full overflow-hidden text-center text-sm font-medium transition-all duration-300",
                    pathName === nav.link ? "w-[80px]" : "w-0",
                  )}
                >
                  {nav.title}
                </div>
              </Link>
            ))}
          </div>
          {!hideFilter && (
            <button
              onClick={() => {
                if (onFilterClick) {
                  onFilterClick();
                } else {
                  setIsFilterVisible(!isFilterVisible);
                }
              }}
              className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-secondary shadow-lg"
              id="filter-button"
            >
              <FilterVerticalIcon className="size-6 rotate-90 text-neutral-50" />
            </button>
          )}
        </div>
      </div>
      {!onFilterClick && <FilterComponent />}
    </>
  );
};

export default BottomNavigation;

const iconsClassName = "size-6";
const bottomNavigationItems = [
  {
    title: "Home",
    link: Routes.Home,
    icon: <HomeIcon className="size-7 shrink-0" />,
  },
  {
    title: "AI Chat",
    link: Routes.Chat,
    icon: <ChatgptIcon className="size-7" />,
  },
  {
    title: "Profile",
    link: Routes.Profile,
    icon: <UserIcon className="size-7" />,
  },
  // {
  //   title: "Restaurant",
  //   link: Routes.Restaurants,
  //   icon: <FishFoodIcon className="size-7 shrink-0" />,
  // },
  // {
  //   title: "Meals",
  //   link: Routes.Meals,
  //   icon: <BreadIcon className="size-7 shrink-0" />,
  // },
  // {
  //   title: "Compare",
  //   link: Routes.Compare,
  //   icon: <DishIcon className="size-7 shrink-0" />,
  // },
];
