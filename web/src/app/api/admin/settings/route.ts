import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import SystemSetting from "@/models/SystemSetting";
import SystemLog from "@/models/SystemLog";
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
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const body = await req.json();
    await connectToDatabase();

    const settings = await SystemSetting.findOne();
    if (!settings) {
      return NextResponse.json(
        { success: false, message: "Settings not found" },
        { status: 404 },
      );
    }

    const updatedFieldsList: string[] = [];

    if (
      body.maintenance_mode !== undefined &&
      settings.maintenance_mode !== body.maintenance_mode
    ) {
      settings.maintenance_mode = body.maintenance_mode;
      updatedFieldsList.push("maintenance_mode");
    }

    if (
      body.allow_new_signups !== undefined &&
      settings.allow_new_signups !== body.allow_new_signups
    ) {
      settings.allow_new_signups = body.allow_new_signups;
      updatedFieldsList.push("allow_new_signups");
    }

    if (
      body.current_model !== undefined &&
      settings.ai_model_config.current_model !== body.current_model
    ) {
      settings.ai_model_config.current_model = body.current_model;
      updatedFieldsList.push("ai_model_config.current_model");
    }

    if (
      body.system_prompt !== undefined &&
      settings.ai_model_config.system_prompt !== body.system_prompt
    ) {
      settings.ai_model_config.system_prompt = body.system_prompt;
      updatedFieldsList.push("ai_model_config.system_prompt");
    }

    if (updatedFieldsList.length > 0) {
      settings.updated_by = session.user.id;
      await settings.save();

      await SystemLog.create({
        actor_id: session.user.id,
        actor_role: session.user.role,
        action_type: "UPDATE_SYSTEM_SETTINGS",
        target_id: settings._id,
        details: { updated_fields: updatedFieldsList },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      data: {
        maintenance_mode: settings.maintenance_mode,
        allow_new_signups: settings.allow_new_signups,
        current_model: settings.ai_model_config.current_model,
        system_prompt: settings.ai_model_config.system_prompt,
      },
    });
  } catch (error) {
    console.error("System Settings API PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
