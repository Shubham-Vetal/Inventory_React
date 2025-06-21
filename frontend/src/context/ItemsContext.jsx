import React, { createContext, useContext, useState, useEffect } from 'react';

const ItemsContext = createContext(undefined);

const API_BASE_URL = '/api/items'; 

export const ItemsProvider = ({ children }) => {
  const [items, setItems] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 


  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setItems(data);
      } catch (err) {
        console.error("Failed to fetch items:", err);
        setError("Failed to load items. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []); // Empty dependency array means this runs once on mount

  // --- Add a new item ---
  const addItem = async (itemData) => {
    // itemData is expected to be a FormData object from your form,
    // containing name, type, description, coverImage (File), additionalImages (File list)
    setError(null); // Clear previous errors
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        // When sending FormData, browsers automatically set Content-Type: multipart/form-data
        // Do NOT manually set 'Content-Type': 'multipart/form-data' here, as it will break
        // the boundary string generation.
        body: itemData // itemData should be a FormData object
      });

      if (!response.ok) {
        const errorData = await response.json(); // Attempt to read backend error message
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
      }

      const newItem = await response.json();
      setItems(prev => [newItem.item, ...prev]); // Add the newly created item from backend response
      return newItem; // Return the new item, maybe with ID
    } catch (err) {
      console.error("Failed to add item:", err);
      setError(`Failed to add item: ${err.message}`);
      throw err; // Re-throw to allow component to handle if needed
    }
  };

  // --- Get item by ID ---
  const getItemById = async (id) => {
    setError(null); // Clear previous errors
    // Note: This won't update the 'items' state, it just fetches a single item
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const item = await response.json();
      return item;
    } catch (err) {
      console.error(`Failed to fetch item with ID ${id}:`, err);
      setError(`Failed to load item: ${err.message}`);
      throw err; // Re-throw to allow component to handle if needed
    }
  };

  return (
    <ItemsContext.Provider value={{ items, isLoading, error, addItem, getItemById }}>
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = () => {
  const context = useContext(ItemsContext);
  if (context === undefined) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
};