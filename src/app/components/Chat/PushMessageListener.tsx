import { useEffect } from "react";
import { useChatContext } from "stream-chat-react";

const PushMessageListener = () => {
  const { client, setActiveChannel } = useChatContext();

  useEffect(() => {
    const messageListener = async (event: MessageEvent) => {
      console.log("Received message from service worker", event.data);

      const channelId = event.data.channelId;

      if (channelId) {
        const res = await client.queryChannels({ id: channelId });
        if (res.length > 0) {
          setActiveChannel(res[0]);
        } else {
          console.error("PushMessageListener: Channel not found.");
        }
      }
    };

    navigator.serviceWorker.addEventListener("message", messageListener);
    return () =>
      navigator.serviceWorker.removeEventListener("message", messageListener);
  }, [client, setActiveChannel]);
  return null;
};

export default PushMessageListener;
