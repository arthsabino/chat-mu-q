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
import Button from "../Buttons/Button";
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
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
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

  const startGroupChat = async (members: string[], name?: string) => {
    try {
      const channel = client.channel("message", {
        members,
        name,
      });
      await channel.create();

      handleChannelSelected(channel);
    } catch (error) {}
  };
  return (
    <div className="str-chat absolute z-10 h-full w-full overflow-y-auto border-e-[#DBDDe1] bg-white dark:border-e-gray-800 dark:bg-[#17191c]">
      <div className="flex flex-col p-3">
        <div className="mb-3 flex items-center gap-3 text-lg font-bold">
          <ArrowLeft onClick={onClose} className="cursor-pointer" />
          Users
        </div>
        <input
          type="search"
          placeholder="Search"
          className="rounded-full border border-gray-300 bg-transparent px-4 py-2 dark:border-gray-800 dark:text-white"
          value={searchKeyDebounce}
          onChange={(e) => {
            setSearchKey(e.target.value);
          }}
        />
      </div>
      {selectedUsers.length > 0 && (
        <StartGroupChatHeader
          onConfirm={(name) =>
            startGroupChat([currentUser.id, ...selectedUsers], name)
          }
          onClearSelection={() => setSelectedUsers([])}
        />
      )}
      <div>
        {list?.map((otherUser) => (
          <UserResult
            key={otherUser.id}
            user={otherUser}
            onUserClicked={() => {
              startChatWithUser(otherUser.id);
            }}
            selected={selectedUsers.includes(otherUser.id)}
            onChangeSelected={(selected) =>
              setSelectedUsers(
                selected
                  ? [...selectedUsers, otherUser.id]
                  : selectedUsers.filter((userId) => userId !== otherUser.id)
              )
            }
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
  selected?: boolean;
  onChangeSelected: (selected: boolean) => void;
}

const UserResult = ({
  user,
  onUserClicked,
  selected,
  onChangeSelected,
}: UserResultProps) => {
  return (
    <button
      className="mb-3 flex w-full items-center gap-2 p-2 hover:bg-[#e9eaed] dark:hover:bg-[#1c1e22]"
      onClick={() => onUserClicked(user.id)}
    >
      <input
        type="checkbox"
        className="mx-1 scale-125"
        checked={selected}
        onChange={(e) => onChangeSelected(e.target.checked)}
        onClick={(e) => e.stopPropagation()}
      />
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

interface StartGroupChatHeaderProps {
  onConfirm: (name?: string) => void;
  onClearSelection: () => void;
}

const StartGroupChatHeader: FC<StartGroupChatHeaderProps> = ({
  onConfirm,
  onClearSelection,
}) => {
  const [gcNameInput, setGcNameInput] = useState("");

  return (
    <div className="sticky top-0 z-10 flex flex-col gap-3 bg-white p-3 shadow-sm dark:bg-[#17191c]">
      <input
        placeholder="Group name"
        className="rounded border border-gray-300 bg-transparent p-2 dark:border-gray-800 dark:text-white"
        value={gcNameInput}
        onChange={(e) => setGcNameInput(e.target.value)}
      />
      <div className="flex justify-center gap-2">
        <Button onClick={() => onConfirm(gcNameInput)} className="py-2">
          Start group chat
        </Button>
        <Button
          onClick={onClearSelection}
          className="bg-gray-400 py-2 active:bg-gray-500"
        >
          Clear selection
        </Button>
      </div>
    </div>
  );
};

export default UserList;
