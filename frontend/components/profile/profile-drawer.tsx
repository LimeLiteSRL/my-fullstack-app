import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "../ui/button";
import {
  GoogleDocIcon,
  LogoutIcon,
  MenuIcon,
  PrivacyIcon,
  SettingsIcon,
} from "../icons/icons";
import Link from "next/link";
import { Routes } from "@/libs/routes";
import useAuthStore from "@/libs/store/auth-store";
import useProfileStore from "@/libs/store/profile-store";
import { useRouter } from "next/navigation";
import { queryClient } from "@/libs/query-client";
import { cn } from "@/libs/utils";
import SocialMedia from "../common/social-media";

const ProfileDrawer = () => {
  const { setToken } = useAuthStore();
  const { setUser } = useProfileStore();
  const router = useRouter();

  const handleLogout = () => {
    setToken("");
    setUser(undefined);
    router.push(Routes.Login);
    sessionStorage.removeItem("chat");
    queryClient.clear();
  };
  return (
    <Sheet>
      <SheetTrigger>
        <MenuIcon className="size-7" />
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Lite Bite</SheetTitle>
          <SheetDescription>
            {/* Make changes to your profile here. Click save when you are done. */}
          </SheetDescription>
        </SheetHeader>
        <div className="relative flex h-full flex-col">
          <div className="my-4 flex flex-col gap-2">
            {menu_list.map((item, index) => (
              <>
                <Link
                  key={index}
                  href={item.url}
                  className={cn(
                    "flex w-full items-center gap-1 rounded-xl px-2 py-2 text-sm hover:bg-offWhite",
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
                {index !== menu_list.length - 1 && (
                  <div className="border-b"></div>
                )}
              </>
            ))}
            <div className="border-t">
              <Button
                onClick={handleLogout}
                className="h-auto w-full shrink-0 justify-start gap-2 px-2 py-4 text-sm font-normal"
                variant="ghost"
              >
                <LogoutIcon className={iconClassName} />
                Logout
              </Button>
            </div>
          </div>
          <div className="absolute bottom-6 right-1/2 translate-x-1/2">
            <SocialMedia />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileDrawer;
const iconClassName = "size-5 text-neutral-800";
const menu_list = [
  {
    title: "Settings",
    icon: <SettingsIcon className={iconClassName} />,
    url: Routes.UserSettings,
  },
  {
    title: "Privacy Policy",
    icon: <PrivacyIcon className={iconClassName} />,
    url: Routes.Privacy,
  },
  // {
  //   title: "About us",
  //   icon: <GoogleDocIcon className={iconClassName} />,
  //   url: Routes.Home,
  // },
];
