import { motion } from "framer-motion";

import { ChatRequestOptions, CreateMessage, Message } from "ai";
import useProfileStore from "@/libs/store/profile-store";

const suggestedActions = [
  {
    title: "“How much protein is in a turkey sandwich?”",
    label: "How to cook Doner kebab",
    action: "Doner kebab Recipe",
  },
  {
    title: "“What’s a low-calorie breakfast option under 300 calories?”",
    label: "in San Francisco?",
    action: "what is the weather in San Francisco?",
  },
  {
    title: "“I drank 2 liters of water today”",
    label: "why is the sky blue?",
    action: "Answer like I'm 5, why is the sky blue?",
  },
  {
    title: "“I had a small burger with fries for lunch.”",
    label: "why is the sky blue?",
    action: "Answer like I'm 5, why is the sky blue?",
  },
];

export const Overview = ({
  messages,
  append,
}: {
  messages: Array<Message>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}) => {
  const { username } = useProfileStore();

  return (
    <div className="mt-16 w-full max-w-[500px] space-y-4 p-6">
      <motion.div
        key="overview"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ delay: 0.5 }}
      >
        <div className="">
          {/* <MessageIcon /> LiteBite */}
          <h5 className="text-lg">
            Welcome back {username && `, ${username}`}
          </h5>
          <h6 className="text-lg font-medium">How can I help you?</h6>
        </div>
      </motion.div>
      {messages.length === 0 && (
        <div className="mx-auto w-full space-y-3">
          {suggestedActions.map((suggestedAction, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.05 * index }}
              key={index}
              // className={index > 1 ? "hidden sm:block" : "block"}
            >
              <button
                onClick={async () => {
                  append({
                    role: "user",
                    content: suggestedAction.title,
                  });
                }}
                className="flex w-full flex-col rounded-xl p-4 text-left font-light shadow-4xl"
              >
                <span>{suggestedAction.title}</span>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
