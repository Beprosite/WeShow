import { NextResponse } from 'next/server';
import { getStudioFromToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  console.log('GET /studio/api/projects/[projectId] - Start', {
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

    console.log('Fetching project details:', {
      projectId,
      studioId: studio.id
    });

    try {
      // Get project details from database
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          studioId: studio.id
        },
        select: {
          id: true,
          name: true,
          description: true,
          heroPhoto: true,
          videos: true,
          photos: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!project) {
        console.log('Project not found or does not belong to studio');
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      console.log('Project found:', project);
      return NextResponse.json(project);
    } catch (dbError) {
      console.error('Database error when fetching project:', dbError);
      throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
    }
  } catch (error) {
    console.error('Error fetching project:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch project';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 