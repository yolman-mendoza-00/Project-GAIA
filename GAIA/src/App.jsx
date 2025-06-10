import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';



import Auth from './componentes/Auth';
import Main from './componentes/Main';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/main" element={<Main />} />
    </Routes>
  );
}

export default App;


