// src/app/api/account/delete-request/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { sendDeletionRequestEmail } from "@/lib/mail"; 

const deleteRequestSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  reason: z.string().min(10, "Please provide a reason (at least 10 characters)"),
  urgency: z.enum(["low", "medium", "high"]),
  additionalInfo: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = deleteRequestSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid request data",
          details: validatedData.error.issues 
        },
        { status: 400 }
      );
    }

    const { email, reason, urgency, additionalInfo } = validatedData.data;

    // Send email notification to admin
    await sendDeletionRequestEmail({
      userEmail: email,
      reason,
      urgency,
      additionalInfo: additionalInfo || "",
    });

    // Log the request (optional but recommended)
    console.log(`[Account Deletion] Request submitted for ${email}`, {
      urgency,
      reason: reason.substring(0, 50) + "...",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Deletion request submitted successfully",
    });

  } catch (error) {
    console.error("[API] Error processing deletion request:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to process deletion request" 
      },
      { status: 500 }
    );
  }
}