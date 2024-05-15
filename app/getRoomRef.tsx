import { child, getDatabase, ref } from "firebase/database";
import { once } from "~/utils/once";
import { ZDbRef } from "./ZDbRef";
import { roomSchema } from "./schema";

const getRoomRef = once(() => {
  const dbRef = ref(getDatabase());
  const roomRef = child(dbRef, `rooms/citw2`);
  return roomRef;
});

export const getRoom = once(() => {
  return new ZDbRef(getRoomRef(), roomSchema);
});

const getVoteRoomRef = once(() => {
  const dbRef = ref(getDatabase());
  const roomRef = child(dbRef, `rooms/citw2vote`);
  return roomRef;
});

export const getVoteRoom = once(() => {
  return new ZDbRef(getVoteRoomRef(), roomSchema);
});
