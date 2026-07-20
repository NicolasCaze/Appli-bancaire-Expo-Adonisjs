// 1. Importer React, createContext, useState, useEffect
import { createContext, useContext, useEffect, useState } from "react";
import { Account, User, Payment, Transaction, Beneficiaire, BudgetCategorie } from "../types/auth";
import secureStorage from "@/services/secureStorage";
import authService from "@/services/authService";
import { router } from "expo-router";
import accountService from "@/services/accountService";
import paymentService from "@/services/paymentService";
import transactionService from "@/services/transactionService";
import beneficiaireService from "@/services/beneficiaireService";


// 4. Définir le type du Context
type AuthContextType = {
  user: User | null
  loading: boolean
  accounts: Account[]
  payments: Payment[]
  transactions: Transaction[]
  beneficiaires: Beneficiaire[]
  budgetStatut: BudgetCategorie[]
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  loadAccounts: () => Promise<void>
  loadPayments: () => Promise<void>
  loadTransactions: () => Promise<void>
  loadBeneficiaires: () => Promise<void>
  loadBudgetStatut: () => Promise<void>
}


const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [payments, setPayments] = useState<Payment[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([])
    const [budgetStatut, setBudgetStatut] = useState<BudgetCategorie[]>([])

    const loadUser = async () => {
        const user = await secureStorage.getUser()
        if(user){
            setUser(user)
            await loadAccounts()
            await loadPayments()
            await loadTransactions()
            await loadBeneficiaires()
            await loadBudgetStatut()
        }
        setLoading(false)
    }
    const loadAccounts = async () => {
        try {
            const accounts = await accountService.getMyAccounts()
            setAccounts(accounts)
        } catch (error) {
            console.error(error)
            setAccounts([])
        }
    }

    const loadPayments = async () => {
        try {
            const payments = await paymentService.getMyPayments()
            setPayments(payments)
        } catch (error) {
            console.error(error)
            setPayments([])
        }
    } 

        const loadTransactions = async () => {
        try {
            const transactions = await transactionService.getMyTransactions()
            setTransactions(transactions)
        } catch (error) {
            console.error(error)
            setTransactions([])
        }
    }

    const loadBeneficiaires = async () => {
        try {
            const beneficiaires = await beneficiaireService.getMyBeneficiaires()
            setBeneficiaires(beneficiaires)
        } catch (error) {
            console.error(error)
            setBeneficiaires([])
        }
    }

    const loadBudgetStatut = async () => {
        try {
            const data = await paymentService.getBudgetStatut()
            setBudgetStatut(data)
        } catch (error) {
            console.error(error)
            setBudgetStatut([])
        }
    }


    const login = async (email: string, password: string) => {
        try {
            const user = await authService.login(email, password)
            setUser(user)

            await Promise.all([
                loadAccounts(),
                loadPayments(),
                loadTransactions(),
                loadBeneficiaires(),
                loadBudgetStatut(),
            ])

            setLoading(false)
        } catch (error) {
            console.error(error)
            setLoading(false)
            throw error
        }
    }
    const logout = async () => {
        authService.logout()
        .then(() => {
            setUser(null)
            setAccounts([])
            setPayments([])
            setTransactions([])
            setBeneficiaires([])
            setBudgetStatut([])
            setLoading(false)
            router.replace('/(auth)/login')
        }).catch((error) => {
            console.error(error)
            setLoading(false)
        })
    }
        useEffect(() => {
    loadUser()
}, [])
    return (
        <AuthContext.Provider value={{ user, loading, accounts, payments, transactions, beneficiaires, budgetStatut, login, logout, loadUser, loadAccounts, loadPayments, loadTransactions, loadBeneficiaires, loadBudgetStatut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider')
  }
  
  return context
}
