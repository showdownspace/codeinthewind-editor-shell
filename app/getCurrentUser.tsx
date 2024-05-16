import { set } from "firebase/database";
import { auth, authStateAvailablePromise } from "~/firebase.client";
import { getRoom } from "./getRoomRef";

let profileSaveAttempted = false;

export async function getCurrentUser() {
  await authStateAvailablePromise;
  const user = auth.currentUser
    ? {
        uid: auth.currentUser.uid,
        name: (await auth.currentUser.getIdTokenResult()).claims.name as string,
      }
    : null;

  if (user && !profileSaveAttempted) {
    profileSaveAttempted = true;
    const profilePtr = getRoom()
      .child("profiles")
      .child(user.uid)
      .child("name");
    set(profilePtr.ref, user.name).catch(console.error);
  }

  return user;
}
