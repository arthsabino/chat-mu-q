import { useUser } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";
import { Bell, BellOff } from "lucide-react";
import { FC } from "react";
import {
  ChannelHeader,
  ChannelHeaderProps,
  useChannelActionContext,
  useChannelStateContext,
} from "stream-chat-react";

const CustomChannelHeader: FC<ChannelHeaderProps> = (props) => {
  const { user } = useUser();
  const {
    channel: { id: channelId },
  } = useChannelStateContext();
  return (
    <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#17191c]">
      <ChannelHeader {...props} />
      {user && channelId && (
        <ChannelNotificationBtn user={user} channelId={channelId} />
      )}
    </div>
  );
};

interface ChannelNotificationBtnProps {
  user: UserResource;
  channelId: string;
}

const ChannelNotificationBtn: FC<ChannelNotificationBtnProps> = ({
  user,
  channelId,
}) => {
  const { addNotification } = useChannelActionContext();
  const mutedChannels = user.unsafeMetadata.mutedChannels || [];

  const channelMuted = mutedChannels?.includes(channelId);

  const setChannelMuted = async (channelId: string, muted: boolean) => {
    try {
      let mutedChannelsUpdate: string[];

      if (muted) {
        mutedChannelsUpdate = [...mutedChannels, channelId];
      } else {
        mutedChannelsUpdate = mutedChannels.filter((id) => id !== channelId);
      }

      await user.update({
        unsafeMetadata: {
          mutedChannels: mutedChannelsUpdate,
        },
      });

      addNotification(
        `Channel notifications ${muted ? "muted" : "unmuted"}`,
        "success"
      );
    } catch (error) {
      console.error(error);

      addNotification("Something went wrong. Please try agian", "error");
    }
  };

  return (
    <div className="me-6">
      {!channelMuted ? (
        <span title="Mute Channel notifications">
          <BellOff
            className="cursor-pointer"
            onClick={() => setChannelMuted(channelId, true)}
          />
        </span>
      ) : (
        <span title="Unmute Channel notifications">
          <Bell
            className="cursor-pointer"
            onClick={() => setChannelMuted(channelId, false)}
          />
        </span>
      )}
    </div>
  );
};

export default CustomChannelHeader;
