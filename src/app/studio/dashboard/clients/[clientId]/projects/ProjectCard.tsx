import Link from 'next/link';
import { RiEditLine, RiUploadLine, RiImageLine, RiLayoutLine, RiEyeLine } from 'react-icons/ri';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  clientId: string;
  onMediaClick?: () => void;
}

export default function ProjectCard({ project, onEdit, clientId, onMediaClick }: ProjectCardProps) {
  const hasMedia = project.media && project.media.length > 0;

  return (
    <div className="relative p-[1px] before:absolute before:w-[10px] before:h-[10px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[10px] after:h-[10px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0">
      <div className="bg-gradient-to-b from-[#0A0A0A] to-black border border-white/10 overflow-hidden">
        {/* Project preview/hero image */}
        <div className="aspect-video bg-[#0A0A0A] relative group">
          {project.heroImage ? (
            <img
              src={project.heroImage}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              <RiImageLine className="w-12 h-12" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Tags/Deliverables */}
          {project.tags && project.tags.length > 0 && (
            <div className="absolute bottom-2 left-2 flex flex-wrap items-center gap-1.5">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-[11px] text-white/80 bg-black/60 px-2 py-0.5 rounded-full border border-white/20"
                >
                  {tag.type}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Project info */}
        <div className="p-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-light text-white group-hover:text-white transition-colors mb-1 line-clamp-1">{project.name}</h3>
              <p className="text-xs text-white/60">{project.status}</p>
            </div>
            <button
              onClick={onEdit}
              className="text-white/40 hover:text-white transition-colors"
            >
              <RiEditLine className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-3 mt-3 border-t border-white/10">
            <Link
              href={`/studio/dashboard/clients/${clientId}/projects/${project.id}/modules`}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-black hover:bg-[#222222] rounded-full border border-white/10 transition-all duration-300 text-xs text-white"
            >
              <RiLayoutLine className="w-3.5 h-3.5" />
              <span>Modules</span>
            </Link>
            <Link
              href={`/studio/dashboard/clients/${clientId}/projects/${project.id}`}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-black hover:bg-[#222222] rounded-full border border-white/10 transition-all duration-300 text-xs text-white/40 hover:text-white"
            >
              <RiEyeLine className="w-3.5 h-3.5" />
              <span>View Project</span>
            </Link>
            <button
              onClick={onMediaClick}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-black hover:bg-[#222222] rounded-full border border-white/10 transition-all duration-300 text-xs text-white/40 hover:text-white"
            >
              <RiUploadLine className="w-3.5 h-3.5" />
              <span>{hasMedia ? 'Media' : 'Add Media'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 