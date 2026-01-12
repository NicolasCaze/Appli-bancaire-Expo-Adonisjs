import { prisma } from '../../lib/prisma.js'
import hash from '@adonisjs/core/services/hash'

type Users = {
    firstname : string,
    lastname: string,
    email: string,
    dateNaissance: Date,
    lieuNaissance: string,
    adresse: string,
    password: string
}

export class UsersService {
    
    // Fonction pour récupérer tous les utilisateurs
    public async getAllUsersService() {
        const users = await prisma.user.findMany()
        const accounts = await prisma.account.findMany()
        return { users, accounts };
    }

    public async createUsersService(userData: Users){
        function generateIBAN(): string {

            return 'FR' + Math.random().toString().slice(2, 12);
        }

        function generateRIB(): string {

            return Math.random().toString().slice(2, 12);
        }    
        
        const { firstname, lastname, email, dateNaissance, lieuNaissance, adresse, password } = userData;
            
            const result = await prisma.$transaction(async (tx) => {
                  const hashedPassword = await hash.make(password)
                const user = await tx.user.create({
                    data: {
                        firstname,
                        lastname,
                        email,
                        dateNaissance: new Date(dateNaissance),
                        lieuNaissance,
                        adresse,
                        password: hashedPassword
                    }
                });

                const account = await tx.account.create({
                    data: {
                        type: 'BANCAIRE',
                        solde: 0,
                        label: 'Compte Principal',
                        iban: generateIBAN(),
                        rib: generateRIB(),
                        userId: user.id
                    }
                });

                return {
                    user,
                    account
                };
            });

            console.log('Created user:', result.user);
            console.log('Created account:', result.account);

            return result;
        }

 
    
}