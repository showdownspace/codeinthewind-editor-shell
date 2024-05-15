import { redirect, useLoaderData } from "@remix-run/react";
import { serverTimestamp, set } from "firebase/database";
import { Button } from "flowbite-react";
import { useMemo } from "react";
import { getCurrentUser } from "~/getCurrentUser";
import { getVoteRoom } from "~/getRoomRef";
import { submissionSchema } from "~/schema";
import { Container } from "~/ui/Container";
import { useFirebaseDatabaseQuery } from "~/utils/useFirebaseDatabaseQuery";

export const clientLoader = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw redirect("/");
  }
  return { user };
};

export default function VotePage() {
  const { user } = useLoaderData<typeof clientLoader>();
  const voteRoomPtr = getVoteRoom();
  const submissionPtr = voteRoomPtr.child("privateSubmissions").child(user.uid);
  const acceptingPtr = voteRoomPtr
    .child("settings")
    .child("acceptingSubmissions");
  const accepting = useFirebaseDatabaseQuery(acceptingPtr.ref).data
    ? true
    : false;
  const submission = useFirebaseDatabaseQuery(submissionPtr.ref);
  const submitVote = async (value: string) => {
    console.log(value);
    await set(submissionPtr.ref, {
      data: value,
      submittedAt: serverTimestamp(),
    });
  };
  const voted = useMemo(() => {
    if (!submission.data) {
      return [];
    }
    const { data } = submissionSchema.parse(submission.data || undefined);
    return data
      .split(",")
      .map((x) => parseInt(x, 10))
      .filter((x) => x);
  }, [submission]);
  const toggleVote = (value: number) => {
    if (voted.includes(value)) {
      submitVote(voted.filter((x) => x !== value).join(","));
    } else {
      submitVote([...voted, value].slice(-2).join(","));
    }
  };
  console.log(voted);

  return (
    <Container>
      {accepting ? (
        <VoteBox voted={voted} toggleVote={(value) => toggleVote(value)} />
      ) : (
        <>Voting is closed right now...</>
      )}
    </Container>
  );
}

export interface VoteBox {
  voted: number[];
  toggleVote: (value: number) => void;
}
export function VoteBox(props: VoteBox) {
  const items = [1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <>
      <p>Please choose your vote:</p>

      <div className="grid gap-3 grid-cols-4 mt-4">
        {items.map((item) => (
          <VoteItem
            key={item}
            value={item}
            voted={props.voted.includes(item)}
            onClick={() => props.toggleVote(item)}
          />
        ))}
      </div>
    </>
  );
}

export interface VoteItem {
  value: number;
  voted: boolean;
  onClick: () => void;
}
export function VoteItem(props: VoteItem) {
  return (
    <Button
      pill
      size="xl"
      color={props.voted ? undefined : "gray"}
      onClick={props.onClick}
    >
      {props.value}
    </Button>
  );
}
