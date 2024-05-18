import { logEvent, saveSnapshot } from "./_lib";

const snapshot = await saveSnapshot();
logEvent("backup", snapshot);
console.log(snapshot);
process.exit(0);
