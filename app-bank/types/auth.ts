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

export interface Beneficiaire {
  id: number
  nom: string
  iban: string
  userId: number
}

export type Frequence = 'UNIQUE' | 'QUOTIDIEN' | 'HEBDOMADAIRE' | 'MENSUEL'

export interface VirementProgramme {
  id: number
  montant: number
  libelle: string
  frequence: Frequence
  statut: 'ACTIF' | 'SUSPENDU' | 'TERMINE'
  dateProchaineExecution: string
  dateFin: string | null
  compteSourceId: number
  beneficiaireId: number
  beneficiaire?: Beneficiaire
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
