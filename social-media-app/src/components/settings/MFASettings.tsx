'use client'

import { useState } from 'react'
import { Shield, Smartphone, Key, Check, X, AlertCircle, Download, Copy } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import OtpInput from 'react-otp-input'

export default function MFASettings() {
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false)
  const [disableCode, setDisableCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [copiedCodes, setCopiedCodes] = useState(false)

  const { user, disableMFA, generateRecoveryCodes } = useAuth()

  const handleDisableMFA = async () => {
    if (disableCode.length !== 6) {
      setError('Please enter a complete 6-digit code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await disableMFA(disableCode)
      
      if (result.success) {
        setShowDisableConfirm(false)
        setDisableCode('')
      } else {
        setError(result.error || 'Failed to disable MFA')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateRecoveryCodes = async () => {
    setIsLoading(true)
    try {
      const codes = await generateRecoveryCodes()
      setRecoveryCodes(codes)
      setShowRecoveryCodes(true)
    } catch (error) {
      setError('Failed to generate recovery codes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyRecoveryCodes = () => {
    const codesText = recoveryCodes.join('\n')
    navigator.clipboard.writeText(codesText)
    setCopiedCodes(true)
    setTimeout(() => setCopiedCodes(false), 2000)
  }

  const handleDownloadRecoveryCodes = () => {
    const codesText = recoveryCodes.join('\n')
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

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Two-Factor Authentication
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your account security settings
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* MFA Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                user.mfaEnabled ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                {user.mfaEnabled ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Two-Factor Authentication
                </h3>
                <p className="text-sm text-gray-600">
                  {user.mfaEnabled 
                    ? 'Your account is protected with 2FA' 
                    : 'Add an extra layer of security to your account'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                user.mfaEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user.mfaEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {user.mfaEnabled && (
            <>
              {/* Available Methods */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Available Methods</h3>
                <div className="space-y-3">
                  {user.backupMethods.includes('totp') && (
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Shield className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Authenticator App</p>
                          <p className="text-xs text-gray-600">Google Authenticator, Authy, etc.</p>
                        </div>
                      </div>
                      <span className="text-xs text-green-600 font-medium">Active</span>
                    </div>
                  )}

                  {user.backupMethods.includes('sms') && (
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">SMS Backup</p>
                          <p className="text-xs text-gray-600">Receive codes via text message</p>
                        </div>
                      </div>
                      <span className="text-xs text-green-600 font-medium">Active</span>
                    </div>
                  )}

                  {user.backupMethods.includes('recovery') && (
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Key className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Recovery Codes</p>
                          <p className="text-xs text-gray-600">Backup codes for account recovery</p>
                        </div>
                      </div>
                      <button
                        onClick={handleGenerateRecoveryCodes}
                        disabled={isLoading}
                        className="text-xs text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50"
                      >
                        Generate New
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Disable MFA */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Disable Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This will remove the extra security layer from your account. You can re-enable it at any time.
                </p>
                
                {!showDisableConfirm ? (
                  <button
                    onClick={() => setShowDisableConfirm(true)}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Disable 2FA
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-red-800">Confirm Disable</h4>
                        <p className="text-sm text-red-700 mt-1 mb-4">
                          Enter a code from your authenticator app to disable two-factor authentication.
                        </p>
                        
                        {error && (
                          <div className="mb-4 text-sm text-red-600">{error}</div>
                        )}

                        <div className="flex justify-center mb-4">
                          <OtpInput
                            value={disableCode}
                            onChange={setDisableCode}
                            numInputs={6}
                            separator={<span className="mx-1"></span>}
                            inputStyle={{
                              width: '2.5rem',
                              height: '2.5rem',
                              margin: '0 0.25rem',
                              fontSize: '1rem',
                              borderRadius: '0.375rem',
                              border: '1px solid #fca5a5',
                              textAlign: 'center',
                              outline: 'none',
                              backgroundColor: '#fef2f2'
                            }}
                            focusStyle={{
                              borderColor: '#dc2626',
                              boxShadow: '0 0 0 2px rgba(220, 38, 38, 0.2)'
                            }}
                            isInputNum
                            shouldAutoFocus
                          />
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={handleDisableMFA}
                            disabled={isLoading || disableCode.length !== 6}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            {isLoading ? 'Disabling...' : 'Confirm Disable'}
                          </button>
                          <button
                            onClick={() => {
                              setShowDisableConfirm(false)
                              setDisableCode('')
                              setError('')
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {!user.mfaEnabled && (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Two-Factor Authentication is Disabled
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Enable 2FA to add an extra layer of security to your account. 
                                  You&apos;ll need your phone to sign in, even if someone knows your password.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Enable Two-Factor Authentication
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recovery Codes Modal */}
      {showRecoveryCodes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">New Recovery Codes</h3>
                <button
                  onClick={() => setShowRecoveryCodes(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Important!</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        These codes replace your previous recovery codes. Save them in a secure location.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">Recovery Codes</h4>
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
                    {recoveryCodes.map((code, index) => (
                      <div
                        key={index}
                        className="bg-white px-3 py-2 rounded border text-sm font-mono text-center"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowRecoveryCodes(false)}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                                        I&apos;ve Saved These Codes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}