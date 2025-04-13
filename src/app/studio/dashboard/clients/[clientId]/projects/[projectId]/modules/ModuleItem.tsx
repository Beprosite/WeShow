import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RiDragMove2Line, RiEditLine, RiDeleteBinLine, RiSaveLine } from 'react-icons/ri';

interface Module {
  id: string;
  type: 'text' | 'image' | 'video' | 'gallery';
  content: any;
}

interface ModuleItemProps {
  module: Module;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onChange: (data: Partial<Module>) => void;
  onDelete: () => void;
}

export function ModuleItem({ 
  module, 
  isEditing, 
  onEdit, 
  onSave, 
  onChange, 
  onDelete 
}: ModuleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderModuleContent = () => {
    if (isEditing) {
      switch (module.type) {
        case 'text':
          return (
            <textarea
              value={module.content.text}
              onChange={(e) => onChange({ content: { text: e.target.value } })}
              className="w-full h-32 bg-gray-800 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter text content..."
            />
          );
        case 'image':
          return (
            <div className="space-y-3">
              <input
                type="text"
                value={module.content.url}
                onChange={(e) => onChange({ content: { ...module.content, url: e.target.value } })}
                className="w-full bg-gray-800 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Image URL..."
              />
              <input
                type="text"
                value={module.content.caption}
                onChange={(e) => onChange({ content: { ...module.content, caption: e.target.value } })}
                className="w-full bg-gray-800 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Image caption..."
              />
            </div>
          );
        case 'video':
          return (
            <div className="space-y-3">
              <input
                type="text"
                value={module.content.url}
                onChange={(e) => onChange({ content: { ...module.content, url: e.target.value } })}
                className="w-full bg-gray-800 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Video URL..."
              />
              <input
                type="text"
                value={module.content.caption}
                onChange={(e) => onChange({ content: { ...module.content, caption: e.target.value } })}
                className="w-full bg-gray-800 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Video caption..."
              />
            </div>
          );
        case 'gallery':
          return (
            <div className="space-y-3">
              {module.content.images.map((image: any, index: number) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={image.url}
                    onChange={(e) => {
                      const newImages = [...module.content.images];
                      newImages[index] = { ...image, url: e.target.value };
                      onChange({ content: { images: newImages } });
                    }}
                    className="flex-1 bg-gray-800 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Image URL..."
                  />
                  <button
                    onClick={() => {
                      const newImages = module.content.images.filter((_: any, i: number) => i !== index);
                      onChange({ content: { images: newImages } });
                    }}
                    className="p-2 text-red-500 hover:text-red-400"
                  >
                    <RiDeleteBinLine size={20} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newImages = [...(module.content.images || []), { url: '' }];
                  onChange({ content: { images: newImages } });
                }}
                className="w-full p-2 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:text-gray-300 hover:border-gray-500"
              >
                Add Image
              </button>
            </div>
          );
      }
    }

    // Display mode
    switch (module.type) {
      case 'text':
        return <div className="text-gray-300 whitespace-pre-wrap">{module.content.text}</div>;
      case 'image':
        return (
          <div className="space-y-2">
            <img src={module.content.url} alt={module.content.caption} className="w-full rounded-lg" />
            {module.content.caption && (
              <p className="text-gray-400 text-sm">{module.content.caption}</p>
            )}
          </div>
        );
      case 'video':
        return (
          <div className="space-y-2">
            <video src={module.content.url} controls className="w-full rounded-lg" />
            {module.content.caption && (
              <p className="text-gray-400 text-sm">{module.content.caption}</p>
            )}
          </div>
        );
      case 'gallery':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {module.content.images?.map((image: any, index: number) => (
              <img key={index} src={image.url} alt="" className="w-full h-48 object-cover rounded-lg" />
            ))}
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-800 rounded-lg p-4 ${isEditing ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="p-1 text-gray-400 hover:text-gray-300 cursor-move"
          >
            <RiDragMove2Line size={20} />
          </button>
          <select
            value={module.type}
            onChange={(e) => onChange({ type: e.target.value as Module['type'] })}
            className="bg-gray-700 text-white px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="text">Text</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="gallery">Gallery</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              onClick={onSave}
              className="p-1 text-green-500 hover:text-green-400"
            >
              <RiSaveLine size={20} />
            </button>
          ) : (
            <button
              onClick={onEdit}
              className="p-1 text-blue-500 hover:text-blue-400"
            >
              <RiEditLine size={20} />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1 text-red-500 hover:text-red-400"
          >
            <RiDeleteBinLine size={20} />
          </button>
        </div>
      </div>

      <div className="mt-4">
        {renderModuleContent()}
      </div>
    </div>
  );
} 