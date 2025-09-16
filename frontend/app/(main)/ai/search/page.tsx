"use client";

import { ArrowLeftIcon, SendFillIcon } from "@/components/icons/icons";
import MealCard from "@/components/meals/meal-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { mealsHook } from "@/libs/endpoints/meals/meals-endpoints";
import useLocationStore from "@/libs/store/location-store";
import { mapMealToISingleMeal } from "@/libs/utils";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [input, setInput] = useState("");
  const [isSend, setIsSend] = useState(false);
  const [messages, setMessages] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };
  const { userLocation, fetchingLocation, distance } = useLocationStore();

  const { data, isLoading, isFetched, isFetching } =
    mealsHook.useQueryMealSearchByAi(
      {
        queries: {
          longitude: fetchingLocation.lng,
          latitude: fetchingLocation.lat,
          maxDistance: 1000,
          // ...(searchText ? { name: searchText } : null),
          // ...filterParams,
          prompt: input,
          limit: 5,
        },
      },
      {
        staleTime: 5 * 60 * 1000,
        // cacheTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: isSend,
      },
    );

  const handleSubmit = () => {
    setIsSend(true);
    setMessages(input);
    setInput("");
  };

  useEffect(() => {
    if (isFetched && !isLoading) {
      setIsSend(false);
    }
  }, [isFetched, isLoading]);

  return (
    <div className="flex min-h-full flex-col justify-between p-4">
      <div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-white"
          >
            <ArrowLeftIcon className="size-5" />
          </button>
          <h3 className="text-lg font-semibold">Search Meal by AI</h3>
          <div></div>
        </div>
        <div className="flex h-full w-full flex-col gap-3 overflow-y-auto p-4">
          {!!messages && (
            <div className="ms-auto w-fit rounded-s-2xl rounded-tr-2xl bg-offWhite p-4">
              {messages}
            </div>
          )}
          {!!messages && isLoading && (
            <div className="flex flex-col items-center gap-3">
              <MealCard isLoading className="w-full" variant="small" />
              <MealCard isLoading className="w-full" variant="small" />
              <MealCard isLoading className="w-full" variant="small" />
            </div>
          )}
          {data?.data.flatMap((restaurant) =>
            restaurant.menu
              .map((item) => mapMealToISingleMeal(item, restaurant))
              .map((meal) => (
                <MealCard
                  className="w-full"
                  key={meal.id}
                  meal={meal}
                  variant="small"
                />
              )),
          )}
        </div>
      </div>
      <div className="flex items-end justify-between overflow-hidden rounded-3xl border bg-white p-2">
        <Textarea
          ref={textareaRef}
          placeholder="Send a message..."
          value={input}
          onChange={handleInput}
          className="min-h-[27px] resize-none border-none p-0 text-base font-light outline-none !ring-0"
          rows={1}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();

              if (isFetching || input.length === 0) {
                toast.error(
                  "Please wait for the model to finish its response!",
                );
              } else {
                handleSubmit();
              }
            }
          }}
        />

        <Button
          className="h-fit rounded-full bg-offWhite p-1.5"
          onClick={(event) => {
            handleSubmit();
          }}
          disabled={input.length === 0 || isLoading}
        >
          <SendFillIcon className="size-5 text-secondary" />
        </Button>
      </div>
    </div>
  );
}
