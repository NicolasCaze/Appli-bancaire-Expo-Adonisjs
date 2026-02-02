// 1. Importer React, createContext, useState, useEffect
import { createContext, useContext, useEffect, useState } from "react";
import { Account, User, Payment, Transaction } from "../types/auth";
import secureStorage from "@/services/secureStorage";
import authService from "@/services/authService";
import { router } from "expo-router";
import accountService from "@/services/accountService";
import paymentService from "@/services/paymentService";
import transactionService from "@/services/transactionService";


// 4. Définir le type du Context
type AuthContextType = {
  user: User | null
  loading: boolean
  accounts: Account[]
  payments: Payment[]
  transactions: Transaction[]
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  loadAccounts: () => Promise<void>
  loadPayments: () => Promise<void>
  loadTransactions: () => Promise<void>
}


const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [payments, setPayments] = useState<Payment[]>([])
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])

    const loadUser = async () => {
        const user = await secureStorage.getUser()
        if(user){
            setUser(user)
            await loadAccounts()
            await loadPayments()
            await loadTransactions()
            
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


    const login = async (email: string, password: string) => {
        authService.login(email, password)
        .then(async (user) => {
            setUser(user)
            await loadAccounts()
            await loadPayments()
            await loadTransactions()
            setLoading(false)
        }).catch((error) => {
            console.error(error)
            setLoading(false)
        })
    }
    const logout = async () => {
        authService.logout()
        .then(() => {
            setUser(null)
            setAccounts([])
            setPayments([])
            setTransactions([])
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
        <AuthContext.Provider value={{ user, loading, accounts, payments, transactions, login, logout, loadUser, loadAccounts, loadPayments, loadTransactions }}>
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
