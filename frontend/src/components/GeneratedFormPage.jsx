// src/components/GeneratedFormPage.jsx
import React, { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import GeneratedForm from './GeneratedForm';
import EditFieldCard from './EditFieldCard';
import { FiEdit, FiPlus, FiCopy, FiSave, FiX } from 'react-icons/fi';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import SortableEditFieldCard from './SortableEditFieldCard';
import toast from 'react-hot-toast';

const GeneratedFormPage = () => {
  const { state } = useLocation();
  const { formId } = useParams();

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.fields.findIndex((field) => field.name === active.id);
        const newIndex = prev.fields.findIndex((field) => field.name === over.id);
        
        return {
          ...prev,
          fields: arrayMove(prev.fields, oldIndex, newIndex),
        };
      });
    }
  };

  // Initialize state with a more robust check, ensuring 'fields' is an array.
  const [formData, setFormData] = useState(() => {
    const data = state?.formData || {};
    if (Array.isArray(data)) {
      // If we just got an array of fields, structure it correctly.
      return { fields: data, title: 'My Form', description: 'Please fill out this form' };
    }
    // Ensure fields property is always an array
    return { ...data, fields: data.fields || [] };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [showLinkCopied, setShowLinkCopied] = useState(false);

  const handleAddField = () => {
    const newField = {
      label: 'New Field',
      name: `field_${Date.now()}`,
      type: 'text',
      required: false,
    };
    setFormData(prev => ({ ...prev, fields: [...prev.fields, newField] }));
  };

  const handleUpdateField = (index, field) => {
    const updatedFields = [...formData.fields];
    // When changing type to radio/select, initialize options array if it doesn't exist
    if ((field.type === 'radio' || field.type === 'select') && !field.options) {
      field.options = ['Option 1'];
    }
    updatedFields[index] = field;
    setFormData(prev => ({ ...prev, fields: updatedFields }));
  };

  const handleRemoveField = (index) => {
    const updatedFields = formData.fields.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, fields: updatedFields }));
  };
  
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateShareLink = () => {
    const link = `${window.location.origin}/form/${formId}`;
    setShareLink(link);
    navigator.clipboard.writeText(link);
    setShowLinkCopied(true);
    setTimeout(() => setShowLinkCopied(false), 2000);
  };

  const saveForm = () => {
    console.log('Saved form:', formData);
    setIsEditing(false);
    toast.success("Saved Successfully !");
  };

  if (!state || !state.formData) {
    return (
      <section className="bg-gray-50/50 min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold">No form data found</h3>
          <p className="text-gray-500 mt-2">Please create a form first</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50/50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-t-lg border-x border-t">
          <div className="flex justify-between items-start">
            <div>
              {isEditing ? (
                <div className='space-y-2'>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleHeaderChange}
                    className="text-2xl font-semibold border-b border-gray-300 w-full"
                  />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleHeaderChange}
                    className="text-sm text-gray-500 mt-1 w-full border rounded p-1"
                    rows="2"
                  />
                </div>
              ) : (
                <div>
                  <h3 className="text-3xl font-bold text-gray-800">{formData.title}</h3>
                  <p className="text-md text-gray-500 mt-1">{formData.description}</p>
                </div>
              )}
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2">
             {!isEditing ? (
                <>
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 font-semibold">
                    <FiEdit size={14} /> Edit
                  </button>
                  <button onClick={generateShareLink} className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 font-semibold">
                    <FiCopy size={14} /> Share
                  </button>
                </>
              ) : (
                <>
                  <button onClick={saveForm} className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 font-semibold">
                    <FiSave size={14} /> Save
                  </button>
                  <button onClick={() => setIsEditing(false)} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                    <FiX size={14} /> Cancel
                  </button>
                </>
              )}
            </div>
          </div>
          {showLinkCopied && <div className="mt-2 text-sm text-green-600">Link copied!</div>}
        </div>

        {/* Form Body - Swaps between Edit and View mode */}
        <div className="p-6 pt-4 bg-white rounded-b-lg border">
          {isEditing ? (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={formData.fields.map(f => f.name)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {formData.fields.map((field, index) => (
                    <SortableEditFieldCard
                      key={field.name}
                      index={index}
                      field={field}
                      onUpdate={handleUpdateField}
                      onRemove={handleRemoveField}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <GeneratedForm schema={formData} />
          )}

          {/* Add Field button outside the DndContext */}
          {isEditing && (
            <button
              onClick={handleAddField}
              className="mt-6 flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 font-semibold"
            >
              <FiPlus size={16} /> Add Field
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default GeneratedFormPage;