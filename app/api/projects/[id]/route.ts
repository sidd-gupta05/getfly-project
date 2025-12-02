// app/api/projects/[id]/route.ts - UPDATED
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth";
import {
  ApiResponse,
  ProjectRequest,
  ProjectStatus,
  UserRole,
} from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // UPDATED: Handle null header
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);
    const user = verifyToken(token);

    const projectId = parseInt(params.id);

    if (isNaN(projectId)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Invalid project ID",
        },
        { status: 400 }
      );
    }

    // Find project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        dailyReports: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { date: "desc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Project not found",
        },
        { status: 404 }
      );
    }

    // Check access for workers
    if (user.role === "WORKER" && project.createdById !== user.userId) {
      // Check if worker has reported on this project
      const hasAccess = await prisma.dailyReport.findFirst({
        where: {
          projectId,
          userId: user.userId,
        },
      });

      if (!hasAccess) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: "Access denied",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error("Get project error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: error.name === "AuthError" ? 401 : 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // UPDATED: Handle null header
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);
    const user = verifyToken(token);

    // Check role (only admin and manager can update projects)
    if (!["ADMIN", "MANAGER"].includes(user.role)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Only admins and managers can update projects",
        },
        { status: 403 }
      );
    }

    const projectId = parseInt(params.id);

    if (isNaN(projectId)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Invalid project ID",
        },
        { status: 400 }
      );
    }

    const body: Partial<ProjectRequest> = await request.json();

    // Check if project exists and user has permission
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Project not found",
        },
        { status: 404 }
      );
    }

    // Only admin or project creator can update
    if (user.role !== "ADMIN" && existingProject.createdById !== user.userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "You can only update projects you created",
        },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.startDate !== undefined)
      updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined)
      updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.budget !== undefined) updateData.budget = body.budget;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.status !== undefined)
      updateData.status = body.status as ProjectStatus;

    // Update project
    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
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

    return NextResponse.json<ApiResponse>({
      success: true,
      data: project,
      message: "Project updated successfully",
    });
  } catch (error: any) {
    console.error("Update project error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: error.name === "AuthError" ? 401 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // UPDATED: Handle null header
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);
    const user = verifyToken(token);

    // Only admin can delete projects
    if (user.role !== "ADMIN") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Only admins can delete projects",
        },
        { status: 403 }
      );
    }

    const projectId = parseInt(params.id);

    if (isNaN(projectId)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Invalid project ID",
        },
        { status: 400 }
      );
    }

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Project not found",
        },
        { status: 404 }
      );
    }

    // Delete project (cascade will delete related DPRs)
    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete project error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: error.name === "AuthError" ? 401 : 500 }
    );
  }
}
