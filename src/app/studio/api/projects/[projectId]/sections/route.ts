import { NextResponse } from 'next/server';
import { getStudioFromToken } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  console.log('GET /studio/api/projects/[projectId]/sections - Start', {
    projectId: params.projectId,
    headers: {
      authorization: request.headers.get('authorization'),
      cookie: request.headers.get('cookie')
    }
  });

  try {
    const studio = await getStudioFromToken();
    console.log('Studio authentication result:', { 
      hasStudio: !!studio,
      studioId: studio?.id 
    });

    if (!studio) {
      console.log('Authentication failed - no studio found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = params;
    if (!projectId) {
      console.log('Missing projectId in params');
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    console.log('Fetching sections for project:', {
      projectId,
      studioId: studio.id
    });

    try {
      // First verify the project belongs to the studio
      const project = await (prisma as any).project.findFirst({
        where: {
          id: projectId,
          studioId: studio.id
        }
      });

      if (!project) {
        console.log('Project not found or does not belong to studio');
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      // Get project sections from database
      const sections = await (prisma as any).section.findMany({
        where: {
          projectId
        },
        orderBy: {
          createdAt: 'asc'
        },
        select: {
          id: true,
          name: true,
          heroPhoto: true,
          videos: true,
          photos: true,
          createdAt: true,
          updatedAt: true
        }
      });

      console.log('Sections found:', sections);
      return NextResponse.json({ sections });
    } catch (dbError) {
      console.error('Database error when fetching sections:', dbError);
      throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
    }
  } catch (error) {
    console.error('Error fetching sections:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch sections';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  console.log('POST /studio/api/projects/[projectId]/sections - Start', {
    projectId: params.projectId,
    headers: {
      authorization: request.headers.get('authorization'),
      cookie: request.headers.get('cookie')
    }
  });

  try {
    const studio = await getStudioFromToken();
    console.log('Studio authentication result:', { 
      hasStudio: !!studio,
      studioId: studio?.id 
    });

    if (!studio) {
      console.log('Authentication failed - no studio found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = params;
    if (!projectId) {
      console.log('Missing projectId in params');
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const body = await request.json();
    console.log('Request body:', body);

    const { name, heroPhoto, videos, photos } = body;

    if (!name) {
      console.log('Missing required field: name');
      return NextResponse.json({ error: 'Section name is required' }, { status: 400 });
    }

    try {
      // Verify project belongs to studio
      const project = await (prisma as any).project.findFirst({
        where: {
          id: projectId,
          studioId: studio.id
        }
      });

      console.log('Project verification:', {
        projectId,
        studioId: studio.id,
        found: !!project
      });

      if (!project) {
        console.log('Project not found or does not belong to studio');
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      // Create new section
      const newSection = await (prisma as any).section.create({
        data: {
          name,
          heroPhoto: heroPhoto || null,
          videos: videos || [],
          photos: photos || [],
          project: {
            connect: {
              id: projectId
            }
          }
        }
      });

      console.log('Section created:', newSection);
      return NextResponse.json({ section: newSection }, { status: 201 });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
    }
  } catch (error) {
    console.error('Error creating section:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create section';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 