import { useMemo } from "react";
import { getRoom } from "~/getRoomRef";
import { submissionDataSchema, submissionSchema } from "~/schema";
import { Previewer } from "~/ui/Previewer";
import { useFirebaseDatabaseQuery } from "~/utils/useFirebaseDatabaseQuery";

export default function AdminStagePage() {
  return (
    <>
      <Contestant userId="authgarten-644c35a6802c02345887f156" />
    </>
  );
}

export interface Contestant {
  userId: string;
}

export function Contestant(props: Contestant) {
  const submissionPtr = getRoom()
    .child("privateSubmissions")
    .child(props.userId);
  const submissionState = useFirebaseDatabaseQuery(submissionPtr.ref);
  const html = useMemo(() => {
    const submission = submissionSchema.parse(
      submissionState.data || undefined
    );
    console.log(submission);
    const data = submissionDataSchema.parse(JSON.parse(submission.data));
    return data.html;
  }, [submissionState]);
  return (
    <div>
      <Previewer html={html} />
    </div>
  );
}
