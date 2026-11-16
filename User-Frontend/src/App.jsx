import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AlertModal from './components/AlertModal';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AlertModal />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
