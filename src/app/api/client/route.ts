// app/api/clients/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all clients for a studio
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studioId = searchParams.get('studioId');

    if (!studioId) {
      return NextResponse.json(
        { error: 'Studio ID is required' },
        { status: 400 }
      );
    }

    const clients = await prisma.client.findMany({
      where: {
        studioId: studioId
      },
      include: {
        projects: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST new client
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const client = await prisma.client.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        studioId: body.studioId,
        contactPerson: {
          name: body.contactPerson.name,
          email: body.contactPerson.email,
          phone: body.contactPerson.phone,
          position: body.contactPerson.position
        },
        clientDetails: {
          industry: body.clientDetails.industry,
          size: body.clientDetails.size,
          website: body.clientDetails.website,
          notes: body.clientDetails.notes || ''
        },
        isActive: body.isActive || true
      },
      include: {
        projects: true
      }
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}

// PUT (update) client
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    const client = await prisma.client.update({
      where: { 
        id: body.id 
      },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        contactPerson: {
          name: body.contactPerson.name,
          email: body.contactPerson.email,
          phone: body.contactPerson.phone,
          position: body.contactPerson.position
        },
        clientDetails: {
          industry: body.clientDetails.industry,
          size: body.clientDetails.size,
          website: body.clientDetails.website,
          notes: body.clientDetails.notes || ''
        },
        isActive: body.isActive
      },
      include: {
        projects: true
      }
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE client
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // First, delete related projects
    await prisma.$transaction([
      prisma.project.deleteMany({
        where: { clientId: id }
      }),
      prisma.client.delete({
        where: { id }
      })
    ]);

    return NextResponse.json({ 
      message: 'Client and related records deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}