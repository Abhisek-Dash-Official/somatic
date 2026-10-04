import InsurancePolicy from "@/models/InsurancePolicy";

const GRACE_PERIOD_DAYS = 30;

export function getGracePeriodEnd(date: Date) {
  const end = new Date(date);
  end.setDate(end.getDate() + GRACE_PERIOD_DAYS);
  return end;
}

export function getNextPaymentDate(date: Date, frequency: string) {
  const next = new Date(date);

  if (frequency === "monthly") {
    next.setMonth(next.getMonth() + 1);
  } else if (frequency === "quarterly") {
    next.setMonth(next.getMonth() + 3);
  } else if (frequency === "half_yearly") {
    next.setMonth(next.getMonth() + 6);
  } else if (frequency === "yearly") {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    throw new Error("Invalid premium frequency");
  }

  return next;
}

export async function syncInsurancePolicyStatus(policy: any) {
  if (policy.status !== "active") {
    return policy;
  }

  const now = new Date();

  if (policy.expiry_date && now >= new Date(policy.expiry_date)) {
    policy.status = "expired";
    policy.next_payment_due_at = undefined;
    await policy.save();
    return policy;
  }

  if (
    policy.next_payment_due_at &&
    now >= new Date(policy.next_payment_due_at)
  ) {
    if (!policy.grace_period_ends_at) {
      policy.grace_period_ends_at = getGracePeriodEnd(
        new Date(policy.next_payment_due_at),
      );
      await policy.save();
    }

    if (now >= new Date(policy.grace_period_ends_at)) {
      policy.status = "lapsed";
      policy.lapsed_at = now;
      await policy.save();
    }
  }

  return policy;
}
