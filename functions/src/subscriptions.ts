import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";

export const createSubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { plan, paypalSubscriptionId } = data;
  const uid = context.auth.uid;

  if (!plan || !paypalSubscriptionId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with two arguments: \"plan\" and \"paypalSubscriptionId\"."
    );
  }

  const db = getFirestore();
  const subscriptionRef = db.collection("subscriptions").doc(uid);

  await subscriptionRef.set({
    plan,
    paypalSubscriptionId,
    status: "active",
    reportCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { success: true };
});
