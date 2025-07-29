'use client'

import { useState, useEffect } from 'react'
import OtpInput from 'react-otp-input'
import { Shield, Download, Copy, Check, AlertCircle, QrCode } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { MFASetup as MFASetupType } from '@/types'

interface MFASetupProps {
  onComplete: () => void
  onSkip?: () => void
}

export default function MFASetup({ onComplete, onSkip }: MFASetupProps) {
  const [step, setStep] = useState<'intro' | 'setup' | 'verify' | 'backup'>('intro')
  const [mfaSetup, setMfaSetup] = useState<MFASetupType | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedCodes, setCopiedCodes] = useState(false)

  const { setupMFA, enableMFA } = useAuth()

  const handleStartSetup = async () => {
    setIsLoading(true)
    setError('')

    try {
      const setup = await setupMFA()
      setMfaSetup(setup)
      setStep('setup')
    } catch (error) {
      setError('Failed to initialize MFA setup')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a complete 6-digit code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await enableMFA(verificationCode)
      
      if (result.success) {
        setStep('backup')
      } else {
        setError(result.error || 'Invalid verification code')
        setVerificationCode('')
      }
    } catch (error) {
      setError('Network error. Please try again.')
      setVerificationCode('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyRecoveryCodes = () => {
    if (mfaSetup?.backupCodes) {
      const codesText = mfaSetup.backupCodes.join('\n')
      navigator.clipboard.writeText(codesText)
      setCopiedCodes(true)
      setTimeout(() => setCopiedCodes(false), 2000)
    }
  }

  const handleDownloadRecoveryCodes = () => {
    if (mfaSetup?.backupCodes) {
      const codesText = mfaSetup.backupCodes.join('\n')
      const blob = new Blob([codesText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'socialhub-recovery-codes.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const renderIntroStep = () => (
    <div className="text-center">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <Shield className="w-8 h-8 text-blue-600" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Secure Your Account
      </h2>
      <p className="text-gray-600 mb-8">
        Two-factor authentication adds an extra layer of security to your account. 
        You&apos;ll need your phone to sign in, even if someone knows your password.
      </p>

      <div className="space-y-4 mb-8">
        <div className="flex items-start space-x-3 text-left">
          <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Enhanced Security</h3>
            <p className="text-sm text-gray-600">Protect against unauthorized access</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 text-left">
          <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Multiple Methods</h3>
            <p className="text-sm text-gray-600">Authenticator app, SMS, and recovery codes</p>
          </div>
        </div>
        <div className="flex items-start space-x-3 text-left">
          <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Industry Standard</h3>
            <p className="text-sm text-gray-600">Compatible with Google Authenticator, Authy, and more</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleStartSetup}
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Setting up...
            </div>
          ) : (
            'Set Up Two-Factor Authentication'
          )}
        </button>
        
        {onSkip && (
          <button
            onClick={onSkip}
            className="w-full py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  )

  const renderSetupStep = () => (
    <div>
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <QrCode className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Scan QR Code
        </h2>
        <p className="text-gray-600">
          Use your authenticator app to scan this QR code
        </p>
      </div>

      {mfaSetup && (
        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <img 
                src={mfaSetup.qrCodeUrl} 
                alt="QR Code for 2FA setup"
                className="w-48 h-48"
              />
            </div>
          </div>

          {/* Manual Entry */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Can&apos;t scan? Enter this code manually:
            </h3>
            <div className="flex items-center space-x-2">
              <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono">
                {mfaSetup.secret}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(mfaSetup.secret)}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Copy secret key"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Instructions:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Open your authenticator app (Google Authenticator, Authy, etc.)</li>
              <li>Tap &quot;Add account&quot; or the &quot;+&quot; button</li>
              <li>Scan the QR code above or enter the secret key manually</li>
              <li>Enter the 6-digit code from your app below</li>
            </ol>
          </div>

          <button
            onClick={() => setStep('verify')}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            I&apos;ve Added the Account
          </button>
        </div>
      )}
    </div>
  )

  const renderVerifyStep = () => (
    <div>
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Verify Setup
        </h2>
        <p className="text-gray-600">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex justify-center">
          <OtpInput
            value={verificationCode}
            onChange={setVerificationCode}
            numInputs={6}
            separator={<span className="mx-1"></span>}
            inputStyle={{
              width: '3rem',
              height: '3rem',
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
            isInputNum
            shouldAutoFocus
          />
        </div>

        <button
          onClick={handleVerifyCode}
          disabled={isLoading || verificationCode.length !== 6}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Verifying...
            </div>
          ) : (
            'Verify and Enable'
          )}
        </button>

        <button
          onClick={() => setStep('setup')}
          className="w-full py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Back to QR Code
        </button>
      </div>
    </div>
  )

  const renderBackupStep = () => (
    <div>
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Two-Factor Authentication Enabled!
        </h2>
        <p className="text-gray-600">
          Save these recovery codes in a safe place
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Important!</h3>
              <p className="text-sm text-yellow-700 mt-1">
                These recovery codes can be used to access your account if you lose your phone. 
                Each code can only be used once. Store them securely!
              </p>
            </div>
          </div>
        </div>

        {mfaSetup?.backupCodes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Recovery Codes</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleCopyRecoveryCodes}
                  className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
                >
                  {copiedCodes ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadRecoveryCodes}
                  className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {mfaSetup.backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="bg-white px-3 py-2 rounded border text-sm font-mono text-center"
                >
                  {code}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onComplete}
          className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Continue to SocialHub
        </button>
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {error && step === 'intro' && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {step === 'intro' && renderIntroStep()}
        {step === 'setup' && renderSetupStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'backup' && renderBackupStep()}
      </div>
    </div>
  )
}