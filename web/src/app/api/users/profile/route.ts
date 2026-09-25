import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import bcrypt from "bcryptjs";

import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { createSystemLog } from "@/lib/logger";

const getChangedFields = (
  changes: { field: string; from: unknown; to: unknown }[],
) =>
  changes.map((change) => ({
    field: change.field,
    from: change.from ?? null,
    to: change.to ?? null,
  }));

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id)
      .select("-password_hash")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.is_ban || user.is_delete) {
      return NextResponse.json(
        { error: "Account is disabled" },
        { status: 403 },
      );
    }

    const InsurancePolicy = (await import("@/models/InsurancePolicy")).default;

    const somaticPolicy = await InsurancePolicy.findOne({
      user_id: user._id,
      status: { $in: ["pending", "active"] },
    })
      .populate("plan_id")
      .lean();

    return NextResponse.json(
      {
        profile: user,
        somatic_policy: somaticPolicy,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Profile GET error:", error);

    return NextResponse.json(
      { error: "Failed to fetch profile data" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    await dbConnect();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.is_ban || user.is_delete) {
      return NextResponse.json(
        { error: "Account is disabled" },
        { status: 403 },
      );
    }

    const changes: {
      field: string;
      from: unknown;
      to: unknown;
    }[] = [];

    const addChange = (field: string, from: unknown, to: unknown) => {
      if (JSON.stringify(from ?? null) !== JSON.stringify(to ?? null)) {
        changes.push({
          field,
          from: from ?? null,
          to: to ?? null,
        });
      }
    };

    if (body.username !== undefined) {
      const username = String(body.username).trim();

      if (!username) {
        return NextResponse.json(
          { error: "Username cannot be empty." },
          { status: 400 },
        );
      }

      if (username !== user.username) {
        const existingUser = await User.findOne({
          username,
          _id: { $ne: user._id },
        });

        if (existingUser) {
          return NextResponse.json(
            { error: "Username is already taken." },
            { status: 400 },
          );
        }
      }

      addChange("username", user.username, username);
      user.username = username;
    }

    if (body.contact_no !== undefined) {
      const contactNo = String(body.contact_no).trim();

      if (contactNo && !/^[0-9]{10}$/.test(contactNo)) {
        return NextResponse.json(
          {
            error: "Invalid contact number format. Must be 10 digits.",
          },
          { status: 400 },
        );
      }

      const newContactNo = contactNo || undefined;

      addChange("contact_no", user.contact_no, newContactNo);

      user.contact_no = newContactNo;
    }

    if (body.address !== undefined) {
      const address = String(body.address).trim() || undefined;

      addChange("address", user.address, address);

      user.address = address;
    }

    if (body.avatar_id !== undefined) {
      const avatarId = String(body.avatar_id).trim() || undefined;

      addChange("avatar_id", user.avatar_id, avatarId);

      user.avatar_id = avatarId;
    }

    if (body.date_of_birth !== undefined) {
      let dateOfBirth: Date | undefined;

      if (body.date_of_birth !== null && body.date_of_birth !== "") {
        dateOfBirth = new Date(body.date_of_birth);

        if (isNaN(dateOfBirth.getTime())) {
          return NextResponse.json(
            { error: "Invalid date of birth." },
            { status: 400 },
          );
        }

        if (dateOfBirth > new Date()) {
          return NextResponse.json(
            {
              error: "Date of birth cannot be in the future.",
            },
            { status: 400 },
          );
        }
      }

      addChange("date_of_birth", user.date_of_birth, dateOfBirth);

      user.set("date_of_birth", dateOfBirth);
    }

    if (body.weight_kg !== undefined) {
      let weight: number | undefined;

      if (body.weight_kg !== null && body.weight_kg !== "") {
        weight = Number(body.weight_kg);

        if (!Number.isFinite(weight) || weight <= 0) {
          return NextResponse.json(
            {
              error: "Weight must be a valid positive number.",
            },
            { status: 400 },
          );
        }
      }

      addChange("weight_kg", user.weight_kg, weight);

      user.set("weight_kg", weight);
    }

    if (
      (user.role === "doctor" || user.role === "assistant_doctor") &&
      body.doctor_info
    ) {
      const currentDoctorInfo = user.doctor_info || {};

      const newDoctorInfo = {
        ...currentDoctorInfo,
        ...body.doctor_info,
      };

      const doctorFields = [
        "reg_no",
        "qualification",
        "experience",
        "department_id",
        "is_accepting_cases",
      ];

      doctorFields.forEach((field) => {
        addChange(
          `doctor_info.${field}`,
          currentDoctorInfo[field as keyof typeof currentDoctorInfo],
          newDoctorInfo[field as keyof typeof newDoctorInfo],
        );
      });

      user.doctor_info = newDoctorInfo;
    }

    if (user.role === "patient" && body.patient_info) {
      const currentPatientInfo = user.patient_info || {};

      const newPatientInfo = {
        ...currentPatientInfo,
        ...body.patient_info,
      };

      addChange(
        "patient_info.blood_grp",
        currentPatientInfo.blood_grp,
        newPatientInfo.blood_grp,
      );

      addChange(
        "patient_info.known_allergies",
        currentPatientInfo.known_allergies,
        newPatientInfo.known_allergies,
      );

      addChange(
        "patient_info.chronic_diseases",
        currentPatientInfo.chronic_diseases,
        newPatientInfo.chronic_diseases,
      );

      user.patient_info = newPatientInfo;
    }

    if (body.insurance !== undefined) {
      const previousInsurance = user.insurance;
      const insuranceType = body.insurance?.type;

      if (body.insurance === null || !insuranceType) {
        addChange("insurance.type", previousInsurance?.type, undefined);

        user.insurance = undefined;
      } else if (insuranceType === "external") {
        const externalInsurance = {
          type: "external" as const,
          provider_name:
            String(body.insurance.provider_name || "").trim() || undefined,
          policy_number:
            String(body.insurance.policy_number || "").trim() || undefined,
          policy_holder_name:
            String(body.insurance.policy_holder_name || "").trim() || undefined,
        };

        addChange(
          "insurance.type",
          previousInsurance?.type,
          externalInsurance.type,
        );

        addChange(
          "insurance.provider_name",
          previousInsurance?.provider_name,
          externalInsurance.provider_name,
        );

        addChange(
          "insurance.policy_number",
          previousInsurance?.policy_number,
          externalInsurance.policy_number,
        );

        addChange(
          "insurance.policy_holder_name",
          previousInsurance?.policy_holder_name,
          externalInsurance.policy_holder_name,
        );

        user.insurance = externalInsurance;
      } else if (insuranceType === "somatic") {
        const InsurancePolicy = (await import("@/models/InsurancePolicy"))
          .default;

        const somaticPolicy = await InsurancePolicy.findOne({
          user_id: user._id,
          status: {
            $in: ["pending", "active"],
          },
        });

        if (!somaticPolicy) {
          return NextResponse.json(
            {
              error:
                "No SOMATIC insurance policy is linked to your account. Please purchase or activate a SOMATIC insurance plan first.",
            },
            { status: 400 },
          );
        }

        addChange("insurance.type", previousInsurance?.type, "somatic");

        user.insurance = {
          type: "somatic",
        };
      } else {
        return NextResponse.json(
          { error: "Invalid insurance type." },
          { status: 400 },
        );
      }
    }

    let passwordChanged = false;

    if (body.newPassword !== undefined) {
      if (!body.currentPassword) {
        return NextResponse.json(
          {
            error: "Current password required.",
          },
          { status: 400 },
        );
      }

      if (typeof body.newPassword !== "string" || body.newPassword.length < 6) {
        return NextResponse.json(
          {
            error: "Password must be at least 6 characters long.",
          },
          { status: 400 },
        );
      }

      if (body.currentPassword === body.newPassword) {
        return NextResponse.json(
          {
            error: "New password must be different from your current password.",
          },
          { status: 400 },
        );
      }

      const isMatch = await bcrypt.compare(
        body.currentPassword,
        user.password_hash,
      );

      if (!isMatch) {
        return NextResponse.json(
          {
            error: "Incorrect current password.",
          },
          { status: 400 },
        );
      }

      user.password_hash = await bcrypt.hash(body.newPassword, 10);

      passwordChanged = true;
    }

    if (changes.length === 0 && !passwordChanged) {
      return NextResponse.json(
        {
          error: "No fields provided to update.",
        },
        { status: 400 },
      );
    }

    await user.save();

    const updatedUser = await User.findById(session.user.id)
      .select("-password_hash")
      .lean();

    await createSystemLog({
      actor_id: session.user.id,
      actor_role: session.user.role,
      action_type: "UPDATE_PROFILE",
      target_id: session.user.id,
      details: {
        changes: getChangedFields(changes),
        password_changed: passwordChanged,
      },
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        profile: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Profile PATCH error:", error);

    return NextResponse.json(
      {
        error: "Failed to update profile",
      },
      { status: 500 },
    );
  }
}
