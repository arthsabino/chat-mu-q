import { FC } from "react";
import {
  Channel,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import CustomChannelHeader from "./CustomChannelHeader";

interface ChatChannelProps {
  show: boolean;
  hideChannelOnThread: boolean;
}

const ChatChannel: FC<ChatChannelProps> = ({ show, hideChannelOnThread }) => {
  return (
    <div className={`h-full w-full ${show ? "block" : "hidden"}`}>
      <Channel>
        <Window hideOnThread={hideChannelOnThread}>
          <CustomChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </div>
  );
};

export default ChatChannel;
