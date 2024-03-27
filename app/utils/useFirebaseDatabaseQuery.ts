import { useStore } from "@nanostores/react";
import { DatabaseReference } from "firebase/database";
import { useMemo } from "react";
import { getFirebaseDatabaseQueryStore, mapObservableResult } from "./nanofire";

export function useFirebaseDatabaseQuery<T>(ref: DatabaseReference) {
  const result = useStore(getFirebaseDatabaseQueryStore(ref));
  return useMemo(() => {
    return mapObservableResult(result, (data) => data.val() as T);
  }, [result]);
}
