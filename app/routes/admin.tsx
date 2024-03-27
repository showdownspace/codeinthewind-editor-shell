import { Outlet } from "@remix-run/react";
import { get } from "firebase/database";
import { getCurrentUser } from "~/getCurrentUser";
import { getRoom } from "~/getRoomRef";
import { Container } from "~/ui/Container";

export const clientLoader = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Response("Unauthorized", {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  const isAdminSnapshot = await get(
    getRoom().child("admins").child(user.uid).child("enabled").ref
  );
  const isAdmin = isAdminSnapshot.val() === true;
  if (!isAdmin) {
    throw new Response("Forbidden", { status: 403, statusText: "Forbidden" });
  }

  return {};
};

export default function AdminLayout() {
  return (
    <Container>
      <Outlet />
    </Container>
  );
}
