import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  telaId: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, telaId }) => {
  const { isAuthenticated, verificarAutorizacao } = useAuthStore();
  const location = useLocation();

  // Verificar se o usuário está autenticado
  if (!isAuthenticated) {
    // Redirecionar para a página de login, salvando a localização atual
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar se o usuário tem autorização para acessar esta tela
  if (!verificarAutorizacao(telaId)) {
    // Redirecionar para uma página de acesso negado
    return <Navigate to="/acesso-negado" replace />;
  }

  // Se estiver autenticado e autorizado, renderizar o conteúdo
  return <>{children}</>;
};

export default ProtectedRoute;
