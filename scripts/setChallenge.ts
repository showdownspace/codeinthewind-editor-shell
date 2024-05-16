import fs from "fs";
import { z } from "zod";
import { db } from "./_lib";

if (!process.argv[2]) {
  console.log("Unsetting challenge");
  await db.ref(`rooms/citw2/settings/challengeUrl`).set(null);
} else {
  const schema = z.object({
    id: z.string(),
  });
  const data = schema.parse(
    JSON.parse(fs.readFileSync(process.argv[2], "utf-8"))
  );
  console.log("Set challenge");

  await db
    .ref(`rooms/citw2/settings/challengeUrl`)
    .set(`https://citw02.pages.dev/challenges/${data.id}/`);
}

process.exit(0);
