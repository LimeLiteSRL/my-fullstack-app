/* eslint-disable @next/next/no-img-element */
"use client";

import {
  LogoutIcon,
  SettingsIcon,
  UserCircleIcon,
} from "@/components/icons/icons";
import MealHistory from "@/components/profile/meal-history/meal-history";
import Statistics from "@/components/profile/statistics/statistics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import { Routes } from "@/libs/routes";
import useAuthStore from "@/libs/store/auth-store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Notifications from "@/components/profile/notifications";
import { timezoneOffset } from "@/libs/utils";
import useProfileStore from "@/libs/store/profile-store";
import { DotsLoading } from "@/components/icons/three-dots-loading";
import UserInfo from "@/components/profile/user-info";
import AppInfo from "@/components/profile/app-info";
import ProfileDrawer from "@/components/profile/profile-drawer";
import { useRequireAuth } from "@/libs/hooks/use-auth-guard";

type ITabs = "statistics" | "meal-history";

export default function Page() {
  const { isAuthenticated, isValidating } = useRequireAuth();
  const [selectedTab, setSelectedTab] = useState<ITabs>("statistics");
  const router = useRouter();

  const { data, isLoading, error } = usersHook.useQueryUserProfile({
    queries: {
      timezoneOffset: timezoneOffset(),
    },
  });

  const nutritional = data?.nutritionalInformation;

  const { token } = useAuthStore();
  const user = data?.user;
  const { setUsername, setUser } = useProfileStore();

  useEffect(() => {
    if (!!token) {
      setUsername(user?.name || "");
      setUser(user);
    } else {
      router.push(Routes.Login);
      setUsername("");
      setUser(undefined);
    }
  }, [token, router, user, setUsername, setUser]);

  // Show loading while validating authentication
  if (isValidating || isAuthenticated === null) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <DotsLoading className="w-10" />
      </div>
    );
  }

  // If not authenticated, the useRequireAuth hook will redirect to login
  if (!isAuthenticated) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <DotsLoading className="w-10" />
      </div>
    );
  }

  return (
    <div className="min-h-full p-6">
      <div className="mb-10 flex w-full items-center justify-between">
        <UserInfo
          profilePicture={user?.profilePicture}
          username={user?.name || ""}
          phone={user?.phone || ""}
        />
        <div className="flex items-center gap-3">
          <Notifications />
          <AppInfo />
          <ProfileDrawer />
        </div>
      </div>

      <Tabs
        value={selectedTab}
        onValueChange={(e) => setSelectedTab(e as ITabs)}
      >
        <TabsList className="w-full border">
          <TabsTrigger className="w-full" value="statistics">
            Statistics
          </TabsTrigger>
          <TabsTrigger className="w-full" value="meal-history">
            Meal History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="statistics">
          <Statistics
            user={user}
            isLoading={isLoading}
            nutritional={nutritional}
          />
        </TabsContent>
        <TabsContent value="meal-history">
          <MealHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
