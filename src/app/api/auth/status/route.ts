import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    // Get the Clerk user ID from the request
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { hasGoogleToken: false, error: "Unauthorized: No user session found" },
        { status: 401 }
      );
    }

    // Fetch the user's Google token from the Supabase database
    const { data, error } = await supabase
      .from("users")
      .select("access_token")
      .eq("clerk_user_id", userId)
      .single();

    if (error) {
      console.error("Supabase Error:", error.message);
      return NextResponse.json(
        { hasGoogleToken: false, error: "Failed to fetch user token" },
        { status: 500 }
      );
    }

    // Check if the access_token exists
    const hasGoogleToken = Boolean(data?.access_token);

    return NextResponse.json({ hasGoogleToken });
  } catch (error) {
    console.error("Error checking auth status:", error.message);
    return NextResponse.json(
      { hasGoogleToken: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
