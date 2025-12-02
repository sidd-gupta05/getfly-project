// app/api/projects/[id]/dpr/route.ts - UPDATED
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth";
import { ApiResponse, DPRRequest, UserRole } from "@/lib/types";

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

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
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

    // Check access
    if (user.role === "WORKER" && project.createdById !== user.userId) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const where: any = { projectId };
    if (dateParam) {
      const date = new Date(dateParam);
      where.date = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setDate(date.getDate() + 1)),
      };
    }

    // Fetch DPRs
    const [dprs, total] = await Promise.all([
      prisma.dailyReport.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: { date: "desc" },
      }),
      prisma.dailyReport.count({ where }),
    ]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        dprs,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error: any) {
    console.error("Get DPRs error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: error.name === "AuthError" ? 401 : 500 }
    );
  }
}

export async function POST(
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

    const body: DPRRequest = await request.json();

    // Validate required fields
    if (!body.date || !body.workDescription || body.workerCount === undefined) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Date, work description, and worker count are required",
        },
        { status: 400 }
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
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

    // Check if user has permission to add DPR
    if (user.role === "WORKER" && project.createdById !== user.userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "You can only add DPRs to projects you created",
        },
        { status: 403 }
      );
    }

    // Create DPR with proper typing
    const dpr = await prisma.dailyReport.create({
      data: {
        projectId,
        userId: user.userId,
        date: new Date(body.date),
        workDescription: body.workDescription,
        weather: body.weather || null,
        workerCount: body.workerCount,
        challenges: body.challenges || null,
        materialsUsed: body.materialsUsed || null,
        equipmentUsed: body.equipmentUsed || null,
        safetyIncidents: body.safetyIncidents || null,
        nextDayPlan: body.nextDayPlan || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: dpr,
        message: "Daily Progress Report created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create DPR error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: error.name === "AuthError" ? 401 : 500 }
    );
  }
}
