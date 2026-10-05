import webpush from "web-push";
import Notification from "@/models/Notification";
import PushSubscription from "@/models/PushSubscription";

type NotifyUserOptions = {
  sender_id?: string;
  recipient_id: string;
  type: string;
  title: string;
  message: string;
  priority: "low" | "normal" | "high" | "urgent";
  action_url?: string;
  reference_id?: string;
  reference_type?: string;
};

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT;

if (publicKey && privateKey && subject) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function notifyUser({
  sender_id,
  recipient_id,
  type,
  title,
  message,
  priority,
  action_url,
  reference_id,
  reference_type,
}: NotifyUserOptions) {
  const notification = await Notification.create({
    ...(sender_id ? { sender_id } : {}),
    recipient_id,
    type,
    title,
    message,
    priority,
    ...(action_url ? { action_url } : {}),
    ...(reference_id ? { reference_id } : {}),
    ...(reference_type ? { reference_type } : {}),
    is_read: false,
  });

  if (!publicKey || !privateKey || !subject) {
    return notification;
  }

  try {
    const subscriptions = await PushSubscription.find({
      user_id: recipient_id,
      is_active: true,
    }).lean();

    if (!subscriptions.length) {
      return notification;
    }

    const payload = JSON.stringify({
      notification_id: notification._id.toString(),
      type,
      title,
      message,
      priority,
      action_url: action_url || null,
    });

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            payload,
          );

          await PushSubscription.updateOne(
            { _id: subscription._id },
            { $set: { last_used_at: new Date() } },
          );
        } catch (error: any) {
          const statusCode = error?.statusCode;

          if (statusCode === 404 || statusCode === 410) {
            await PushSubscription.updateOne(
              { _id: subscription._id },
              {
                $set: {
                  is_active: false,
                  last_used_at: new Date(),
                },
              },
            );
          } else {
            console.error(
              "Web Push Delivery Error:",
              subscription.endpoint,
              error,
            );
          }
        }
      }),
    );
  } catch (error) {
    console.error("Web Push Error:", error);
  }

  return notification;
}
