import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ViewItems from './pages/ViewItems';
import AddItem from './pages/AddItem';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Routes>
        <Route path="/" element={<ViewItems />} />
        <Route path="/add" element={<AddItem />} />
      </Routes>
    </div>
  );
}

export default App;