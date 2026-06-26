import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Call Better Auth's token endpoint server-side to get the signed JWT
    const tokenData = await auth.api.token({
      headers: request.headers,
    });

    return NextResponse.json(tokenData);
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
