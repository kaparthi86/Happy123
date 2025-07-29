'use client'

import { useState } from 'react'
import OtpInput from 'react-otp-input'
import { Shield, Smartphone, Key, AlertCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface MFAVerificationProps {
  onBack: () => void
}

export default function MFAVerification({ onBack }: MFAVerificationProps) {
  const [code, setCode] = useState('')
  const [method, setMethod] = useState<'totp' | 'sms' | 'recovery'>('totp')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [smsSent, setSmsSent] = useState(false)

  const { verifyMFA, sendSMSCode } = useAuth()

  const handleVerify = async () => {
    if (method === 'recovery' ? code.length !== 8 : code.length !== 6) {
      setError('Please enter a complete code')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const result = await verifyMFA({ code, method })
      
      if (!result.success) {
        setError(result.error || 'Verification failed')
        setCode('')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      setCode('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendSMS = async () => {
    setIsLoading(true)
    try {
      const result = await sendSMSCode()
      if (result.success) {
        setSmsSent(true)
        setMethod('sms')
        setError('')
      } else {
        setError(result.error || 'Failed to send SMS')
      }
    } catch (error) {
      setError('Failed to send SMS')
    } finally {
      setIsLoading(false)
    }
  }

  const getMethodInfo = () => {
    switch (method) {
      case 'totp':
        return {
          title: 'Authenticator App',
          description: 'Enter the 6-digit code from your authenticator app',
          icon: Shield,
          placeholder: 'Enter code from app'
        }
      case 'sms':
        return {
          title: 'SMS Verification',
          description: 'Enter the 6-digit code sent to your phone',
          icon: Smartphone,
          placeholder: 'Enter SMS code'
        }
      case 'recovery':
        return {
          title: 'Recovery Code',
          description: 'Enter one of your backup recovery codes',
          icon: Key,
          placeholder: 'Enter recovery code'
        }
    }
  }

  const methodInfo = getMethodInfo()
  const IconComponent = methodInfo.icon

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <IconComponent className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Two-Factor Authentication
          </h2>
          <p className="text-gray-600">{methodInfo.description}</p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Method Selection */}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setMethod('totp')
                setCode('')
                setError('')
              }}
              className={`flex-1 p-3 rounded-lg text-sm font-medium transition-colors ${
                method === 'totp'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <Shield className="w-4 h-4 mx-auto mb-1" />
              App
            </button>
            <button
              onClick={() => {
                if (!smsSent) {
                  handleSendSMS()
                } else {
                  setMethod('sms')
                  setCode('')
                  setError('')
                }
              }}
              disabled={isLoading}
              className={`flex-1 p-3 rounded-lg text-sm font-medium transition-colors ${
                method === 'sms'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
              } disabled:opacity-50`}
            >
              <Smartphone className="w-4 h-4 mx-auto mb-1" />
              {smsSent ? 'SMS' : 'Send SMS'}
            </button>
            <button
              onClick={() => {
                setMethod('recovery')
                setCode('')
                setError('')
              }}
              className={`flex-1 p-3 rounded-lg text-sm font-medium transition-colors ${
                method === 'recovery'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <Key className="w-4 h-4 mx-auto mb-1" />
              Recovery
            </button>
          </div>

          {/* Code Input */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 text-center">
              {methodInfo.title}
            </label>
            
            <div className="flex justify-center">
              <OtpInput
                value={code}
                onChange={setCode}
                numInputs={method === 'recovery' ? 8 : 6}
                separator={<span className="mx-1"></span>}
                inputStyle={{
                  width: method === 'recovery' ? '2.5rem' : '3rem',
                  height: method === 'recovery' ? '2.5rem' : '3rem',
                  margin: '0 0.25rem',
                  fontSize: '1.25rem',
                  borderRadius: '0.5rem',
                  border: '2px solid #d1d5db',
                  textAlign: 'center',
                  outline: 'none',
                  transition: 'border-color 0.15s ease-in-out'
                }}
                focusStyle={{
                  borderColor: '#3b82f6',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                }}
                isInputNum={method !== 'recovery'}
                shouldAutoFocus
              />
            </div>

            {method === 'sms' && smsSent && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Code sent to your phone. Use &quot;123456&quot; for demo.
                </p>
                <button
                  onClick={handleSendSMS}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
                >
                  Resend code
                </button>
              </div>
            )}

            {method === 'recovery' && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Recovery codes are 8 characters long and can only be used once.
                </p>
              </div>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isLoading || (method === 'recovery' ? code.length !== 8 : code.length !== 6)}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Back Button */}
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-2">
            <p>
              <strong>Authenticator App:</strong> Use Google Authenticator, Authy, or similar apps
            </p>
            <p>
              <strong>SMS:</strong> For demo, use code &quot;123456&quot;
            </p>
            <p>
              <strong>Recovery:</strong> Use backup codes from your account setup
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}