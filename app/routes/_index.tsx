import type { MetaFunction } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { User } from "firebase/auth";
import { Button } from "flowbite-react";
import { auth, authStateAvailablePromise } from "~/firebase.client";
import { forceType } from "~/forceType";

export const meta: MetaFunction = () => {
  return [
    { title: "Code in the Wind" },
    { name: "description", content: "Welcome to Code in the Wind!" },
  ];
};

export const clientLoader = async () => {
  await authStateAvailablePromise;
  return { user: auth.currentUser };
};

export interface Container {
  children?: React.ReactNode;
}

export function Container(props: Container) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="mb-6 pb-1 border-b border-b-slate-700 text-slate-500">
        Code in the Wind
      </h1>
      {props.children}
    </div>
  );
}

export default function Index() {
  const { user } = useLoaderData<typeof clientLoader>();
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

  forceType<User>(user);
  return (
    <Container>
      <div className="flex gap-4 flex-col">
        <div className="text-2xl font-bold">Welcome!</div>
        <div>User ID: {user.uid}</div>
        <div className="flex gap-3">
          <Button as={Link} to="/editor">
            Go to editor
          </Button>
          <Form method="post" action="/auth/logout">
            <Button type="submit" color="gray">
              Log out
            </Button>
          </Form>
        </div>
      </div>
    </Container>
  );
}
