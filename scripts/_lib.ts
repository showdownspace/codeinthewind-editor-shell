import admin from "firebase-admin";
import { mkdirSync, writeFileSync } from "fs";
import { uuidv7 } from "uuidv7";
import serviceAccount from "../creds.local/service-account.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL:
    "https://showdownspace-default-rtdb.asia-southeast1.firebasedatabase.app",
});

export { admin };

export const db = admin.database();

export async function saveSnapshot() {
  const id = uuidv7();
  const dir = `private.local/snapshots`;
  mkdirSync(dir, { recursive: true });
  const result = {
    citw2: await db
      .ref("rooms/citw2")
      .get()
      .then((s) => s.val()),
    citw2vote: await db
      .ref("rooms/citw2vote")
      .get()
      .then((s) => s.val()),
  };
  const path = `${dir}/${id}.json`;
  writeFileSync(path, JSON.stringify(result, null, 2));
  return { id, path };
}

export function logEvent(event: string, payload: Record<string, unknown>) {
  const dir = `private.local/events`;
  const file =
    new Date().toISOString().replace(/\W/g, "") + "_" + event + ".json";
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${file}`, JSON.stringify({ event, payload }, null, 2));
}
