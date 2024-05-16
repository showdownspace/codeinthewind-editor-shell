import { clsx } from "clsx";
import { runTransaction, set } from "firebase/database";
import { Button, Select, Table } from "flowbite-react";
import { useMemo, useState } from "react";
import { usePtr } from "~/ZDbRef";
import { getRoom } from "~/getRoomRef";
import { profilesSchema } from "~/schema";
import { UserId } from "~/ui/UserId";
import { useFirebaseDatabaseQuery } from "~/utils/useFirebaseDatabaseQuery";
import { useNow } from "~/utils/useNow";
import { useStage } from "~/utils/useStage";
import { Timer } from "../ui/Timer";

export default function AdminUsersPage() {
  const [showFullId, setShowFullId] = useState(false);
  const profilesPtr = getRoom().child("profiles");
  const userState = useFirebaseDatabaseQuery(profilesPtr.ref);
  const users = useMemo(() => {
    return profilesSchema.parse(userState.data ?? {});
  }, [userState.data]);
  return (
    <>
      <StageDump users={users} showFullId={showFullId} />
      <div className="h-6" />
      <TimerAdmin />
      <div className="h-6" />

      <Table>
        <Table.Head>
          <Table.HeadCell onClick={() => setShowFullId((x) => !x)}>
            ID
          </Table.HeadCell>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell>Stage</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {Object.entries(users).map(([id, user]) => (
            <Table.Row key={id}>
              <Table.Cell>
                {showFullId ? <UserId id={id} /> : id.slice(-4)}
              </Table.Cell>
              <Table.Cell>
                <div className="flex items-center gap-2">
                  <OnlineBadge userId={id} />{" "}
                  {user.displayName
                    ? `${user.displayName} (${user.name})`
                    : user.name}
                </div>
              </Table.Cell>
              <Table.Cell>
                <StageSelect userId={id} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </>
  );
}

interface StageDump {
  users: Record<string, { name: string }>;
  showFullId: boolean;
}
function StageDump(props: StageDump) {
  const stage = useStage();
  const value = stage
    .map((userId, index) => {
      const user = userId ? props.users[userId] : undefined;
      return [
        index + 1,
        (props.showFullId ? (x: string) => x : (x: string) => x.slice(-4))(
          userId || "-"
        ),
        user ? user.name : "-",
      ].join("\t");
    })
    .join("\n");
  return (
    <>
      <textarea
        value={value}
        className="bg-black text-green-300 w-full h-[15em]"
      />
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

export interface StageSelect {
  userId: string;
}

export function StageSelect(props: StageSelect) {
  const userIds = useStage();
  const index = userIds.indexOf(props.userId);
  return (
    <Select
      sizing="sm"
      value={index === -1 ? "" : index + 1}
      onChange={(e) => {
        updateStage((+e.target.value || 0) - 1, props.userId);
      }}
    >
      <option value="">—</option>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <option key={i} value={i}>
          {i}
        </option>
      ))}
    </Select>
  );
}

function updateStage(index: number, userId: string) {
  runTransaction(
    getRoom().child("settings").child("stage").ref,
    (stage: string) => {
      stage = stage || "-,-,-,-,-,-,-,-";
      const values = stage.split(",").map((x) => (x === userId ? "-" : x));
      if (index > -1) values[index] = userId;
      return values.join(",");
    }
  );
}

export function TimerAdmin() {
  const endTimePtr = getRoom().child("settings").child("timerEndTime");
  const endTime = usePtr(endTimePtr).data;
  return (
    <div className="flex gap-2 items-center">
      <Button
        color="gray"
        onClick={() => {
          const minutes = prompt("Minutes");
          if (minutes == null) {
            return;
          }
          if (+minutes == 0) {
            set(endTimePtr.ref, null);
          } else {
            const time = Date.now() + 1000 * 60 * +minutes;
            set(endTimePtr.ref, time);
          }
        }}
      >
        Set Timer
      </Button>
      <div className="text-xl font-mono">
        <Timer endTime={endTime} />
      </div>
    </div>
  );
}
