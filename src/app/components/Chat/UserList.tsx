import { UserResource } from "@clerk/types";
import { FC, useEffect, useState } from "react";
import { UserResponse } from "stream-chat";
import { useChatContext } from "stream-chat-react";
interface UserListProps {
  currentUser: UserResource;
}

const UserList: FC<UserListProps> = ({ currentUser }) => {
  const { client } = useChatContext();
  const [list, setList] = useState<(UserResponse & { image?: string })[]>();
  useEffect(() => {
    async function initialUserList() {
      try {
        const res = await client.queryUsers(
          {
            id: { $ne: currentUser.id },
          },
          { id: 1 }
        );
        setList(res.users);
      } catch (error) {
        console.error(`Error loading user list`, error);
      }
    }
  }, [client, currentUser.id]);
  return <div className="absolute z-10 h-full w-full"></div>;
};

export default UserList;
