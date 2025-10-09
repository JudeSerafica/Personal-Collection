import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { email, code, password } = await req.json();

    if (!email || !code || !password) {
      return NextResponse.json(
        { error: "Email, code, and password are required" },
        { status: 400 }
      );
    }

    // 1. Get verification record
    const { data: record, error } = await supabaseAdmin
      .from("signup_verifications")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .maybeSingle();

    if (error) throw error;

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // 2. Check expiry
    if (new Date(record.expiry).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 400 }
      );
    }

    // 3. Verify password matches
    if (record.password !== password) {
      return NextResponse.json(
        { error: "Password mismatch" },
        { status: 400 }
      );
    }

    // 4. Create user in Supabase Auth
    const { data: user, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since we verified via OTP
    });

    if (signUpError) {
      // Handle duplicate user
      if (signUpError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "This email is already registered" },
          { status: 400 }
        );
      }
      throw signUpError;
    }

    // 5. Cleanup verification record
    await supabaseAdmin
      .from("signup_verifications")
      .delete()
      .eq("email", email);

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: user.user?.id,
        email: user.user?.email,
      },
    });
  } catch (err: any) {
    console.error("Verification error:", err);
    return NextResponse.json(
      { error: err.message || "Verification failed" },
      { status: 500 }
    );
  }
}
