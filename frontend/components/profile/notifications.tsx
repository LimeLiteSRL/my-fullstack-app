import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usersHook } from "@/libs/endpoints/users/users-endpoints";
import {
  ArrowRightIcon,
  MessageDoneIcon,
  MessageNotificationIcon,
  MessagePreviewIcon,
  NotificationIcon,
} from "../icons/icons";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/libs/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { INotification } from "@/libs/endpoints/users/users-schema";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Routes } from "@/libs/routes";
import { formatDistanceToNow } from "date-fns";
import { queryClient } from "@/libs/query-client";

const Notifications = () => {
  const { data, isLoading } = usersHook.useQueryNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<INotification | undefined>(undefined);

  const unReadNotifications = useMemo(() => {
    return (
      data?.data.filter((notification) => !notification.isRead).length || 0
    );
  }, [data]);

  const readNotificationsMutation = usersHook.useReadNotificationsMutation({
    params: {
      notificationId: message?._id || "",
    },
  });

  const readAllNotificationsMutation =
    usersHook.useReadAllNotificationsMutation();

  const handleShowMessage = (data: INotification) => {
    setIsOpen(true);
    setMessage(data);
    readNotificationsMutation.mutate(undefined);
  };

  const handleReadAll = () => {
    readAllNotificationsMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries(
          usersHook.getKeyByAlias("queryNotifications"),
        );
      },
    });
  };

  return (
    <>
      <Popover>
        <PopoverTrigger>
          <div className="relative">
            <NotificationIcon className="size-7 rotate-12 text-neutral-800" />
            {!!unReadNotifications && (
              <div className="absolute end-0.5 top-1.5 size-2 rounded-full bg-error"></div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-60 rounded-xl pb-0">
          <div className="mb-2 flex w-full items-center justify-between border-b pb-1">
            <div className="flex items-center gap-1">
              <div className="font-medium">Notifications</div>
              <span className="flex size-6 items-center justify-center rounded-full bg-offWhite text-xs">
                {data?.data.length}
              </span>
            </div>
            <button onClick={handleReadAll}>
              <MessageDoneIcon className="size-6 text-neutral-700" />
            </button>
          </div>
          <div className="flex max-h-[350px] w-full flex-col items-center gap-2 overflow-auto">
            {isLoading
              ? [...Array(3)].map((message, i) => (
                  <div
                    key={i}
                    className="flex w-full items-center gap-2 border-b pb-2"
                  >
                    <div className="flex size-8 animate-pulse items-center justify-center rounded-full bg-offWhite"></div>
                    <Skeleton className="h-4 w-[140px]" />
                  </div>
                ))
              : data?.data.map((data) => {
                  const timeAgo = formatDistanceToNow(
                    new Date(data.createdAt),
                    { addSuffix: true },
                  );
                  return (
                    <button
                      onClick={() => handleShowMessage(data)}
                      key={data._id}
                      className="flex w-full items-center gap-2 border-b pb-2"
                    >
                      <div className="flex size-10 items-center justify-center rounded-full bg-offWhite/70">
                        {data.isRead ? (
                          <MessagePreviewIcon className="size-6 shrink-0 text-neutral-600" />
                        ) : (
                          <MessageNotificationIcon
                            className={cn("size-6 shrink-0 text-green-500")}
                          />
                        )}
                      </div>
                      <div className="text-start">
                        <div className="text-sm">
                          {data.isRead ? "Message Viewed" : "New Message"}
                        </div>
                        <div className="text-xs text-heavy">
                          {timeAgo.replace("about ", "")}
                        </div>
                      </div>
                    </button>
                  );
                })}
            {!data?.data.length && !isLoading && (
              <div className="p-4 pb-6 text-sm text-heavy">
                No notifications found.
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <MessageDialog data={message} isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default Notifications;

const MessageDialog = ({
  data,
  isOpen,
  setIsOpen,
}: {
  data: INotification | undefined;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) => {
  if (!data) return null;

  const getDialogContent = () => {
    switch (data.type) {
      case "food-review":
        return (
          <>
            <DialogHeader className="space-y-3 text-start">
              <DialogTitle>Review Your Food</DialogTitle>
              <DialogDescription>
                You have added {"this food"} to your profile. Please share your
                review about this food.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button asChild>
                <Link
                  href={{
                    pathname: Routes.Meals,
                    query: { id: data.meta },
                  }}
                  className="flex items-center"
                >
                  Review the Meal
                  <ArrowRightIcon className="size-5" />
                </Link>
              </Button>
            </DialogFooter>
          </>
        );
      case "success":
        return (
          <>
            <DialogHeader className="space-y-3">
              <DialogTitle>Success!</DialogTitle>
              <DialogDescription>
                {data.description || "Your action was successful."}
              </DialogDescription>
            </DialogHeader>
          </>
        );
      case "error":
        return (
          <>
            <DialogHeader className="space-y-3">
              <DialogTitle>Error</DialogTitle>
              <DialogDescription>
                {data.description || "An error occurred."}
              </DialogDescription>
            </DialogHeader>
          </>
        );
      case "info":
        return (
          <>
            <DialogHeader className="space-y-3">
              <DialogTitle>Information</DialogTitle>
              <DialogDescription>
                {data.description || "Here is some information."}
              </DialogDescription>
            </DialogHeader>
          </>
        );
      case "warning":
        return (
          <>
            <DialogHeader className="space-y-3">
              <DialogTitle>Warning</DialogTitle>
              <DialogDescription>
                {data.description || "This is a warning."}
              </DialogDescription>
            </DialogHeader>
          </>
        );
      default:
        return (
          <>
            <DialogHeader className="space-y-3">
              <DialogTitle>Notification</DialogTitle>
              <DialogDescription>
                {data.description || "You have a new notification."}
              </DialogDescription>
            </DialogHeader>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[350px] rounded-xl sm:max-w-[450px]">
        {getDialogContent()}
      </DialogContent>
    </Dialog>
  );
};
