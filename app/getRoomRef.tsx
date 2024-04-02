import { child, getDatabase, ref } from "firebase/database";
import { z } from "zod";
import { once } from "~/utils/once";
import { ZDbRef } from "./ZDbRef";
import { roomSchema } from "./schema";

const getRoomRef = once(() => {
  const dbRef = ref(getDatabase());
  const roomRef = child(dbRef, `rooms/citw2`);
  return roomRef;
});

export const getRoom = once(() => {
  return new ZDbRef<z.infer<typeof roomSchema>>(getRoomRef(), roomSchema);
});