import { NextRequest, NextResponse } from "next/server";
import { getOAuth2Client } from "@/lib/googleClient";
import { supabase } from "@/lib/supabase";
import { google } from "googleapis";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    // Fetch Clerk user ID dynamically
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: Clerk user ID is missing" },
        { status: 401 }
      );
    }

    // Parse the request body
    const { to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, or body" },
        { status: 400 }
      );
    }

    // Retrieve user tokens from Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("access_token, refresh_token")
      .eq("clerk_user_id", userId) // Match by Clerk user ID
      .single();

    if (error || !user?.access_token) {
      console.error("User tokens error:", error);
      return NextResponse.json(
        { error: "Unauthorized: User tokens not found" },
        { status: 401 }
      );
    }

    // Initialize Google OAuth2 client
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: user.access_token,
      refresh_token: user.refresh_token,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Construct the email
    const emailLines = [`To: ${to}`, `Subject: ${subject}`, "", body];
    const email = emailLines.join("\n");

    // Encode to Base64
    const encodedMessage = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Send the email
    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error sending email:", error.message);
      return NextResponse.json(
        { error: "Failed to send email", details: error.message },
        { status: 500 }
      );
    } else {
      console.error("Unexpected error sending email:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  }
}
