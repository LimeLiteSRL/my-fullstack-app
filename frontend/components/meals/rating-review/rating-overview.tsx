import React, { useState } from "react";
import { CommentFillIcon, HeartFillIcon, LeafIcon } from "../../icons/icons";
import { Button } from "../../ui/button";
import RatingDialog from "./rating-dialog";
import TasteRate from "./taste-rate";
import HealthRate from "./healthy-review";

const RatingOverview = ({
  tasteRate,
  healthRate,
  totalReview,
  foodId,
  refetch,
}: {
  tasteRate: number;
  healthRate: number;
  totalReview: number;
  foodId: string;
  refetch?: () => void;
}) => {
  const [isOen, setIsOpen] = useState(false);

  return (
    <div className="flex w-full items-center justify-between rounded-3xl border p-2">
      <div className="flex items-center gap-3">
        <TasteRate rate={tasteRate} iconSize={6} />
        <HealthRate rate={healthRate} iconSize={6} />
        <div className="flex items-center gap-1">
          <CommentFillIcon className="size-6 text-thirdColor" />
          <span className="font-semibold">{totalReview}</span>
        </div>
      </div>
      <Button onClick={() => setIsOpen(true)} variant="pale">
        Ratings & Reviews
      </Button>
      <RatingDialog
        refetch={refetch}
        isOpen={isOen}
        setIsOpen={setIsOpen}
        foodId={foodId}
      />
    </div>
  );
};

export default RatingOverview;
