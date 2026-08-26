import dbConnect from "@/lib/db";
import SystemLog from "@/models/SystemLog";

interface LogParams {
  actor_id: string;
  actor_role: string;
  action_type: string;
  target_id?: string;
  details?: any;
}

export async function createSystemLog({
  actor_id,
  actor_role,
  action_type,
  target_id,
  details,
}: LogParams) {
  try {
    await dbConnect();
    await SystemLog.create({
      actor_id,
      actor_role,
      action_type,
      target_id,
      details,
    });
  } catch (error) {
    console.error("System Log Error:", error);
  }
}
