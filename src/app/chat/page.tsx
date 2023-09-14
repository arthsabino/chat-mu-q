"use client";
import { mdBreakpoint } from "@/util/tailwind";
import { useUser } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Chat, LoadingIndicator } from "stream-chat-react";
import ChatChannel from "../components/Chat/ChatChannel";
import Sidebar from "../components/Chat/Sidebar";
import { useChatClient } from "../hooks/chatClient";
import useWindowSize from "../hooks/screen";
export default function ChatPage() {
  const { chatClient } = useChatClient();
  const { user } = useUser();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showChannel, setShowChannel] = useState(false);
  const windowSize = useWindowSize();

  const isLargeScreen = windowSize.width >= mdBreakpoint;

  useEffect(() => {
    if (windowSize.width >= mdBreakpoint) {
      setShowSidebar(false);
    }
  }, [windowSize.width]);

  const handleSidebarClose = useCallback(() => {
    setShowSidebar(false);
  }, []);

  if (chatClient === null || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingIndicator size={40} />
      </div>
    );
  }
  return (
    <div className="h-screen bg-gray-50 xl:px-20 xl:py-8">
      <div className="m-auto flex h-full min-w-[350px] max-w-[1600px] flex-col shadow-sm">
        <Chat client={chatClient}>
          <div className="flex justify-center border-b border-b-[#DBDDE1] p-3 md:hidden">
            <button onClick={() => setShowSidebar(!showSidebar)}>
              {!showSidebar ? (
                <span className="flex items-center gap-1">
                  <Menu />
                </span>
              ) : (
                <X />
              )}
            </button>
          </div>
          <div className="flex h-full flex-row overflow-y-auto">
            <Sidebar
              user={user}
              show={isLargeScreen || showSidebar}
              onClose={handleSidebarClose}
            />
            <ChatChannel
              show={isLargeScreen || showChannel}
              hideChannelOnThread={!isLargeScreen}
            />
          </div>
        </Chat>
      </div>
    </div>
  );
}
