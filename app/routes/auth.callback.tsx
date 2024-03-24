import type {} from "@remix-run/node";
import { Await, Navigate, defer, useLoaderData } from "@remix-run/react";
import { signInWithCustomToken } from "firebase/auth";
import { Suspense } from "react";
import { auth } from "~/firebase.client";

let consumed = "";
function consumeIdToken() {
  if (consumed) {
    return consumed;
  }
  const hash = window.location.hash;
  const regex = /id_token=([^&]*)/;
  const match = regex.exec(hash);
  if (match) {
    consumed = match[1];
    // window.location.hash = hash.replace(regex, "_=_");
    return match[1];
  }
}

export const clientLoader = async () => {
  return defer({
    result: (async () => {
      const idToken = consumeIdToken();
      if (!idToken) {
        throw new Error("ID token not found…");
      }
      const customTokenResponse = await fetch(
        "https://showdownspace-authgarten.lovely.workers.dev/firebase",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        }
      );
      if (!customTokenResponse.ok) {
        throw new Error(
          "Failed to exchange ID token for custom token with status " +
            customTokenResponse.status
        );
      }
      const { customToken } = await customTokenResponse.json();
      const result = await signInWithCustomToken(auth, customToken);
      console.log(result);
      return "OK";
    })(),
  });
};

export default function AuthCallback() {
  const data = useLoaderData<typeof clientLoader>();
  return (
    <Suspense fallback="Signing in...">
      <Await resolve={data.result}>
        {(result) => {
          if (result === "OK") {
            return <Navigate to="/" replace />;
          }
          return <div>{result}</div>;
        }}
      </Await>
    </Suspense>
  );
}
