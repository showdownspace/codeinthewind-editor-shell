import type { MetaFunction } from "@remix-run/node";
import {
  Await,
  Form,
  Link,
  defer,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { get } from "firebase/database";
import { Button } from "flowbite-react";
import { Suspense } from "react";
import { getRoom } from "~/getRoomRef";
import { UserId } from "~/ui/UserId";
import { getCurrentUser } from "../getCurrentUser";
import { Container } from "../ui/Container";

export const meta: MetaFunction = () => {
  return [
    { title: "Code in the Wind" },
    { name: "description", content: "Welcome to Code in the Wind!" },
  ];
};

export const clientLoader = async () => {
  const user = await getCurrentUser();
  const isAdminPromise = Promise.resolve().then(() =>
    user
      ? get(
          getRoom().child("admins").child(user.uid).child("enabled").ref
        ).then((s) => s.val() === true)
      : false
  );
  return defer({ user, isAdminPromise });
};

export default function Index() {
  const n = useNavigation();
  const { user, isAdminPromise } = useLoaderData<typeof clientLoader>();
  if (!user) {
    const loginUrl = `https://creatorsgarten.org/auth/authorize?${new URLSearchParams(
      {
        client_id:
          "https://github.com/showdownspace/codeinthewind-editor-shell",
        scope: "openid",
        response_type: "id_token",
        redirect_uri: window.location.origin + "/auth/callback",
        response_mode: "fragment",
        state: "",
      }
    )}`;
    return (
      <Container>
        <div className="flex gap-4 flex-col">
          <div className="text-2xl font-bold">You are not logged in</div>
          <div className="flex">
            <Button as="a" href={loginUrl}>
              Log in
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex gap-4 flex-col">
        <div className="text-2xl font-bold">Welcome!</div>
        <div>
          User ID: <UserId id={user.uid} />
        </div>
        <div>User name: {user.name}</div>
        <div className="flex gap-3">
          <Button as={Link} to="/editor">
            {n.state === "loading" ? "Loading" : "Go to editor"}
          </Button>
          <Form method="post" action="/auth/logout">
            <Button type="submit" color="gray">
              Log out
            </Button>
          </Form>
          <Suspense fallback="">
            <Await resolve={isAdminPromise}>
              {(isAdmin) =>
                isAdmin ? (
                  <Button as={Link} to="/admin" color="gray">
                    Admin
                  </Button>
                ) : null
              }
            </Await>
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
