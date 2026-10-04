import crypto from "crypto";
import Razorpay from "razorpay";

export type RazorpayOrderOptions = {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
};

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Payment gateway is not configured");
  }

  return { keyId, keySecret };
}

export function getRazorpay() {
  const { keyId, keySecret } = getRazorpayCredentials();

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export function getRazorpayKeyId() {
  return getRazorpayCredentials().keyId;
}

export async function createRazorpayOrder({
  amount,
  currency = "INR",
  receipt,
  notes,
}: RazorpayOrderOptions) {
  const razorpay = getRazorpay();

  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt,
    notes,
  });
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
) {
  const { keySecret } = getRazorpayCredentials();

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expected = Buffer.from(expectedSignature, "utf8");
  const received = Buffer.from(signature, "utf8");

  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received)
  );
}

export async function fetchRazorpayPayment(paymentId: string) {
  const razorpay = getRazorpay();
  return razorpay.payments.fetch(paymentId);
}

export async function fetchRazorpayOrder(orderId: string) {
  const razorpay = getRazorpay();
  return razorpay.orders.fetch(orderId);
}
