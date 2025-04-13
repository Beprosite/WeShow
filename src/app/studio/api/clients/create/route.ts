import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils/slugify';

export async function POST(request: Request) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);
    if (!session?.user?.studioId) {
      return NextResponse.json(
        { error: 'Unauthorized - No studio ID found' },
        { status: 401 }
      );
    }

    const studioId = session.user.studioId;
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.emails || !data.company) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate URL slug from company name
    const urlSlug = slugify(data.company);

    // Create the client in the database
    const client = await prisma.client.create({
      data: {
        name: data.name,
        email: data.emails[0], // Primary email
        additionalEmails: data.emails.slice(1), // Additional emails
        company: data.company,
        phone: data.phone || '',
        logo: data.logo || '',
        status: 'active',
        urlSlug: urlSlug, // Add URL slug
        studio: {
          connect: {
            id: studioId
          }
        }
      }
    });

    // If there was a temporary client ID in the logo path, update it
    if (data.logo && data.tempClientId) {
      const oldPath = `studios/${studioId}/clients/${data.tempClientId}`;
      const newPath = `studios/${studioId}/clients/${client.id}`;
      
      // TODO: Implement S3 move/copy operation to update the path
      // For now, we'll just keep the old path as it still works
    }

    // Revalidate the clients page
    revalidatePath('/studio/dashboard/clients');
    revalidatePath('/master-admin/studios/[id]');

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        company: client.company,
        phone: client.phone,
        logo: client.logo,
        status: client.status,
        urlSlug: client.urlSlug, // Include URL slug in response
        projectCount: 0,
        lastActive: new Date().toISOString(),
        projects: []
      }
    });

  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create client'
      },
      { status: 500 }
    );
  }
} 