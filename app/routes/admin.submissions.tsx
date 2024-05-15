/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Checkbox, Label } from "flowbite-react";
import { useMemo, useState } from "react";
import { usePtr } from "~/ZDbRef";
import { getRoom } from "~/getRoomRef";
import { Previewer } from "~/ui/Previewer";
import { useContestantHtml } from "~/utils/useContestantHtml";
import { useFirebaseDatabaseQuery } from "~/utils/useFirebaseDatabaseQuery";

export default function AdminSubmissions() {
  const [showList, setShowList] = useState(false);
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Checkbox
          id="showList"
          checked={showList}
          onChange={(e) => setShowList(e.target.checked)}
        />
        <Label htmlFor="showList">Show List</Label>
      </div>
      {showList ? <SubmissionList /> : null}
    </div>
  );
}

function SubmissionList() {
  const submissionsPtr = getRoom().child("privateSubmissions");
  const submissionsState = usePtr(submissionsPtr);
  const submissions = useMemo(() => {
    return submissionsPtr.schema.parse(submissionsState.data ?? {});
  }, [submissionsState.data, submissionsPtr.schema]);
  return (
    <div className="flex flex-wrap gap-3 mx-[calc((100vw-900px)*-0.5)]">
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
    <div className="w-[188px] flex-none px-1 pb-1 pt-0.5 bg-gradient-to-br from-[#A1FDF6] to-[#2C4653]">
      <div className="flex text-xs pb-0.5">
        <div className="flex-1 text-teal-900 font-bold text-ellipsis whitespace-nowrap overflow-hidden">
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
  const name = String(nameState.data || "…");
  return <span title={name}>{name}</span>;
}
