import { ReactNode } from "react";
import { usePtr } from "~/ZDbRef";
import { getRoom } from "~/getRoomRef";

export interface ProfileConnector {
  uid: string;
  children: (
    profile: { displayName?: string; name?: string },
    loading: boolean
  ) => ReactNode;
}

export function ProfileConnector(props: ProfileConnector) {
  const profilePtr = getRoom().child("profiles").child(props.uid);
  const state = usePtr(profilePtr);
  const data = state.data;
  return (
    <>
      {props.children(
        {
          displayName: data?.displayName || undefined,
          name: data?.name,
        },
        state.loading
      )}
    </>
  );
}
