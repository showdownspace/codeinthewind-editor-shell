/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { set } from "firebase/database";
import { Button, Table } from "flowbite-react";
import { useMemo } from "react";
import { usePtr } from "~/ZDbRef";
import { getVoteRoom } from "~/getRoomRef";
import { useFirebaseDatabaseQuery } from "~/utils/useFirebaseDatabaseQuery";

export default function AdminVote() {
  const settingPtr = getVoteRoom().child("settings");
  const acceptPtr = settingPtr.child("acceptingSubmissions");
  const accepting = !!useFirebaseDatabaseQuery(acceptPtr.ref).data;
  const clear = () => {
    if (!confirm("Are you sure you want to clear all votes?")) {
      return;
    }
    const submissionsPtr = getVoteRoom().child("privateSubmissions");
    set(submissionsPtr.ref, {});
  };
  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        {accepting ? (
          <Button
            color="failure"
            outline
            onClick={() => set(acceptPtr.ref, false)}
          >
            Close voting
          </Button>
        ) : (
          <Button
            color="success"
            outline
            onClick={() => set(acceptPtr.ref, true)}
          >
            Open voting
          </Button>
        )}
        <div className="flex-1"></div>

        <Button color="failure" outline onClick={() => clear()}>
          Clear
        </Button>
      </div>
      <VoteList />
    </div>
  );
}

function VoteList() {
  const submissionsPtr = getVoteRoom().child("privateSubmissions");
  const submissionsState = usePtr(submissionsPtr);
  const votes = useMemo(() => {
    console.log(submissionsState);
    const data = submissionsState.data || {};
    const tally = new Map<number, string[]>();
    for (const [uid, submission] of Object.entries(data)) {
      for (const vote of new Set(
        submission.data
          .split(",")
          .map((x) => parseInt(x, 10))
          .filter((x) => x)
          .slice(0, 2)
      )) {
        if (!tally.has(vote)) {
          tally.set(vote, []);
        }
        tally.get(vote)?.push(uid);
      }
    }
    return [1, 2, 3, 4, 5, 6, 7, 8].map((x) => ({
      id: x,
      votes: tally.get(x) || [],
    }));
  }, [submissionsState]);
  const value = votes.map((vote) => vote.votes.length).join("\n");
  return (
    <>
      <Table>
        <Table.Head>
          <Table.HeadCell>Stage number</Table.HeadCell>
          <Table.HeadCell>Votes</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {votes.map((vote) => (
            <Table.Row key={vote.id}>
              <Table.Cell>{vote.id}</Table.Cell>
              <Table.Cell>{vote.votes.length}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <div className="flex gap-2 mt-4">
        <textarea
          value={value}
          readOnly
          className="bg-black text-green-300 w-full h-[15em]"
        />
      </div>
    </>
  );
}
