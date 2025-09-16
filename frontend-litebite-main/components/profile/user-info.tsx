/* eslint-disable @next/next/no-img-element */
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/libs/query-client";
import { LogoutIcon, SettingsIcon, UserCircleIcon } from "../icons/icons";
import { Routes } from "@/libs/routes";
import useAuthStore from "@/libs/store/auth-store";
import useProfileStore from "@/libs/store/profile-store";
import { useRouter } from "next/navigation";

const UserInfo = ({
  username,
  phone,
  profilePicture,
}: {
  username: string;
  phone: string;
  profilePicture?: string | null;
}) => {
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
    <Popover>
      <PopoverTrigger>
        <div className="flex items-center gap-2">
          {profilePicture ? (
            <div className="size-10 overflow-hidden rounded-full bg-heavy/40">
              <img
                src={profilePicture + "?id=" + Math.random()}
                className="h-full w-full object-cover"
                alt="profile"
              />
            </div>
          ) : (
            <UserCircleIcon className="size-8" />
          )}
          <div>{username || phone}</div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-52 rounded-2xl p-2" align="start">
        <div>
          <div className="w-full border-offWhite text-center">
            <div className="font-light">{username}</div>
            <div className="rounded-full py-1 text-sm text-heavy">{phone}</div>
          </div>
          {/* <Button
            onClick={() => router.push(Routes.UserSettings)}
            className="w-full shrink-0 justify-start gap-2 p-0 text-sm font-normal"
            variant="ghost"
          >
            <SettingsIcon className="size-5" />
            settings
          </Button> */}
          {/* <div className="border-b border-offWhite"></div> */}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserInfo;
