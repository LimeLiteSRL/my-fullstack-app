"use client";

import { useEffect, useState } from "react";
import { ArrowLeftIcon } from "@/components/icons/icons";
import { useRouter } from "next/navigation";
import Chat from "./chat/chat-bot";

const ChatRoom = () => {
  const [messages, setMassages] = useState<any>();

  useEffect(() => {
    const msgs = sessionStorage.getItem("chat");

    if (msgs) {
      setMassages(JSON.parse(msgs));
    }
  }, []);
  const router = useRouter();
  return (
    <div className="mx-auto h-full p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Chat</h1>
        <div></div>
      </div>
      <Chat id="" initialMessages={messages} />
    </div>
  );
};

export default ChatRoom;
