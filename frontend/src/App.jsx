import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';

import Home from './pages/Home';
import Sobre from './pages/Sobre';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import ResourceViewer from './pages/ResourceViewer';
import Forum from './pages/Forum';
import Profile from './pages/Profile';
import EvaluateStudents from './pages/EvaluateStudents';
import Progress from './pages/Progress';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ErrorBoundary>
    <AccessibilityProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/entrar" element={<Login />} />
            <Route path="/registrar" element={<Register />} />

            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/biblioteca" element={<Library />} />
              <Route path="/biblioteca/:id" element={<ResourceViewer />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/perfil" element={<Profile />} />
              <Route
                path="/avaliar"
                element={
                  <ProtectedRoute roles={['tutor']}>
                    <EvaluateStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/progresso"
                element={
                  <ProtectedRoute roles={['aluno', 'responsavel']}>
                    <Progress />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AccessibilityProvider>
    </ErrorBoundary>
  );
}
