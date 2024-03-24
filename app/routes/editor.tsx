import { redirect } from "@remix-run/react";
import { auth, authStateAvailablePromise } from "~/firebase.client";

export const clientLoader = async () => {
  await authStateAvailablePromise;
  if (!auth.currentUser) {
    throw redirect("/");
  }
  return { user: auth.currentUser };
};

export default function Editor() {
  return (
    <>
      <iframe
        src="https://codeinthewind-editor-core.vercel.app/"
        title="Editor"
        className="absolute top-0 left-0 w-full h-full"
      />
    </>
  );
}
