import type { MetaFunction } from "@remix-run/node";
import {
  Await,
  ClientActionFunctionArgs,
  Form,
  Link,
  defer,
  useLoaderData,
} from "@remix-run/react";
import { get, set } from "firebase/database";
import { Button, TextInput } from "flowbite-react";
import { Suspense } from "react";
import { getRoom } from "~/getRoomRef";
import { UserId } from "~/ui/UserId";
import { getCurrentUser } from "../getCurrentUser";
import { Container } from "../ui/Container";
import { ProfileConnector } from "../utils/ProfileConnector";

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

export const clientAction = async (args: ClientActionFunctionArgs) => {
  const formData = await args.request.formData();
  const displayName = formData.get("displayName") as string | null;
  const user = await getCurrentUser();
  if (user) {
    await set(
      getRoom().child("profiles").child(user.uid).child("displayName").ref,
      displayName
    );
  }
  return null;
};

export default function Index() {
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
        <div className="sm:text-5xl text-sky-400">
          <ProfileConnector uid={user.uid}>
            {(profile) => profile.displayName || profile.name || user.name}
          </ProfileConnector>{" "}
          <span className="text-green-400">
            <UserId id={user.uid} compact />
          </span>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button as={Link} to="/editor">
            Go to editor
          </Button>
          <Button as={Link} to="/vote" color="gray">
            Vote
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
        <Form method="post" className="flex gap-3 flex-wrap">
          <ProfileConnector uid={user.uid}>
            {(profile, loading) =>
              loading ? (
                ""
              ) : (
                <div className="text-sm text-gray-400">
                  <TextInput
                    name="displayName"
                    placeholder={user.name}
                    size={32}
                    defaultValue={profile.displayName}
                  />
                </div>
              )
            }
          </ProfileConnector>
          <Button type="submit" color="blue" outline>
            Change display name
          </Button>
        </Form>
      </div>
    </Container>
  );
}
