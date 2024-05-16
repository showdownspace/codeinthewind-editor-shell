import { Link } from "@remix-run/react";

export default function AdminIndex() {
  return (
    <>
      <Link to="/admin/dashboard">Dashboard</Link>
      <br />
      <Link to="/admin/submissions">Submissions</Link>
      <br />
      <Link to="/admin/stage">Stage</Link>
      <br />
      <Link to="/admin/vote">Vote</Link>
    </>
  );
}
