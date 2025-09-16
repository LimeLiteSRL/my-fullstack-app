"use client";
import { cn } from "@/libs/utils";
import { useState } from "react";
import { CheckmarkSquareIcon, CopyIcon } from "../icons/icons";

type propType = {
  text: string;
  iconClassName?: string;
  className?: string;
};

export default function CopyButton({
  text,
  iconClassName,
  className,
}: propType) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyToClipboard = (text: string) => {
    setIsCopied(true);
    navigator.clipboard.writeText(text);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <button
      className={cn("w-fit", className)}
      onClick={() => handleCopyToClipboard(text)}
    >
      {isCopied ? (
        <CheckmarkSquareIcon
          className={cn(
            "size-5 text-neutral-600 dark:text-neutral-400",
            iconClassName,
          )}
        />
      ) : (
        <CopyIcon
          className={cn(
            "size-5 text-neutral-600 dark:text-neutral-400",
            iconClassName,
          )}
        />
      )}
    </button>
  );
}
