import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // קבלת פרטי המשתמש מהקוקי
    const cookieStore = cookies();
    const userCookie = cookieStore.get('user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    const userData = JSON.parse(userCookie.value);
    const body = await request.json();
    
    // יצירת פרויקט חדש
    const project = await prisma.project.create({
      data: {
        name: body.name,
        cost: body.cost,
        googleDriveFolderId: '', // נוסיף תמיכה בגוגל דרייב בהמשך
        userId: userData.id,
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('שגיאה ביצירת פרויקט:', error);
    return NextResponse.json(
      { error: 'שגיאה ביצירת הפרויקט' },
      { status: 500 }
    );
  }
}