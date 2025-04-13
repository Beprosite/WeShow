import { NextResponse } from 'next/server';
import { getStudioFromToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  console.log('POST /studio/api/projects/[projectId]/media - Start', {
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

    // Verify project belongs to studio
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        studioId: studio.id
      }
    });

    if (!project) {
      console.log('Project not found or does not belong to studio');
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const data = await request.json();
    console.log('Received media data:', data);

    // Update project with new media
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId
      },
      data: {
        heroPhoto: data.heroPhoto || project.heroPhoto,
        videos: data.videos || project.videos,
        photos: data.photos || project.photos,
        title: data.title || project.title,
        description: data.description || project.description
      }
    });

    console.log('Project updated successfully:', updatedProject);
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error saving media:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save media';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 