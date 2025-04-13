import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic'; 

const prisma = new PrismaClient();

export async function GET() {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    const userData = JSON.parse(userCookie.value);

    const projects = await prisma.project.findMany({
      where: {
        userId: userData.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error('שגיאה בטעינת פרויקטים:', error);
    return NextResponse.json(
      { error: 'שגיאה בטעינת הפרויקטים' },
      { status: 500 }
    );
  }
}