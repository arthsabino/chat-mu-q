"use client";
import {
  getCurrentPushSubscription,
  sendPushSubscriptionToServer,
} from "@/notifications/pushService";
import { registerServiceWorker } from "@/util/serviceWorker";
import { mdBreakpoint } from "@/util/tailwind";
import { useUser } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Chat, LoadingIndicator, Streami18n } from "stream-chat-react";
import { useTheme } from "../ThemeProvider";
import ChatChannel from "../components/Chat/ChatChannel";
import PushMessageListener from "../components/Chat/PushMessageListener";
import Sidebar from "../components/Chat/Sidebar";
import { useChatClient } from "../hooks/chatClient";
import useWindowSize from "../hooks/screen";
const i18nInstance = new Streami18n({ language: "en" });

interface ChatPageProps {
  searchParams: { channelId?: string };
}
export default function ChatPage({
  searchParams: { channelId },
}: ChatPageProps) {
  const { chatClient } = useChatClient();
  const { theme } = useTheme();
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

  useEffect(() => {
    const setupServiceWorker = async () => {
      try {
        await registerServiceWorker();
      } catch (error) {
        console.error(error);
      }
    };
    setupServiceWorker();
  }, []);

  useEffect(() => {
    const syncPushSubscription = async () => {
      try {
        const subscription = await getCurrentPushSubscription();
        if (subscription) {
          await sendPushSubscriptionToServer(subscription);
        }
      } catch (error) {
        console.error(error);
      }
    };
    syncPushSubscription();
  }, []);

  useEffect(() => {
    if (channelId) {
      history.replaceState(null, "", "/chat");
    }
  }, [channelId]);

  const handleSidebarClose = useCallback(() => {
    setShowSidebar(false);
  }, []);

  if (chatClient === null || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-black">
        <LoadingIndicator size={40} />
      </div>
    );
  }
  return (
    <div className="h-screen bg-gray-100 text-black dark:bg-black dark:text-white xl:px-20 xl:py-8">
      <div className="m-auto flex h-full min-w-[350px] max-w-[1600px] flex-col shadow-sm">
        <Chat
          client={chatClient}
          theme={
            theme === "dark" ? "str-chat__theme-dark" : "str-chat__theme-light"
          }
          i18nInstance={i18nInstance}
        >
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
              customActiveChannel={channelId}
            />
            <ChatChannel
              show={isLargeScreen || showChannel}
              hideChannelOnThread={!isLargeScreen}
            />
          </div>
          <PushMessageListener />
        </Chat>
      </div>
    </div>
  );
}
