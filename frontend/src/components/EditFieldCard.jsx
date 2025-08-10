// src/components/EditFieldCard.jsx
import React from 'react';
import { FiTrash2, FiPlusCircle, FiX } from 'react-icons/fi';

const EditFieldCard = ({ field, index, onUpdate, onRemove }) => {
  // Handler for simple field property changes (label, type, required)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onUpdate(index, {
      ...field,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // --- Handlers for managing options for radio/select types ---

  const handleAddOption = () => {
    const options = field.options ? [...field.options] : [];
    options.push(`Option ${options.length + 1}`);
    onUpdate(index, { ...field, options });
  };

  const handleUpdateOption = (optionIndex, newValue) => {
    const options = [...field.options];
    options[optionIndex] = newValue;
    onUpdate(index, { ...field, options });
  };

  const handleRemoveOption = (optionIndex) => {
    const options = field.options.filter((_, i) => i !== optionIndex);
    onUpdate(index, { ...field, options });
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm relative">
      <button
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
        aria-label="Remove field"
      >
        <FiTrash2 />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Field Label Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Field Label</label>
          <input
            type="text"
            name="label"
            value={field.label}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        {/* Field Type Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
          <select
            name="type"
            value={field.type}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="number">Number</option>
            <option value="textarea">Textarea</option>
            <option value="checkbox">Checkbox</option>
            <option value="radio">Radio</option>
            <option value="select">Select</option>
          </select>
        </div>
      </div>

      {/* --- Conditional Section for Radio/Select Options --- */}
      {(field.type === 'radio' || field.type === 'select') && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Options</h4>
          <div className="space-y-2">
            {field.options && field.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleUpdateOption(optIndex, e.target.value)}
                  className="flex-grow border-gray-300 rounded-md shadow-sm p-2"
                />
                <button
                  onClick={() => handleRemoveOption(optIndex)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <FiX />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleAddOption}
            className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <FiPlusCircle /> Add Option
          </button>
        </div>
      )}

      {field.type === 'checkbox' && (
  <div className="mt-4">
    <h4 className="text-sm font-medium text-gray-700 mb-2">Checkbox Options (Multi-select)</h4>
    <div className="space-y-2">
      {field.options && field.options.map((option, optIndex) => (
        <div key={optIndex} className="flex items-center gap-2">
          <input
            type="text"
            value={option}
            onChange={(e) => handleUpdateOption(optIndex, e.target.value)}
            className="flex-grow border-gray-300 rounded-md shadow-sm p-2"
            placeholder={`Option ${optIndex + 1}`}
          />
          <button
            onClick={() => handleRemoveOption(optIndex)}
            className="text-gray-400 hover:text-red-600"
          >
            <FiX />
          </button>
        </div>
      ))}
    </div>
    <button
      onClick={handleAddOption}
      className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
    >
      <FiPlusCircle /> Add Checkbox Option
    </button>
  </div>
)}

      {/* Required Checkbox */}
      <div className="mt-4 flex items-center">
        <input
          id={`required-${index}`}
          name="required"
          type="checkbox"
          checked={!!field.required}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor={`required-${index}`} className="ml-2 block text-sm text-gray-900">
          Required
        </label>
      </div>
    </div>
  );
};

export default EditFieldCard;