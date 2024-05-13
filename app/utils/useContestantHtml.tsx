import { useMemo } from "react";
import { getRoom } from "~/getRoomRef";
import { submissionDataSchema, submissionSchema } from "~/schema";
import { useFirebaseDatabaseQuery } from "~/utils/useFirebaseDatabaseQuery";

export function useContestantHtml(userId: string) {
  const submissionPtr = getRoom().child("privateSubmissions").child(userId);
  const submissionState = useFirebaseDatabaseQuery(submissionPtr.ref);
  const html = useMemo(() => {
    const submission = submissionSchema.parse(
      submissionState.data || undefined
    );
    const data = submissionDataSchema.parse(JSON.parse(submission.data));
    return data.html;
  }, [submissionState]);
  return html;
}
