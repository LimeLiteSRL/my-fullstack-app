import { ResponsiveDialog } from "../responsive-dialog";
import { Input } from "../ui/input";
import CopyButton from "../common/copy-button";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
} from "next-share";
import {
  FacebookIcon,
  TelegramIcon,
  TwitterIcon,
  WhatsappIcon,
} from "../icons/icons";

const ShareDialog = ({
  isOpen,
  setIsOpen,
  shareURL,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  shareURL: string;
}) => {
  return (
    <ResponsiveDialog title="Share this page" open={isOpen} setOpen={setIsOpen}>
      <div className="flex items-center gap-2">
        <Input value={shareURL} readOnly />
        <CopyButton iconClassName="size-7" text={shareURL} />
      </div>
      <div className="mt-4 flex justify-center gap-4 overflow-auto">
        <FacebookShareButton title="Share healthy meal" url={shareURL}>
          <FacebookIcon className="size-10 text-[#44479A]" />
        </FacebookShareButton>
        <TwitterShareButton title="Share healthy meal" url={shareURL}>
          <TwitterIcon className="size-10 text-black" />
        </TwitterShareButton>
        <WhatsappShareButton title="Share healthy meal" url={shareURL}>
          <WhatsappIcon className="size-10 text-[#00E764]" />
        </WhatsappShareButton>
        <TelegramShareButton title="Share healthy meal" url={shareURL}>
          <TelegramIcon className="size-10 text-[#00A7E5]" />
        </TelegramShareButton>
      </div>
    </ResponsiveDialog>
  );
};

export default ShareDialog;
