// app/api/studio/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all studios (stays the same)
export async function GET() {
  try {
    const studios = await prisma.studio.findMany({
      include: {
        clients: true,
        projects: true
      }
    });
    return NextResponse.json(studios);
  } catch (error) {
    console.error('Error fetching studios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch studios' }, 
      { status: 500 }
    );
  }
}

// POST new studio
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Get the first masterAdmin from the database
    const masterAdmin = await prisma.masterAdmin.findFirst();
    if (!masterAdmin) {
      return NextResponse.json(
        { error: 'No master admin found' },
        { status: 400 }
      );
    }

    const studio = await prisma.studio.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        logoUrl: body.logoUrl || null,
        masterAdminId: masterAdmin.id, // Use the found masterAdmin's ID
        isActive: body.isActive,
        subscriptionTier: body.subscriptionTier,
        contactPerson: {
          name: `${body.contactPerson.firstName} ${body.contactPerson.lastName}`.trim(),
          email: body.contactPerson.email,
          phone: body.contactPerson.phone,
          position: body.contactPerson.position
        },
        studio: {
          website: body.studio.website || '',
          industry: body.studio.industry || '',
          address: body.studio.address || '',
          size: body.studio.size || ''
        }
      },
      include: {
        clients: true,
        projects: true
      }
    });

    return NextResponse.json(studio);
  } catch (error) {
    console.error('Error creating studio:', error);
    return NextResponse.json(
      { error: 'Failed to create studio: ' + (error as Error).message }, 
      { status: 500 }
    );
  }
}

// PUT (update) studio
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    const studio = await prisma.studio.update({
      where: { 
        id: body.id 
      },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        logoUrl: body.logoUrl || null,
        isActive: body.isActive,
        subscriptionTier: body.subscriptionTier,
        contactPerson: {
          name: `${body.contactPerson.firstName} ${body.contactPerson.lastName}`.trim(),
          email: body.contactPerson.email,
          phone: body.contactPerson.phone,
          position: body.contactPerson.position
        },
        studio: {
          website: body.studio.website || '',
          industry: body.studio.industry || '',
          address: body.studio.address || '',
          size: body.studio.size || ''
        }
      },
      include: {
        clients: true,
        projects: true
      }
    });

    return NextResponse.json(studio);
  } catch (error) {
    console.error('Error updating studio:', error);
    return NextResponse.json(
      { error: 'Failed to update studio: ' + (error as Error).message }, 
      { status: 500 }
    );
  }
}

// DELETE studio (stays the same)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Studio ID is required' }, 
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.project.deleteMany({
        where: { studioId: id }
      }),
      prisma.client.deleteMany({
        where: { studioId: id }
      }),
      prisma.studio.delete({
        where: { id }
      })
    ]);

    return NextResponse.json({ 
      message: 'Studio and related records deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting studio:', error);
    return NextResponse.json(
      { error: 'Failed to delete studio' }, 
      { status: 500 }
    );
  }
}