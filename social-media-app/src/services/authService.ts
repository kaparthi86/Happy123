import * as speakeasy from 'speakeasy'
import * as QRCode from 'qrcode'
import * as CryptoJS from 'crypto-js'
import { AuthUser, LoginCredentials, SignUpCredentials, MFAVerification, MFASetup, User } from '@/types'

// Simulated database - in a real app, this would be replaced with actual API calls
interface StoredUser {
  id: string
  email: string
  passwordHash: string
  username: string
  displayName: string
  avatar: string
  mfaEnabled: boolean
  totpSecret?: string
  phoneNumber?: string
  recoveryCodes?: string[]
  backupMethods: ('totp' | 'sms' | 'recovery')[]
  followers: number
  following: number
  joinDate: Date
  bio?: string
  verified: boolean
}

// Mock user storage
const users: StoredUser[] = [
  {
    id: '1',
    email: 'john@example.com',
    passwordHash: CryptoJS.SHA256('password123').toString(),
    username: 'johndoe',
    displayName: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Tech enthusiast and coffee lover ☕',
    verified: true,
    followers: 12500,
    following: 890,
    joinDate: new Date('2022-01-15'),
    mfaEnabled: false,
    backupMethods: []
  }
]

// Session storage
let currentSession: { userId: string; sessionId: string; pendingMFA?: boolean } | null = null
let pendingMFAUser: StoredUser | null = null

class AuthService {
  private generateSessionId(): string {
    return CryptoJS.lib.WordArray.random(128/8).toString()
  }

  private hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString()
  }

  private generateRecoveryCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private generateRecoveryCodes(): string[] {
    return Array.from({ length: 10 }, () => this.generateRecoveryCode())
  }

  private findUserByEmail(email: string): StoredUser | undefined {
    return users.find(user => user.email.toLowerCase() === email.toLowerCase())
  }

  private findUserById(id: string): StoredUser | undefined {
    return users.find(user => user.id === id)
  }

  private updateUser(userId: string, updates: Partial<StoredUser>): void {
    const userIndex = users.findIndex(user => user.id === userId)
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates }
    }
  }

  private convertToAuthUser(user: StoredUser): AuthUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      mfaEnabled: user.mfaEnabled,
      mfaSetupRequired: !user.mfaEnabled, // New users should set up MFA
      backupMethods: user.backupMethods
    }
  }

  async login(credentials: LoginCredentials): Promise<{
    success: boolean
    user?: AuthUser
    requiresMFA?: boolean
    error?: string
  }> {
    const user = this.findUserByEmail(credentials.email)
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }

    const passwordHash = this.hashPassword(credentials.password)
    if (user.passwordHash !== passwordHash) {
      return { success: false, error: 'Invalid email or password' }
    }

    // If MFA is enabled, require MFA verification
    if (user.mfaEnabled) {
      pendingMFAUser = user
      return { success: false, requiresMFA: true }
    }

    // Create session
    const sessionId = this.generateSessionId()
    currentSession = { userId: user.id, sessionId }

    // Store session in localStorage (in a real app, use secure httpOnly cookies)
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_session', JSON.stringify(currentSession))
    }

    return {
      success: true,
      user: this.convertToAuthUser(user)
    }
  }

  async signup(credentials: SignUpCredentials): Promise<{
    success: boolean
    user?: AuthUser
    error?: string
  }> {
    // Check if user already exists
    if (this.findUserByEmail(credentials.email)) {
      return { success: false, error: 'User with this email already exists' }
    }

    // Check if username is taken
    if (users.find(user => user.username.toLowerCase() === credentials.username.toLowerCase())) {
      return { success: false, error: 'Username is already taken' }
    }

    // Create new user
    const newUser: StoredUser = {
      id: (users.length + 1).toString(),
      email: credentials.email,
      passwordHash: this.hashPassword(credentials.password),
      username: credentials.username,
      displayName: credentials.displayName,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(credentials.displayName)}&background=3b82f6&color=fff`,
      bio: '',
      verified: false,
      followers: 0,
      following: 0,
      joinDate: new Date(),
      mfaEnabled: false,
      backupMethods: []
    }

    users.push(newUser)

    // Create session
    const sessionId = this.generateSessionId()
    currentSession = { userId: newUser.id, sessionId }

    // Store session in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_session', JSON.stringify(currentSession))
    }

    return {
      success: true,
      user: this.convertToAuthUser(newUser)
    }
  }

  async verifyMFA(verification: MFAVerification): Promise<{
    success: boolean
    user?: AuthUser
    error?: string
  }> {
    if (!pendingMFAUser) {
      return { success: false, error: 'No pending MFA verification' }
    }

    const user = pendingMFAUser
    let isValid = false

    switch (verification.method) {
      case 'totp':
        if (user.totpSecret) {
          isValid = speakeasy.totp.verify({
            secret: user.totpSecret,
            encoding: 'base32',
            token: verification.code,
            window: 2 // Allow 2 time steps tolerance
          })
        }
        break

      case 'sms':
        // In a real app, you would verify against the SMS code sent to the user
        // For demo purposes, accept '123456' as valid SMS code
        isValid = verification.code === '123456'
        break

      case 'recovery':
        if (user.recoveryCodes && user.recoveryCodes.includes(verification.code)) {
          isValid = true
          // Remove used recovery code
          const updatedCodes = user.recoveryCodes.filter(code => code !== verification.code)
          this.updateUser(user.id, { recoveryCodes: updatedCodes })
        }
        break
    }

    if (!isValid) {
      return { success: false, error: 'Invalid verification code' }
    }

    // Create session
    const sessionId = this.generateSessionId()
    currentSession = { userId: user.id, sessionId }
    pendingMFAUser = null

    // Store session in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_session', JSON.stringify(currentSession))
    }

    return {
      success: true,
      user: this.convertToAuthUser(user)
    }
  }

  async setupMFA(): Promise<MFASetup> {
    if (!currentSession) {
      throw new Error('Not authenticated')
    }

    const user = this.findUserById(currentSession.userId)
    if (!user) {
      throw new Error('User not found')
    }

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `SocialHub (${user.email})`,
      issuer: 'SocialHub'
    })

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    // Generate recovery codes
    const backupCodes = this.generateRecoveryCodes()

    // Store the secret temporarily (it will be saved when MFA is enabled)
    user.totpSecret = secret.base32

    return {
      secret: secret.base32!,
      qrCodeUrl,
      backupCodes
    }
  }

  async enableMFA(code: string): Promise<{ success: boolean; error?: string }> {
    if (!currentSession) {
      return { success: false, error: 'Not authenticated' }
    }

    const user = this.findUserById(currentSession.userId)
    if (!user || !user.totpSecret) {
      return { success: false, error: 'MFA setup not initiated' }
    }

    // Verify the TOTP code
    const isValid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: code,
      window: 2
    })

    if (!isValid) {
      return { success: false, error: 'Invalid verification code' }
    }

    // Enable MFA and generate recovery codes
    const recoveryCodes = this.generateRecoveryCodes()
    this.updateUser(user.id, {
      mfaEnabled: true,
      recoveryCodes,
      backupMethods: ['totp', 'recovery']
    })

    return { success: true }
  }

  async disableMFA(code: string): Promise<{ success: boolean; error?: string }> {
    if (!currentSession) {
      return { success: false, error: 'Not authenticated' }
    }

    const user = this.findUserById(currentSession.userId)
    if (!user || !user.mfaEnabled || !user.totpSecret) {
      return { success: false, error: 'MFA is not enabled' }
    }

    // Verify the TOTP code
    const isValid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: code,
      window: 2
    })

    if (!isValid) {
      return { success: false, error: 'Invalid verification code' }
    }

    // Disable MFA
    this.updateUser(user.id, {
      mfaEnabled: false,
      totpSecret: undefined,
      recoveryCodes: undefined,
      backupMethods: []
    })

    return { success: true }
  }

  async generateRecoveryCodes(): Promise<string[]> {
    if (!currentSession) {
      throw new Error('Not authenticated')
    }

    const user = this.findUserById(currentSession.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const recoveryCodes = this.generateRecoveryCodes()
    this.updateUser(user.id, { recoveryCodes })

    return recoveryCodes
  }

  async sendSMSCode(): Promise<{ success: boolean; error?: string }> {
    if (!pendingMFAUser) {
      return { success: false, error: 'No pending MFA verification' }
    }

    // In a real app, you would send an SMS here
    // For demo purposes, we'll just simulate success
    console.log('SMS code sent to user:', pendingMFAUser.phoneNumber || 'No phone number')
    
    return { success: true }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (typeof window === 'undefined') {
      return null
    }

    const sessionData = localStorage.getItem('auth_session')
    if (!sessionData) {
      return null
    }

    try {
      const session = JSON.parse(sessionData)
      currentSession = session

      const user = this.findUserById(session.userId)
      if (!user) {
        localStorage.removeItem('auth_session')
        return null
      }

      return this.convertToAuthUser(user)
    } catch (error) {
      localStorage.removeItem('auth_session')
      return null
    }
  }

  logout(): void {
    currentSession = null
    pendingMFAUser = null
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_session')
    }
  }
}

export const authService = new AuthService()