'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import MFAVerification from './MFAVerification'
import MFASetup from './MFASetup'

interface AuthWrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const { 
    isAuthenticated, 
    isLoading, 
    mfaRequired, 
    mfaSetupRequired,
    user 
  } = useAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show MFA verification if required
  if (mfaRequired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <MFAVerification onBack={() => window.location.reload()} />
      </div>
    )
  }

  // Show MFA setup if required for new users
  if (isAuthenticated && mfaSetupRequired) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <MFASetup 
          onComplete={() => window.location.reload()}
          onSkip={() => window.location.reload()}
        />
      </div>
    )
  }

  // Show login/signup forms if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {authMode === 'login' ? (
          <LoginForm onSwitchToSignup={() => setAuthMode('signup')} />
        ) : (
          <SignupForm onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    )
  }

  // User is authenticated, show the main app
  return <>{children}</>
}