import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import SystemSetting from "@/models/SystemSetting";
import { defaultSystemSettings } from "@/config/system";

export async function GET() {
  try {
    await connectToDatabase();

    let settings = await SystemSetting.findOne().lean();

    if (!settings) {
      settings = await SystemSetting.create(defaultSystemSettings);
    }

    return NextResponse.json({
      success: true,
      data: {
        maintenance_mode: settings.maintenance_mode,
        allow_new_signups: settings.allow_new_signups,
        current_model: settings.ai_model_config.current_model,
        system_prompt: settings.ai_model_config.system_prompt,
      },
    });
  } catch (error) {
    console.error("System Settings API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
