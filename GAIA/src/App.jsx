import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Auth from './componentes/Auth';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" />} />
      <Route path="/auth" element={<Auth />} />
    </Routes>
  );
}

export default App;


