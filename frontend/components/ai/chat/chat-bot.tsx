"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useEffect, useState } from "react";
import { BASE_API_URL } from "@/config";
import useAuthStore from "@/libs/store/auth-store";
import { useScrollToBottom } from "./use-scroll-to-bottom";
import { Overview } from "./overview";
import { Message as PreviewMessage } from "./message";
import { MultimodalInput } from "./multimodal-input";
import useUiStore from "@/libs/store/ui-store";

export default function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<Message>;
}) {
  const token = useAuthStore((s) => s.token);
  const { messageCount, setMessageCount } = useUiStore();
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
    useChat({
      headers: {
        authorization: token ? "Bearer " + token : "",
      },
      api: BASE_API_URL + "/ai",
      body: { id },
      initialMessages,
      onFinish: (e) => {
        setMessageCount(messageCount + 1);
      },
    });

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("chat", JSON.stringify(messages));
    }
  }, [messages]);

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <div className="bg-background flex h-full flex-row justify-center pb-4 md:pb-8">
      <div className="flex h-full flex-col items-center justify-between gap-4">
        <div
          ref={messagesContainerRef}
          className="flex h-full w-dvw flex-col items-center gap-6 overflow-y-scroll"
        >
          {messages.length === 0 && (
            <Overview messages={messages} append={append} />
          )}

          {messages.map((message, index) => (
            <PreviewMessage
              key={`${id}-${index}`}
              role={message.role}
              content={message.content}
              attachments={message.experimental_attachments}
              toolInvocations={message.toolInvocations}
            />
          ))}
          <div
            ref={messagesEndRef}
            className="min-h-[24px] min-w-[24px] shrink-0"
          />
        </div>

        <form className="max-w-[calc(100dvw-32px) relative flex w-full flex-row items-end gap-2 px-4 md:max-w-[600px] md:px-0">
          <MultimodalInput
            input={input}
            setInput={setInput}
            handleSubmit={
              messageCount === 3 && !token
                ? () => {
                    return;
                  }
                : handleSubmit
            }
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            append={append}
          />
        </form>
      </div>
    </div>
  );
}
