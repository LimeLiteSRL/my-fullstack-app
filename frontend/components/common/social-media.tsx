import {
  FacebookIcon,
  InstagramIcon,
  TelegramIcon,
  TwitterIcon,
} from "@/components/icons/icons";
import Link from "next/link";

const SocialMedia = () => {
  return (
    <div className="flex items-center justify-center gap-4">
      {social_list.map((item, index) => (
        <Link
          href={item.url}
          key={index}
          target="_blank"
          className="flex h-14 w-14 items-center justify-center rounded-full text-neutral-800"
        >
          {item.icon}
        </Link>
      ))}
    </div>
  );
};

export default SocialMedia;

const social_list = [
  {
    title: "Instagram",
    icon: <InstagramIcon className="size-7" />,
    url: "https://www.instagram.com/litebite.ai/",
  },
  {
    title: "Twitter",
    icon: <TwitterIcon className="size-7" />,
    url: "https://x.com/litebite_ai",
  },
  // {
  //   title: "Telegram",
  //   icon: <TelegramIcon className="size-7" />,
  //   url: "",
  // },
  // {
  //   title: "Facebook",
  //   icon: <FacebookIcon className="size-7" />,
  //   url: "",
  // },
];
