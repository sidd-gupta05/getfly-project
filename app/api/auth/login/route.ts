// app/api/auth/login/route.ts - UPDATED
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import { LoginRequest, ApiResponse, AuthResponse, UserRole } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(
      body.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role as UserRole);

    // Return user data without password
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json<ApiResponse<AuthResponse>>({
      success: true,
      data: {
        token,
        user: userWithoutPassword,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
