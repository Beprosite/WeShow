import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('user');

    if (!userCookie || !userCookie.value) {
      return NextResponse.json({ authenticated: false });
    }

    const userData = JSON.parse(userCookie.value);
    return NextResponse.json({
      authenticated: true,
      username: userData.username,
      companyName: userData.companyName
    });
    
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}