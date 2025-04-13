import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

// GET all companies
export async function GET() {
  try {
    // Get admin cookie
    const cookieStore = cookies();
    const adminCookie = cookieStore.get('admin');
    
    if (!adminCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = JSON.parse(adminCookie.value);
    if (!admin.isMasterAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch companies with their admins
    const companies = await prisma.company.findMany({
      include: {
        admins: {
          select: {
            id: true,
            username: true,
            isAdmin: true
          }
        }
      }
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST new company
export async function POST(request: Request) {
  try {
    // Verify master admin
    const cookieStore = cookies();
    const adminCookie = cookieStore.get('admin');
    
    if (!adminCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = JSON.parse(adminCookie.value);
    if (!admin.isMasterAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, logoUrl } = body;

    const company = await prisma.company.create({
      data: {
        name,
        logoUrl
      }
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update company
export async function PUT(request: Request) {
  try {
    // Verify master admin
    const cookieStore = cookies();
    const adminCookie = cookieStore.get('admin');
    
    if (!adminCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = JSON.parse(adminCookie.value);
    if (!admin.isMasterAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, logoUrl } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        name,
        logoUrl,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE company
export async function DELETE(request: Request) {
  try {
    // Verify master admin
    const cookieStore = cookies();
    const adminCookie = cookieStore.get('admin');
    
    if (!adminCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = JSON.parse(adminCookie.value);
    if (!admin.isMasterAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Delete all admins associated with the company first
    await prisma.admin.deleteMany({
      where: { companyId: id }
    });

    // Then delete the company
    await prisma.company.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}