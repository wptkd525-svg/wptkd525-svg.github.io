import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  const profileId = request.nextUrl.searchParams.get("id");

  if (!profileId) {
    return NextResponse.json({ error: "프로필 ID가 필요합니다." }, { status: 400 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { id: profileId },
  });

  if (!profile) {
    return NextResponse.json({ error: "프로필을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({
    id: profile.id,
    name: profile.name,
    equipment: JSON.parse(profile.equipment) as string[],
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, equipment } = body as {
      name?: string;
      equipment: string[];
    };

    if (!Array.isArray(equipment) || equipment.length === 0) {
      return NextResponse.json(
        { error: "최소 하나 이상의 기구를 선택해 주세요." },
        { status: 400 },
      );
    }

    const profile = await prisma.userProfile.create({
      data: {
        name: name ?? null,
        equipment: JSON.stringify(equipment),
      },
    });

    return NextResponse.json({
      id: profile.id,
      name: profile.name,
      equipment: JSON.parse(profile.equipment) as string[],
    });
  } catch {
    return NextResponse.json(
      { error: "프로필 저장에 실패했습니다." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, equipment } = body as {
      id: string;
      name?: string;
      equipment: string[];
    };

    if (!id) {
      return NextResponse.json({ error: "프로필 ID가 필요합니다." }, { status: 400 });
    }

    if (!Array.isArray(equipment) || equipment.length === 0) {
      return NextResponse.json(
        { error: "최소 하나 이상의 기구를 선택해 주세요." },
        { status: 400 },
      );
    }

    const profile = await prisma.userProfile.update({
      where: { id },
      data: {
        name: name ?? null,
        equipment: JSON.stringify(equipment),
      },
    });

    return NextResponse.json({
      id: profile.id,
      name: profile.name,
      equipment: JSON.parse(profile.equipment) as string[],
    });
  } catch {
    return NextResponse.json(
      { error: "프로필 수정에 실패했습니다." },
      { status: 500 },
    );
  }
}
