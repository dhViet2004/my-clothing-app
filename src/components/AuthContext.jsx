import { createContext, useContext, useState } from 'react';

// Tạo context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token') || null,
    user: (() => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null; // Kiểm tra an toàn
    })(),
  });

  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState({ token, user });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Export AuthContext để sử dụng trực tiếp nếu cần
export { AuthContext };