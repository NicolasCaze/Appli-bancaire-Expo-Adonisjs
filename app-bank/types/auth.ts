/**
 * Types TypeScript pour l'authentification
 */

export interface User {
  id: number
  email: string
  firstname: string
  lastname: string
}

export interface Account {
  id: number
  type: string
  solde: number
  label: string
  iban: string
  userId: number
}

export interface Payment {
  id: number
  montant: number
  datePaiement: string
  description: string
  categorie: string | null
  moyenPaiement: string
  statut: string
  accountId: number
}

export interface Transaction {
  id: number
  montant: number
  dateTransaction: string
  type: string
  libelle: string
  statut: string
  compteSourceId: number | null
  compteDestinationId: number | null
  beneficiaireId: number | null
}

export interface LoginResponse {
  user: User
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}

export interface LogoutResponse {
  message: string
}
