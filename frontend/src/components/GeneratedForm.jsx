// src/components/GeneratedForm.jsx
import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FiLoader, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux'; // Assuming you use Redux for auth state
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Or use fetch

// ... (keep your existing getValidationRules and FormField components as they are)
const getValidationRules = (field) => {
    const rules = {};
    if (field.required) {
        rules.required = `${field.label} is required`;
    }
    switch (field.type) {
        case 'email':
            rules.pattern = {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address'
            };
            break;
        case 'number':
            if (field.name?.toLowerCase().includes('phone')) {
                rules.pattern = {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a 10-digit phone number'
                };
                rules.minLength = {
                    value: 10,
                    message: 'Phone number must be 10 digits'
                };
                rules.maxLength = {
                    value: 10,
                    message: 'Phone number must be 10 digits'
                };
            }
            break;
        case 'text':
            if (field.name?.toLowerCase().includes('name')) {
                rules.minLength = {
                    value: 2,
                    message: `${field.label} must be at least 2 characters`
                };
                rules.pattern = {
                    value: /^[a-zA-Z\s]+$/,
                    message: `${field.label} should only contain letters`
                };
            }
            if (field.name?.toLowerCase().includes('pincode') || field.name?.toLowerCase().includes('zip')) {
                rules.pattern = {
                    value: /^[0-9]{6}$/,
                    message: 'Please enter a valid 6-digit pincode'
                };
            }
            break;
        case 'textarea':
            if (field.required) {
                rules.minLength = {
                    value: 10,
                    message: `${field.label} must be at least 10 characters`
                };
            }
            break;
    }
    return rules;
};

const FormField = ({ field, control, errors, loading }) => {
    const fieldId = `field-${field.name}`;
    const isDisabled = field.disabled || false;
    const error = errors[field.name];
    const validationRules = getValidationRules(field);

    const commonProps = {
        id: fieldId,
        name: field.name,
        disabled: isDisabled,
        placeholder: field.placeholder || '',
        className: `w-full border rounded-md p-2 focus:outline-none focus:ring-2 transition-colors ${
            error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-indigo-500'
        } ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`,
    };

    const renderField = (value, onChange) => {
        switch (field.type) {
            case 'textarea':
                return (
                    <textarea
                        {...commonProps}
                        rows="4"
                        value={value || ''}
                        onChange={onChange}
                    />
                );
            case 'select':
                return (
                    <select {...commonProps} value={value || ''} onChange={onChange}>
                        <option value="">Select an option</option>
                        {field.options?.map((option, index) => (
                            <option key={index} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );
            case 'radio':
                return (
                    <div className="space-y-2">
                        {field.options?.map((option, index) => (
                            <div key={index} className="flex items-center">
                                <input
                                    type="radio"
                                    id={`${fieldId}-${index}`}
                                    name={field.name}
                                    value={option}
                                    checked={value === option}
                                    onChange={() => onChange(option)}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                />
                                <label htmlFor={`${fieldId}-${index}`} className="ml-2 text-gray-700">
                                    {option}
                                </label>
                            </div>
                        ))}
                    </div>
                );
            case 'checkbox':
                if (!field.options) {
                    return (
                        <div className="flex items-center gap-3 mt-1">
                            <input
                                type="checkbox"
                                id={fieldId}
                                name={field.name}
                                checked={!!value}
                                onChange={(e) => onChange(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor={fieldId} className="text-gray-700">
                                {field.label}
                            </label>
                        </div>
                    );
                }
                return (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.options.map((option, index) => (
                            <div key={index} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`${fieldId}-${index}`}
                                    name={field.name}
                                    value={option}
                                    checked={Array.isArray(value) ? value.includes(option) : false}
                                    onChange={(e) => {
                                        const newValue = Array.isArray(value) ? [...value] : [];
                                        if (e.target.checked) {
                                            newValue.push(option);
                                        } else {
                                            const optionIndex = newValue.indexOf(option);
                                            if (optionIndex > -1) {
                                                newValue.splice(optionIndex, 1);
                                            }
                                        }
                                        onChange(newValue);
                                    }}
                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor={`${fieldId}-${index}`} className="ml-2 text-gray-700">
                                    {option}
                                </label>
                            </div>
                        ))}
                    </div>
                );
            default:
                return (
                    <input
                        type={field.type || 'text'}
                        {...commonProps}
                        value={value || ''}
                        onChange={onChange}
                    />
                );
        }
    };
    if (field.type === 'checkbox') {
        return (
            <div>
                <Controller
                    name={field.name}
                    control={control}
                    rules={validationRules}
                    render={({ field: { value, onChange } }) => {
                        if (!field.options) {
                            return (
                                <div className="flex items-center gap-3 mt-1">
                                    <input
                                        type="checkbox"
                                        id={fieldId}
                                        name={field.name}
                                        checked={!!value}
                                        onChange={(e) => onChange(e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor={fieldId} className="text-gray-700">
                                        {field.label}
                                    </label>
                                </div>
                            );
                        }
                        return (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {field.options.map((option, index) => (
                                    <div key={index} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`${fieldId}-${index}`}
                                            name={field.name}
                                            value={option}
                                            checked={Array.isArray(value) ? value.includes(option) : false}
                                            onChange={(e) => {
                                                const newValue = Array.isArray(value) ? [...value] : [];
                                                if (e.target.checked) {
                                                    newValue.push(option);
                                                } else {
                                                    const optionIndex = newValue.indexOf(option);
                                                    if (optionIndex > -1) {
                                                        newValue.splice(optionIndex, 1);
                                                    }
                                                }
                                                onChange(newValue);
                                            }}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <label htmlFor={`${fieldId}-${index}`} className="ml-2 text-gray-700">
                                            {option}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        );
                    }}
                />
                {error && (
                    <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <FiAlertCircle className="w-4 h-4" />
                        <span>{error.message}</span>
                    </div>
                )}
            </div>
        );
    }
    return (
        <div className={field.className}>
            <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
                {loading && <FiLoader className="animate-spin ml-2 text-indigo-500 inline" />}
            </label>
            <Controller
                name={field.name}
                control={control}
                rules={validationRules}
                render={({ field: { value, onChange } }) => renderField(value, onChange)}
            />
            {error && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <FiAlertCircle className="w-4 h-4" />
                    <span>{error.message}</span>
                </div>
            )}
        </div>
    );
};


const GeneratedForm = ({ schema }) => {
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [isDraftSaving, setIsDraftSaving] = useState(false);
    
    // Auth state from Redux
    const { user, token } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting, isValid },
        setValue,
        trigger,
        getValues, // Use getValues to retrieve all form data
    } = useForm({
        mode: 'onChange',
        defaultValues: {},
    });

    const fields = schema?.fields || [];
    const formTitle = schema?.formSectionTitle || 'Untitled Form';

    const handlePincodeChange = useCallback(async (pincode) => {
        if (pincode && pincode.length === 6) {
            setPincodeLoading(true);
            try {
                const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
                const data = await response.json();
                
                if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
                    const postOffice = data[0].PostOffice[0];
                    const locationData = {
                        city: postOffice.District,
                        state: postOffice.State,
                        area: postOffice.Name
                    };
                    
                    const cityField = fields.find(f =>
                        f.name.toLowerCase().includes('city') || f.name.toLowerCase().includes('district')
                    );
                    const stateField = fields.find(f => f.name.toLowerCase().includes('state'));
                    const areaField = fields.find(f =>
                        f.name.toLowerCase().includes('area') || f.name.toLowerCase().includes('locality')
                    );
                    
                    if (cityField) {
                        setValue(cityField.name, locationData.city);
                        trigger(cityField.name);
                    }
                    if (stateField) {
                        setValue(stateField.name, locationData.state);
                        trigger(stateField.name);
                    }
                    if (areaField) {
                        setValue(areaField.name, locationData.area);
                        trigger(areaField.name);
                    }
                    console.log('📍 Pincode lookup completed:', locationData);
                } else {
                    console.warn('Invalid pincode or no data found');
                }
            } catch (error) {
                console.error('Pincode lookup failed:', error);
            } finally {
                setPincodeLoading(false);
            }
        }
    }, [fields, setValue, trigger]);

    const watchedValues = watch();
    React.useEffect(() => {
        const pincodeField = fields.find(f =>
            f.name.toLowerCase().includes('pincode') || f.name.toLowerCase().includes('zip')
        );
        if (pincodeField) {
            const pincodeValue = watchedValues[pincodeField.name];
            if (pincodeValue && pincodeValue.length === 6) {
                handlePincodeChange(pincodeValue);
            }
        }
    }, [watchedValues, fields, handlePincodeChange]);

    const onSubmit = (data) => {
        console.log('📝 Form submitted with validation:', data);
        toast.success("Form Submitted Successfully !");
    };

    const onSaveDraft = async () => {
        if (!user || !token) {
            toast.error('You must be signed in to save a form.');
            navigate('/signin');
            return;
        }

        setIsDraftSaving(true);
        try {
            const currentData = getValues(); // Get all form data, including unsaved changes
            
            const payload = {
                userId: user.user_id,
                title: formTitle,
                fields: fields, // Pass the schema itself, or a simplified version
                // You might also want to save the current 'currentData' values separately
            };

            const response = await axios.post('http://localhost:3000/api/forms/save', payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 201) {
                toast.success('Form saved as a draft successfully!');
                console.log('Form saved:', response.data);
                // Redirect the user to their dashboard or the newly created form's URL
                navigate(`/dashboard`);
            }
        } catch (error) {
            console.error('Error saving draft:', error);
            toast.error('Failed to save draft. Please try again.');
        } finally {
            setIsDraftSaving(false);
        }
    };

    if (!fields.length) {
        return <p className="text-red-600 text-center py-10">Invalid form schema or no fields provided.</p>;
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-800">
                {formTitle}
            </h2>
            <p className="text-gray-500 mb-6">
                {schema?.formSectionDescription || "We'll use this information to get in touch with you"}
            </p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Render First Name and Last Name side-by-side */}
                    {fields.filter(f => f.name.toLowerCase().includes('firstname') || f.name.toLowerCase().includes('first_name') || f.name.toLowerCase().includes('first name')).map(field => (
                        <FormField
                            key={field.name}
                            field={{...field, className: 'md:col-span-1'}}
                            control={control}
                            errors={errors}
                        />
                    ))}
                    {fields.filter(f => f.name.toLowerCase().includes('lastname') || f.name.toLowerCase().includes('last_name') || f.name.toLowerCase().includes('last name')).map(field => (
                        <FormField
                            key={field.name}
                            field={{...field, className: 'md:col-span-1'}}
                            control={control}
                            errors={errors}
                        />
                    ))}
                </div>

                {/* Render remaining fields not including name fields and checkboxes */}
                {fields.filter(f =>
                    !f.name.toLowerCase().includes('first') &&
                    !f.name.toLowerCase().includes('last') &&
                    (f.type !== 'checkbox' || f.options)
                ).map((field) => (
                    <FormField
                        key={field.name}
                        field={field}
                        control={control}
                        errors={errors}
                        loading={field.name.toLowerCase().includes('pincode') && pincodeLoading}
                    />
                ))}

                {/* Render checkboxes separately */}
                {fields.filter(f => f.type === 'checkbox' && !f.options).map((field) => (
                    <FormField
                        key={field.name}
                        field={{...field, label: field.label || "I'd like to receive updates and newsletters"}}
                        control={control}
                        errors={errors}
                    />
                ))}

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`font-semibold py-2 px-8 rounded-lg transition-all ${
                            isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90'
                        } text-white`}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <FiLoader className="animate-spin" />
                                Submitting...
                            </div>
                        ) : (
                            'Submit Form'
                        )}
                    </button>
                    
                    <button
                        type="button"
                        onClick={onSaveDraft}
                        disabled={isDraftSaving}
                        className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-8 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDraftSaving ? 'Saving...' : 'Save Draft'}
                    </button>
                </div>
                
                {/* Form Status */}
                {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex items-center gap-2 text-red-800">
                            <FiAlertCircle className="w-5 h-5" />
                            <span className="font-medium">Please fix the following errors:</span>
                        </div>
                        <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                            {Object.values(errors).map((error, index) => (
                                <li key={index}>{error.message}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </form>
        </div>
    );
};

export default GeneratedForm;