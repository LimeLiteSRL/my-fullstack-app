"use client";

import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode } from "react";

import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";
import NutritionalInfoTable from "./nutritional-info-table";
import WaterIntake from "./water-intake";
import RecipeInfo from "./recipe";
import { cn } from "@/libs/utils";

export const Message = ({
  role,
  content,
  toolInvocations,
  attachments,
}: {
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
}) => {
  return (
    <motion.div
      className={cn(
        `flex w-full flex-row gap-4 px-4 first-of-type:pt-20 md:w-[500px] md:px-0`,
        role === "assistant" ? "" : "flex-row-reverse gap-2",
      )}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex size-[24px] shrink-0 flex-col items-center justify-center text-zinc-400">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div
        className={cn(
          "flex w-full flex-col gap-2",
          role === "assistant" ? "" : "w-fit rounded-xl bg-offWhite px-4 py-2",
        )}
      >
        {content && (
          <div className="flex flex-col gap-4 text-zinc-800 dark:text-zinc-300">
            <Markdown>{content as string}</Markdown>
          </div>
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === "result") {
                const { result } = toolInvocation;

                return (
                  <div key={toolCallId}>
                    {{
                      // getFoodNutrition: <div>{console.log(result.data.nutrition)}</div>,
                      getFoodNutrition: (
                        <NutritionalInfoTable
                          nutritionInfo={result?.nutrition}
                          foodItem={result.foodItem}
                        />
                      ),
                      getFoodRecipe: (
                        <RecipeInfo
                          nutritionInfo={result?.nutrition}
                          foodItem={result.foodItem}
                        />
                      ),
                      calculateWaterIntake: (
                        <WaterIntake amountMl={result?.amountMl} />
                      ),
                    }[toolName] || ""}
                  </div>
                );
              } else {
                return (
                  <div key={toolCallId} className="skeleton">
                    {toolName === "getWeather" ? <Weather /> : null}
                    {/* {toolName === "getExistingRecipe" ? <div></div> : null} */}
                  </div>
                );
              }
            })}
          </div>
        )}

        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
