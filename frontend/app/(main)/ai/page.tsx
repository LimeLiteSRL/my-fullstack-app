"use client";

import ChatRoom from "@/components/ai/chat-room";
import Introduction from "@/components/ai/introduction";
import useUiStore from "@/libs/store/ui-store";

export default function Page() {
  const { hasSeenAiFirstPage } = useUiStore();

  return hasSeenAiFirstPage ? (
    <div className="h-full">
      <ChatRoom />
    </div>
  ) : (
    <div className="h-full">
      <Introduction />
    </div>
  );
}
