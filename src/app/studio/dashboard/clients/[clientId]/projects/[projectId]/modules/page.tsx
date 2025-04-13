'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ModuleItem } from './ModuleItem';
import { RiAddLine } from 'react-icons/ri';

interface Module {
  id: string;
  type: 'text' | 'image' | 'video' | 'gallery';
  content: any;
}

export default function ProjectModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [editingModule, setEditingModule] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addNewModule = () => {
    const newModule: Module = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text',
      content: { text: '' }
    };
    setModules([...modules, newModule]);
    setEditingModule(newModule.id);
  };

  const updateModule = (id: string, data: Partial<Module>) => {
    setModules(modules.map(module => 
      module.id === id ? { ...module, ...data } : module
    ));
  };

  const deleteModule = (id: string) => {
    setModules(modules.filter(module => module.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Project Modules</h1>
        </div>

        <div className="space-y-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={modules}
              strategy={verticalListSortingStrategy}
            >
              {modules.map((module) => (
                <ModuleItem
                  key={module.id}
                  module={module}
                  isEditing={editingModule === module.id}
                  onEdit={() => setEditingModule(module.id)}
                  onSave={() => setEditingModule(null)}
                  onChange={(data) => updateModule(module.id, data)}
                  onDelete={() => deleteModule(module.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          <button
            onClick={addNewModule}
            className="w-full p-4 border-2 border-dashed border-gray-700 rounded-lg
                     hover:border-gray-600 transition-colors flex items-center justify-center
                     gap-2 text-gray-400 hover:text-gray-300"
          >
            <RiAddLine size={24} />
            <span>Add New Module</span>
          </button>
        </div>
      </div>
    </div>
  );
} 