import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';



import Auth from './componentes/Auth';
import Main from './componentes/Main';
import Recuperar from './componentes/Recuperar';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" />} />
      <Route path="/auth" element={<Auth />} />

      <Route path="/main" element={<Main />} />
      <Route path="/recuperar" element={<Recuperar />} />
    </Routes>
  )};
export default App;


