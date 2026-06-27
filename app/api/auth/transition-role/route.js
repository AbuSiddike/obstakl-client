import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { headers } from "next/headers";

export async function POST(request) {
  try {
    const sessionHeaders = await headers();
    const session = await auth.api.getSession({
      headers: sessionHeaders,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Connect to MongoDB using the singleton clientPromise
    const client = await clientPromise;
    const db = client.db(); // uses default DB from connection string

    // Update user role to Owner in the database
    const result = await db.collection("user").updateOne(
      { id: userId },
      { $set: { role: "Owner" } }
    );

    if (result.modifiedCount === 0) {
      // Try searching by _id instead of id just in case
      const { ObjectId } = require("mongodb");
      try {
        await db.collection("user").updateOne(
          { _id: new ObjectId(userId) },
          { $set: { role: "Owner" } }
        );
      } catch (err) {
        console.error("Failed to update by ObjectId", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Role transitioned to Owner successfully",
    });
  } catch (error) {
    console.error("Error transitioning role:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
