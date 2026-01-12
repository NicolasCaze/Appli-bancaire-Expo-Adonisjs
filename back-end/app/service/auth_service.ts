// Imports nécessaires
import env from '#start/env'
import { prisma } from '../../lib/prisma.js'
import hash from '@adonisjs/core/services/hash'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import logger from '@adonisjs/core/services/logger'

// Types
type TokenPair = {
  accessToken: string
  refreshToken: string
}

type LoginResponse = {
  user: {
    id: number
    email: string
    firstname: string
    lastname: string
  }
  tokens: TokenPair
}

export class AuthService {
  
  // Méthode privée : générer un access token (JWT)
  private generateAccessToken(userId: number, email: string): string {
    // 1. Créer le payload avec userId et email
  const payload = {
    userId,
    email
   }
  
  // 2. Récupérer le secret depuis l'environnement
  const secret = env.get('JWT_SECRET')
  
  // 3. Signer le JWT avec une expiration de 15 minutes
  const token = jwt.sign(payload, secret, { expiresIn: '15m' })
  
  // 4. Retourner le token
  return token
  }

  // Méthode privée : générer un refresh token (random)
  private generateRefreshToken(): string {
    // TODO : Utiliser crypto.randomBytes()
    const refreshToken = crypto.randomBytes(64).toString('hex')
    return refreshToken
  }
  private async limitActiveTokens(userId: number, maxTokens: number = 5): Promise<void> {
  // 1. Compter les tokens actifs
  const activeTokensCount = await prisma.refreshToken.count({
    where: {
      userId,
      revokedAt: null,
      expireAt: {
        gte: new Date()
      }
    }
  })

  // 2. Calculer combien on doit en révoquer
  const tokensToRevoke = activeTokensCount >= maxTokens ? (activeTokensCount - maxTokens + 1) : 0

  // 3. Si on doit en révoquer
  if (tokensToRevoke > 0) {
    // Trouver les plus anciens
    const oldestTokens = await prisma.refreshToken.findMany({
      where: {
        userId: userId,
         revokedAt: null,
        expireAt: {
          gte: new Date()
        }
      },
      orderBy: { createdAt: 'asc' },
      take: tokensToRevoke
    })

    // Révoquer ces tokens
    await prisma.refreshToken.updateMany({
      where: {
        id: { in: oldestTokens.map(t => t.id) }
      },
      data: {
        revokedAt: new Date()
      }
    })
  }
}
  // Méthode publique : login
  public async login(
    email: string, 
    password: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<LoginResponse> {
    // TODO :
    // 1. Trouver l'user par email
    const user = await prisma.user.findUnique({
    where: { email }
});

if (!user) {
  logger.warn('Tentative de connexion avec email invalide', {
    email: email,
    ipAdress: ipAddress,
    deviceInfo: deviceInfo 
  })
    throw new Error('Identifiants invalides')
}
    // 2. Vérifier le mot de passe
    const isPasswordValid = await hash.verify(user.password, password)

if (!isPasswordValid) {
  logger.warn('Tentative de connexion avec mot de passe invalide', {
    email: email,
    ipAdress: ipAddress,
    deviceInfo: deviceInfo
  })
    throw new Error('Identifiants invalides')
}

    // 3. Limiter le nombre de tokens actifs (max 5)
await this.limitActiveTokens(user.id, 5)
    // 4. Générer les nouveaux tokens
    const accessToken = this.generateAccessToken(user.id, user.email)
    const refreshToken = this.generateRefreshToken()
    // 5. Stocker le refresh token en DB
    const expireAt = new Date()
    expireAt.setDate(expireAt.getDate() + 7)
    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expireAt: expireAt,
            deviceInfo: deviceInfo,
            ipAddress: ipAddress
        }
    })
    // 6. Retourner user + tokens
    return {
    user: {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname
    },
    tokens: {
      accessToken,
      refreshToken
    }
  }
  }

  // Méthode publique : refresh
  public async refresh(
    refreshToken: string,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<{ accessToken: string, refreshToken: string }> {
    // TODO :
    // 1. Trouver le refresh token en DB
    const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
    })
    if (!tokenRecord) {
        throw new Error('Refresh token invalide')
    }
    // 2. Vérifier qu'il n'est pas révoqué
if (tokenRecord.revokedAt !== null) {
  logger.warn('ALERTE SÉCURITÉ : Tentative de réutilisation de token révoqué', {
    userId: tokenRecord.userId,
    tokenPreview: refreshToken.substring(0, 10) + '...',
    ipAdresse: ipAddress,
    deviceInfo: deviceInfo,
    revokedAt: tokenRecord.revokedAt
  })
  // TODO : Révoquer TOUS les tokens actifs de cet utilisateur
  await prisma.refreshToken.updateMany({
    where: {
      userId: tokenRecord.userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date()
    }
  })
  
  throw new Error('Tentative suspecte détectée. Toutes vos sessions ont été révoquées par sécurité.')
}
    // 3. Vérifier qu'il n'est pas expiré
    if (tokenRecord.expireAt < new Date()) {
        throw new Error('Refresh token expiré')
    }
    // 4. Mettre à jour lastUsedAt
    await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { lastUsedAt: new Date(),
          revokedAt: new Date()
         }
    })
    //Générer un refresh token
    const newrefreshToken = this.generateRefreshToken()
    // 5. Générer un nouvel access token
    const accessToken = this.generateAccessToken(
        tokenRecord.user.id,
        tokenRecord.user.email
    )
    const expireAt = new Date()
    expireAt.setDate(expireAt.getDate() + 7)
    // Limiter le nombre de tokens actifs
    await this.limitActiveTokens(tokenRecord.user.id, 5)
    await prisma.refreshToken.create({
        data: {
            token: newrefreshToken,
            userId: tokenRecord.user.id,
            expireAt: expireAt,
            deviceInfo: deviceInfo || tokenRecord.deviceInfo,
            ipAddress: ipAddress || tokenRecord.ipAddress
        }
    })
    // 6. Retourner le nouvel access token
    return { accessToken, refreshToken: newrefreshToken }
  }

  // Méthode publique : logout
  public async logout(refreshToken: string): Promise<void> {
    // TODO :
    // 1. Trouver le refresh token en DB
    const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken }
    })
    if (!tokenRecord) {
        return
    }
    // 2. Mettre à jour revokedAt
    await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() }
    })
  }
}