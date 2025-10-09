import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete any existing verification for this email first
    await supabaseAdmin
      .from("signup_verifications")
      .delete()
      .eq("email", email);

    // Store OTP and password temporarily in signup_verifications table
    const { error: insertError } = await supabaseAdmin
      .from("signup_verifications")
      .insert({
        email,
        code,
        password, // Store temporarily (will be used during verification)
        expiry,
        has_verification: true,
      });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      throw insertError;
    }

    // Send verification email via Gmail
    try {
      await sendVerificationEmail(email, code);
      console.log(`✅ Verification email sent to ${email}`);
    } catch (emailError: any) {
      console.error("Email sending failed:", emailError);
      // Still log to console as fallback
      console.log(`📧 FALLBACK - Verification code for ${email}: ${code}`);
      console.log(`⏰ Expires at: ${expiry.toISOString()}`);
      
      // Don't fail the whole request if email fails
      // User can still use the code from logs during development
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
    });
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to send verification code" },
      { status: 500 }
    );
  }
}
