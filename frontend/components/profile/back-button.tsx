"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { ArrowLeftIcon } from "../icons/icons";
import { Routes } from "@/libs/routes";

const BackButton = () => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(Routes.Profile)}
      className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-white"
    >
      <ArrowLeftIcon className="size-5" />
    </button>
  );
};

export default BackButton;
