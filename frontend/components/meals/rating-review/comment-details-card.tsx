import { cn, shortenString } from "@/libs/utils";
import HealthRate from "./healthy-review";
import TasteRate from "./taste-rate";
import { UserIcon } from "@/components/icons/icons";

interface IComment {
  userName?: string;
  healthRate?: number;
  tasteRate?: number;
  comment: string;
}
const CommentDetailsCard = ({
  comment,
  rtl = false,
}: {
  comment: IComment;
  rtl?: boolean;
}) => {
  return (
    <div
      className={cn(
        "w-[350px] overflow-hidden rounded-2xl bg-offWhite/40 p-4",
        rtl && "bg-thirdColor",
      )}
    >
      <div className={"flex items-center justify-between gap-2"}>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-white">
            <UserIcon className="size-5" />
          </div>
          <span>{shortenString(comment.userName || "user", 20)}</span>
        </div>
        <div className="flex items-center gap-2 text-heavy">
          <HealthRate iconSize={4} rate={comment.healthRate || 0} />
          <TasteRate iconSize={4} rate={comment.tasteRate || 0} />
        </div>
      </div>
      <div className="mt-3 text-wrap break-all text-heavy">
        {shortenString(comment.comment, 85)}
      </div>
    </div>
  );
};

export default CommentDetailsCard;
