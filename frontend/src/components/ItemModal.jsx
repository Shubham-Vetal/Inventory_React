import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, Tag, Mail } from 'lucide-react';

const ItemModal = ({ item, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showEnquireSuccess, setShowEnquireSuccess] = useState(false);
  const [isSendingEnquiry, setIsSendingEnquiry] = useState(false); // New state for loading
  const [enquiryError, setEnquiryError] = useState(null); // New state for error

  const allImages = [item.coverImage, ...(item.additionalImages || [])];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleEnquire = async () => { // Make this an async function
    setIsSendingEnquiry(true); // Start loading
    setEnquiryError(null); // Clear previous errors
    setShowEnquireSuccess(false); // Hide previous success message

    try {
      // Assuming your backend endpoint is /api/items/:id/enquire
      const response = await fetch(`http://localhost:3000/api/items/${item._id}/enquire`, {
        method: 'POST', // Use POST method as it triggers an action (sending email)
        headers: {
          'Content-Type': 'application/json',
        },
        // If you need to send any body data with the enquiry (e.g., user email, message)
        // body: JSON.stringify({ userEmail: 'user@example.com', message: 'I am interested...' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send enquiry email');
      }

      console.log(`Enquiry sent for item: ${item.name} successfully!`);
      setShowEnquireSuccess(true);
      setTimeout(() => setShowEnquireSuccess(false), 5000); // Show success for 5 seconds
    } catch (error) {
      console.error("Error sending enquiry:", error);
      setEnquiryError(error.message); // Set the error message
    } finally {
      setIsSendingEnquiry(false); // End loading
    }
  };

  if (!isOpen) return null;

  // Convert the dateAdded string to a Date object for display
  const dateObject = item.dateAdded ? new Date(item.dateAdded) : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Carousel */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={allImages[currentImageIndex]}
                  alt={`${item.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors duration-200"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors duration-200"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-700" />
                    </button>
                  </>
                )}

                {allImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
                    {allImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                  <Tag className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">{item.type}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Added {dateObject ? dateObject.toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleEnquire}
                  disabled={isSendingEnquiry} // Disable button while sending
                  className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2
                    ${isSendingEnquiry ? 'opacity-70 cursor-not-allowed' : 'hover:from-blue-700 hover:to-indigo-700'}
                  `}
                >
                  {isSendingEnquiry ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5" />
                      <span>Enquire</span>
                    </>
                  )}
                </button>

                {showEnquireSuccess && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm font-medium">
                      Enquiry sent successfully!
                    </p>
                  </div>
                )}
                {enquiryError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm font-medium">
                      Error: {enquiryError}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;