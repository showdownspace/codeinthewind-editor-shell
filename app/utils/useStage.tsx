import { getRoom } from "~/getRoomRef";
import { useFirebaseDatabaseQuery } from "~/utils/useFirebaseDatabaseQuery";

export function useStage() {
  const stage =
    useFirebaseDatabaseQuery<string>(
      getRoom().child("settings").child("stage").ref
    ).data || "-,-,-,-,-,-,-,-";
  const userIds = stage.split(",");
  return userIds.map((x) => (x === "-" ? "" : x));
}
