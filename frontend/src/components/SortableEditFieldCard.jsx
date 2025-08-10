// src/components/SortableEditFieldCard.jsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import EditFieldCard from './EditFieldCard';
import { FiGrid } from 'react-icons/fi';

const SortableEditFieldCard = ({ field, index, onUpdate, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.name }); // Use the unique field name as the ID

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="relative">
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners} 
          className="absolute -left-8 top-1/2 -translate-y-1/2 text-gray-400 cursor-grab hover:text-gray-700"
          aria-label="Drag to reorder"
        >
          <FiGrid size={20}/>
        </div>
        <EditFieldCard 
          field={field} 
          index={index} 
          onUpdate={onUpdate} 
          onRemove={onRemove} 
        />
      </div>
    </div>
  );
};

export default SortableEditFieldCard;