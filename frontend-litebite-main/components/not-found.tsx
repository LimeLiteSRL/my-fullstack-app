import React from "react";
import { AlertIcon } from "./icons/icons";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-1 opacity-90">
      <AlertIcon className="size-5" />
      <span className="text-sm">Not Found</span>
    </div>
  );
};

export default NotFound;
