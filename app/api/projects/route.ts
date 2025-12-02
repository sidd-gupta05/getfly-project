// app/api/projects/route.ts - UPDATED
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth";
import {
  ApiResponse,
  ProjectRequest,
  ProjectStatus,
  UserRole,
} from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    // UPDATED: Handle null header
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);
    const user = verifyToken(token);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ProjectStatus;
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Check role-based access
    if (user.role === "WORKER") {
      // Workers can only see projects they've reported on
      const userProjects = await prisma.dailyReport.findMany({
        where: { userId: user.userId },
        select: { projectId: true },
        distinct: ["projectId"],
      });
      where.id = { in: userProjects.map((p) => p.projectId) };
    }

    // Fetch projects
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: { dailyReports: true },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        projects,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error: any) {
    console.error("Get projects error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: error.name === "AuthError" ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // UPDATED: Handle null header
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);
    const user = verifyToken(token);

    // Check role (only admin and manager can create projects)
    if (!["ADMIN", "MANAGER"].includes(user.role)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Only admins and managers can create projects",
        },
        { status: 403 }
      );
    }

    const body: ProjectRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.startDate) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Project name and start date are required",
        },
        { status: 400 }
      );
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description || null,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        budget: body.budget || null,
        location: body.location || null,
        status: (body.status || "PLANNED") as ProjectStatus,
        createdById: user.userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: project,
        message: "Project created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create project error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: error.name === "AuthError" ? 401 : 500 }
    );
  }
}
