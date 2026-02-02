// 1. Imports (axios, SecureStorage, types)
import axios, { AxiosInstance } from 'axios'
import SecureStorage from './secureStorage'
import type { Account } from '../types/auth'


// 3. Classe AccountService
const API_URL = 'http://192.168.1.64:3333'

class AccountService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    })

  }
  
  // Méthode getMyAccounts()

  async getMyAccounts(): Promise<Account[]> {
  try {
    const token = await SecureStorage.getAccessToken() 
    
    if (!token) {
      throw new Error('Non authentifié')
    }
    
    const response = await this.api.get('/accounts', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.data 
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Session expirée, veuillez vous reconnecter')
    }
    throw new Error('Erreur lors de la récupération des comptes')
  }
}
}
// 4. Exporter une instance (singleton)
export default new AccountService()