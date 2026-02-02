import axios, { AxiosInstance } from 'axios'
import SecureStorage from './secureStorage'
import type { Transaction } from '../types/auth'



const API_URL = 'http://192.168.1.64:3333'

class TransactionService {
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
  


  async getMyTransactions(): Promise<Transaction[]> {
  try {
    const token = await SecureStorage.getAccessToken() 
    
    if (!token) {
      throw new Error('Non authentifié')
    }
    
    const response = await this.api.get('/transactions', {
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
export default new TransactionService()