import React, { createContext, useContext } from 'react';

// Minimal placeholder for useAuth context
export const AuthContext = createContext<any>({ user: null });

export const useAuth = () => useContext(AuthContext);
