import { redirect } from "@remix-run/react";
import { auth } from "~/firebase.client";

export async function clientAction() {
  await auth.signOut();
  return redirect("/");
}
