import admin from "firebase-admin";
import serviceAccount from "../creds.local/service-account.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL:
    "https://showdownspace-default-rtdb.asia-southeast1.firebasedatabase.app",
});

export { admin };

export const db = admin.database();
