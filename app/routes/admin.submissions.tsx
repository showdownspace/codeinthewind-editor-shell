/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useMemo } from "react";
import { getRoom } from "~/getRoomRef";
import { Previewer } from "~/ui/Previewer";
import { useContestantHtml } from "~/utils/useContestantHtml";
import { useFirebaseDatabaseQuery } from "~/utils/useFirebaseDatabaseQuery";

export default function AdminSubmissions() {
  const submissionsPtr = getRoom().child("privateSubmissions");
  const submissionsState = useFirebaseDatabaseQuery(submissionsPtr.ref);
  const submissions = useMemo(() => {
    return submissionsPtr.schema.parse(submissionsState.data ?? {});
  }, [submissionsState.data, submissionsPtr.schema]);
  return (
    <div className="flex flex-wrap gap-3">
      {Object.keys(submissions).map((id) => {
        return <Submission key={id} id={id} />;
      })}
    </div>
  );
}

export interface Submission {
  id: string;
}

export function Submission(props: Submission) {
  const html = useContestantHtml(props.id);
  return (
    <div className="w-[188px] flex-none p-1 bg-gradient-to-br from-[#A1FDF6] to-[#2C4653]">
      <div className="flex text-xs pb-1">
        <div className="flex-1 text-teal-900 font-bold">
          <UserName id={props.id} />
        </div>
        <div className="text-white/70">{props.id.slice(-4)}</div>
      </div>
      <div className="w-[180px] h-[240px]">
        <div className="origin-top-left scale-[0.333333]">
          <Previewer html={html || ""} />
        </div>
      </div>
    </div>
  );
}

export interface UserName {
  id: string;
}
export function UserName(props: UserName) {
  const nameRef = getRoom().child("profiles").child(props.id).child("name").ref;
  const nameState = useFirebaseDatabaseQuery(nameRef);
  return <>{nameState.data || "…"}</>;
}
