'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { AuthState, AuthUser, LoginCredentials, SignUpCredentials, MFAVerification, MFASetup } from '@/types'
import { authService } from '@/services/authService'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; requiresMFA?: boolean; error?: string }>
  signup: (credentials: SignUpCredentials) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  verifyMFA: (verification: MFAVerification) => Promise<{ success: boolean; error?: string }>
  setupMFA: () => Promise<MFASetup>
  enableMFA: (code: string) => Promise<{ success: boolean; error?: string }>
  disableMFA: (code: string) => Promise<{ success: boolean; error?: string }>
  generateRecoveryCodes: () => Promise<string[]>
  sendSMSCode: () => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_MFA_REQUIRED'; payload: boolean }
  | { type: 'SET_MFA_SETUP_REQUIRED'; payload: boolean }
  | { type: 'LOGOUT' }

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        mfaRequired: false,
        mfaSetupRequired: action.payload?.mfaSetupRequired || false
      }
    case 'SET_MFA_REQUIRED':
      return { ...state, mfaRequired: action.payload, isLoading: false }
    case 'SET_MFA_SETUP_REQUIRED':
      return { ...state, mfaSetupRequired: action.payload }
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        mfaRequired: false,
        mfaSetupRequired: false
      }
    default:
      return state
  }
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  mfaRequired: false,
  mfaSetupRequired: false
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    // Check for existing session on app load
    const checkAuthStatus = async () => {
      try {
        const user = await authService.getCurrentUser()
        if (user) {
          dispatch({ type: 'SET_USER', payload: user })
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const result = await authService.login(credentials)
      
      if (result.success && !result.requiresMFA) {
        dispatch({ type: 'SET_USER', payload: result.user! })
        return { success: true }
      } else if (result.requiresMFA) {
        dispatch({ type: 'SET_MFA_REQUIRED', payload: true })
        return { success: false, requiresMFA: true }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
        return { success: false, error: result.error || 'Login failed' }
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return { success: false, error: 'Network error' }
    }
  }

  const signup = async (credentials: SignUpCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const result = await authService.signup(credentials)
      
      if (result.success) {
        dispatch({ type: 'SET_USER', payload: result.user! })
        dispatch({ type: 'SET_MFA_SETUP_REQUIRED', payload: true })
        return { success: true }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
        return { success: false, error: result.error || 'Signup failed' }
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return { success: false, error: 'Network error' }
    }
  }

  const logout = () => {
    authService.logout()
    dispatch({ type: 'LOGOUT' })
  }

  const verifyMFA = async (verification: MFAVerification) => {
    try {
      const result = await authService.verifyMFA(verification)
      
      if (result.success) {
        dispatch({ type: 'SET_USER', payload: result.user! })
        return { success: true }
      } else {
        return { success: false, error: result.error || 'MFA verification failed' }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const setupMFA = async (): Promise<MFASetup> => {
    return await authService.setupMFA()
  }

  const enableMFA = async (code: string) => {
    try {
      const result = await authService.enableMFA(code)
      
      if (result.success && state.user) {
        const updatedUser = { ...state.user, mfaEnabled: true, mfaSetupRequired: false }
        dispatch({ type: 'SET_USER', payload: updatedUser })
        dispatch({ type: 'SET_MFA_SETUP_REQUIRED', payload: false })
      }
      
      return result
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const disableMFA = async (code: string) => {
    try {
      const result = await authService.disableMFA(code)
      
      if (result.success && state.user) {
        const updatedUser = { ...state.user, mfaEnabled: false }
        dispatch({ type: 'SET_USER', payload: updatedUser })
      }
      
      return result
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const generateRecoveryCodes = async (): Promise<string[]> => {
    return await authService.generateRecoveryCodes()
  }

  const sendSMSCode = async () => {
    try {
      return await authService.sendSMSCode()
    } catch (error) {
      return { success: false, error: 'Failed to send SMS code' }
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    verifyMFA,
    setupMFA,
    enableMFA,
    disableMFA,
    generateRecoveryCodes,
    sendSMSCode
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}