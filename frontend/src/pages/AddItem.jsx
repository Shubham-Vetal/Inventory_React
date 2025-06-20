import React, { useState, useEffect } from 'react';
import { useItems } from '../context/ItemsContext';
import { useNavigate } from 'react-router-dom';
import SuccessNotification from '../components/SuccessNotification';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';

const itemTypes = ['Shirt', 'Pant', 'Shoes', 'Sports Gear', 'Accessories', 'Electronics', 'Other'];

const AddItem = () => {
  const { addItem } = useItems(); // addItem from context now expects FormData
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    type: 'Shirt',
    description: '',
    // Store both the File object and its temporary preview URL
    coverImage: { file: null, preview: '' },
    additionalImages: [] // Array of { file: File, preview: string } objects
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null); // To display backend errors

  // Effect to clean up temporary URLs when component unmounts or images change
  useEffect(() => {
    // Revoke URL for cover image
    return () => {
      if (formData.coverImage.preview) {
        URL.revokeObjectURL(formData.coverImage.preview);
      }
      // Revoke URLs for additional images
      formData.additionalImages.forEach(img => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [formData.coverImage.preview, formData.additionalImages]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setSubmissionError(null); // Clear submission error on input change
  };

  const handleImageUpload = (e, isCover = false) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic client-side validation for image type and size
      const acceptedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/tiff', 'image/bmp'];
      const maxFileSize = 5 * 1024 * 1024; // 5 MB

      if (!acceptedImageTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, [e.target.name || 'fileUpload']: 'Only image files (jpeg, jpg, png, gif, webp, tiff, bmp) are allowed.' }));
        return;
      }
      if (file.size > maxFileSize) {
        setErrors(prev => ({ ...prev, [e.target.name || 'fileUpload']: 'Image file size must be under 5MB.' }));
        return;
      }

      // Create a URL for image preview (temporary)
      const imageUrl = URL.createObjectURL(file);

      if (isCover) {
        // Revoke previous URL if exists
        if (formData.coverImage.preview) {
          URL.revokeObjectURL(formData.coverImage.preview);
        }
        setFormData(prev => ({ ...prev, coverImage: { file, preview: imageUrl } }));
        if (errors.coverImage) { // Clear error if image is now selected
          setErrors(prev => ({ ...prev, coverImage: '' }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          additionalImages: [...prev.additionalImages, { file, preview: imageUrl }]
        }));
      }
      // Clear general file upload error if specific to previous file
      if (e.target.name && errors[e.target.name]) {
        setErrors(prev => ({ ...prev, [e.target.name]: '' }));
      }
      setSubmissionError(null); // Clear submission error on file selection
    }
  };

  const removeCoverImage = () => {
    if (formData.coverImage.preview) {
      URL.revokeObjectURL(formData.coverImage.preview); // Clean up
    }
    setFormData(prev => ({ ...prev, coverImage: { file: null, preview: '' } }));
    setErrors(prev => ({ ...prev, coverImage: 'Cover image is required' })); // Re-add error
  };

  const removeAdditionalImage = (indexToRemove) => {
    setFormData(prev => {
      const newAdditionalImages = prev.additionalImages.filter((_, i) => i !== indexToRemove);
      // Clean up the URL for the removed image
      if (prev.additionalImages[indexToRemove]?.preview) {
        URL.revokeObjectURL(prev.additionalImages[indexToRemove].preview);
      }
      return { ...prev, additionalImages: newAdditionalImages };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Item description is required';
    }

    // Check if a file is actually selected for coverImage
    if (!formData.coverImage.file) {
      newErrors.coverImage = 'Cover image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmissionError(null); // Clear any previous submission errors

    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a FormData object to send to the backend
      const itemFormData = new FormData();
      itemFormData.append('name', formData.name);
      itemFormData.append('type', formData.type);
      itemFormData.append('description', formData.description);

      // Append the actual File objects
      if (formData.coverImage.file) {
        itemFormData.append('coverImage', formData.coverImage.file);
      }
      formData.additionalImages.forEach((img, index) => {
        if (img.file) {
          // IMPORTANT: The backend Multer field name is 'additionalImages'
          itemFormData.append('additionalImages', img.file);
        }
      });

      // Call the addItem context function with the FormData object
      await addItem(itemFormData); // Your context function already makes the API call

      setShowSuccess(true); // Show success notification

      // Reset form state including file and preview URLs
      setFormData({
        name: '',
        type: 'Shirt',
        description: '',
        coverImage: { file: null, preview: '' },
        additionalImages: []
      });

      // Auto-redirect after success message
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Error adding item:', error);
      // Display the error coming from the context's addItem
      setSubmissionError(error.message || 'Failed to add item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Item</h1>
          <p className="text-gray-600">Fill in the details to add a new item to your inventory</p>
        </div>

        {submissionError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {submissionError}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Item Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter item name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Item Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Item Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                {itemTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Item Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Item Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Describe the item in detail"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Cover Image */}
            <div>
              <label htmlFor="coverImageInput" className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image *
              </label>
              {formData.coverImage.preview ? (
                <div className="relative">
                  <img
                    src={formData.coverImage.preview} // Use the preview URL
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeCoverImage} // Use new remove function
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label htmlFor="coverImageInput" className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                  errors.coverImage ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-10 w-10 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-500 font-medium">Click to upload cover image</p>
                    <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    id="coverImageInput" // Add ID to link with label
                    name="coverImage" // Add name for validation clarity
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                  />
                </label>
              )}
              {errors.coverImage && (
                <p className="mt-1 text-sm text-red-600">{errors.coverImage}</p>
              )}
              {errors.fileUpload && errors.coverImage !== 'Cover image is required' && ( // Display general file upload error
                <p className="mt-1 text-sm text-red-600">{errors.fileUpload}</p>
              )}
            </div>

            {/* Additional Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Images (Optional)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {formData.additionalImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.preview} // Use the preview URL
                      alt={`Additional ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {formData.additionalImages.length < 5 && ( // Max 5 additional images
                  <label htmlFor="additionalImageInput" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                    <Plus className="h-6 w-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Add Image</span>
                    <input
                      type="file"
                      id="additionalImageInput" // Add ID
                      name="additionalImages" // Add name
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                    />
                  </label>
                )}
              </div>

              <p className="text-xs text-gray-500">
                You can add up to 5 additional images. These will be shown in the item gallery. (Backend limit is 5)
              </p>
               {errors.fileUpload && errors.coverImage !== 'Cover image is required' && ( // Display general file upload error
                <p className="mt-1 text-sm text-red-600">{errors.fileUpload}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 ${
                  isSubmitting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Adding Item...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-5 w-5" />
                    <span>Add Item</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Success Notification */}
        <SuccessNotification
          message="Item successfully added!"
          isVisible={showSuccess}
          onClose={() => setShowSuccess(false)}
        />
      </div>
    </div>
  );
};

export default AddItem;