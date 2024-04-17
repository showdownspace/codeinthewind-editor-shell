import { clsx } from "clsx";
import { Table } from "flowbite-react";
import { useEffect, useMemo, useState } from "react";
import { getRoom } from "~/getRoomRef";
import { profilesSchema } from "~/schema";
import { UserId } from "~/ui/UserId";
import { useFirebaseDatabaseQuery } from "~/utils/useFirebaseDatabaseQuery";

export default function AdminUsersPage() {
  const profilesPtr = getRoom().child("profiles");
  const userState = useFirebaseDatabaseQuery(profilesPtr.ref);
  const users = useMemo(() => {
    return profilesSchema.parse(userState.data ?? {});
  }, [userState.data]);
  return (
    <>
      <Table>
        <Table.Head>
          <Table.HeadCell>ID</Table.HeadCell>
          <Table.HeadCell>Name</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {Object.entries(users).map(([id, user]) => (
            <Table.Row key={id}>
              <Table.Cell>
                <UserId id={id} />
              </Table.Cell>
              <Table.Cell>
                <div className="flex items-center gap-2">
                  <OnlineBadge userId={id} /> {user.name}
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </>
  );
}

function OnlineBadge({ userId }: { userId: string }) {
  const presenceState = useFirebaseDatabaseQuery<number>(
    getRoom().child("presence").child(userId).ref
  );
  const now = useNow();
  const state = !presenceState.data
    ? "loading"
    : now - presenceState.data < 60000
    ? "online"
    : "offline";
  return (
    <div
      title={state}
      className={clsx(
        "w-3 h-3 rounded-full",
        state === "online"
          ? "bg-green-500"
          : state === "offline"
          ? "bg-red-500"
          : "bg-slate-500"
      )}
    />
  );
}

function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return now;
}
