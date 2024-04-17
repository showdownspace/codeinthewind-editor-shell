import {
  getFirebaseDatabaseQueryStore,
  mapObservableResult,
} from "@nanofire/database";
import { useStore } from "@nanostores/react";
import { DatabaseReference } from "firebase/database";
import { useMemo } from "react";

export function useFirebaseDatabaseQuery<T>(ref: DatabaseReference) {
  const store = getFirebaseDatabaseQueryStore(ref);
  const result = useStore(store);
  return useMemo(() => {
    return mapObservableResult(result, (data) => data.val() as T);
  }, [result]);
}
