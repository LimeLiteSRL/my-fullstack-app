import { InformationCircleIcon } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="flex h-fit flex-col items-center gap-2">
        <InformationCircleIcon className="size-10 text-heavy" />
        <h3 className="text-lg font-semibold">404 Not Found</h3>
        <p>Could not find the page.</p>
        <Button asChild>
          <Link href="/">Back Home</Link>
        </Button>
      </div>
    </div>
  );
}
