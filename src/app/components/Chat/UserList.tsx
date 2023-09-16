import useDebounce from "@/app/hooks/debounce";
import { UserResource } from "@clerk/types";
import { ArrowLeft } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { Channel, UserResponse } from "stream-chat";
import {
  Avatar,
  LoadingChannels as LoadingUsers,
  useChatContext,
} from "stream-chat-react";
import LoadingButton from "../Buttons/LoadingButton";
interface UserListProps {
  currentUser: UserResource;
  onClose: () => void;
  onChannelSelected: () => void;
}

const UserList: FC<UserListProps> = ({
  currentUser,
  onClose,
  onChannelSelected,
}) => {
  const { client, setActiveChannel } = useChatContext();
  const [list, setList] = useState<(UserResponse & { image?: string })[]>();
  const [listLoading, setListLoading] = useState(false);
  const [listEnd, setListEnd] = useState<boolean>();
  const [searchKey, setSearchKey] = useState("");
  const searchKeyDebounce = useDebounce(searchKey);
  const pageSize = 2;
  useEffect(() => {
    async function initialUserList() {
      setList(undefined);
      setListEnd(undefined);

      try {
        const res = await client.queryUsers(
          {
            id: { $ne: currentUser.id },
            ...(searchKeyDebounce
              ? {
                  $or: [
                    { name: { $autocomplete: searchKeyDebounce } },
                    { id: { $autocomplete: searchKeyDebounce } },
                  ],
                }
              : {}),
          },
          { id: 1 },
          { limit: pageSize + 1 }
        );
        setList(res.users.slice(0, pageSize));
        setListEnd(res.users.length <= pageSize);
      } catch (error) {
        console.error(`Error loading user list`, error);
      }
    }

    if (client && currentUser.id) {
      initialUserList();
    }
  }, [client, currentUser.id, searchKeyDebounce]);

  const loadMoreUsers = async () => {
    setListLoading(true);
    try {
      const lastUserId = list?.[list.length - 1].id;
      if (!lastUserId) return;
      const res = await client.queryUsers(
        {
          $and: [
            {
              id: {
                $ne: currentUser.id,
              },
            },
            { id: { $gt: lastUserId } },
            searchKeyDebounce
              ? {
                  $or: [
                    { name: { $autocomplete: searchKeyDebounce } },
                    { id: { $autocomplete: searchKeyDebounce } },
                  ],
                }
              : {},
          ],
        },
        { id: 1 },
        { limit: pageSize + 1 }
      );

      setList([...list, ...res.users.slice(0, pageSize)]);
      setListEnd(res.users.length <= pageSize);
    } catch (error) {
    } finally {
      setListLoading(false);
    }
  };
  const handleChannelSelected = (channel: Channel) => {
    setActiveChannel(channel);
    onChannelSelected();
  };
  const startChatWithUser = async (userId: string) => {
    try {
      const channel = client.channel("messaging", {
        members: [userId, currentUser.id],
      });
      await channel.create();
      handleChannelSelected(channel);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="str-chat absolute z-10 h-full w-full border-e-[#DBDDe1] bg-white">
      <div className="flex flex-col p-3">
        <div className="mb-3 flex items-center gap-3 text-lg font-bold">
          <ArrowLeft onClick={onClose} className="cursor-pointer" />
          Users
        </div>
        <input
          type="search"
          placeholder="Search"
          className="rounded-full border border-gray-300 px-4 py-2"
          value={searchKeyDebounce}
          onChange={(e) => {
            setSearchKey(e.target.value);
          }}
        />
      </div>
      <div>
        {list?.map((otherUser) => (
          <UserResult
            key={otherUser.id}
            user={otherUser}
            onUserClicked={() => {
              startChatWithUser(otherUser.id);
            }}
          />
        ))}
        <div className="px-3">
          {!list && !searchKeyDebounce && <LoadingUsers />}{" "}
          {!list && searchKeyDebounce && "Searching..."}
          {list?.length === 0 && <div>No Users Found</div>}
        </div>
        {listEnd === false && (
          <LoadingButton
            onClick={loadMoreUsers}
            loading={listLoading}
            className="m-auto mb-3 w-4/5"
          >
            Load More Users
          </LoadingButton>
        )}
      </div>
    </div>
  );
};

interface UserResultProps {
  user: UserResponse & { image?: string };
  onUserClicked: (userId: string) => void;
}

const UserResult = ({ user, onUserClicked }: UserResultProps) => {
  return (
    <button
      className="p-02 mb-3 flex w-full items-center gap-2 hover:bg-[#e9eaed]"
      onClick={() => onUserClicked(user.id)}
    >
      <span>
        <Avatar image={user.image} name={user.name || user.id} size={40} />
      </span>
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
        {user.name || user.id}
      </span>
      {user.online && <span className="text-xs text-green-500">Online</span>}
    </button>
  );
};

export default UserList;
