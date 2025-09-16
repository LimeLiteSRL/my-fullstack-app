import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShareIcon } from "../icons/icons";
import ShareDialog from "../common/share-dialog";

const ShareRestaurant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const shareUrl = `https://lite-bite.vercel.app/restaurants?id=${id}`;
  const handleShare = () => {
    setIsOpen(true);
  };
  return (
    <div>
      <button
        onClick={handleShare}
        className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-white"
      >
        <ShareIcon className="size-5 text-heavy" />
      </button>
      <ShareDialog shareURL={shareUrl} setIsOpen={setIsOpen} isOpen={isOpen} />
    </div>
  );
};

export default ShareRestaurant;
