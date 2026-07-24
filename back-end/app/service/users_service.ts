import { prisma } from '../../lib/prisma.js'
import hash from '@adonisjs/core/services/hash'
import logger from '@adonisjs/core/services/logger'

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

    public async createUsersService(userData: Users){
        function generateIBAN(): string {
            // IBAN français réaliste : FR + 2 chiffres de contrôle + 23 chiffres = 27 caractères,
            // cohérent avec la longueur minimale (15) exigée par le formulaire d'ajout de bénéficiaire
            const randomDigits = (length: number) =>
                Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')
            return 'FR' + randomDigits(2) + randomDigits(23)
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
                        solde: 100,
                        label: 'Compte Principal',
                        iban: generateIBAN(),
                        rib: generateRIB(),
                        userId: user.id
                    }
                });

                const beneficiaire = await tx.beneficiaire.create({
                    data: {
                        nom: 'Jean Dupont',
                        iban: 'FR7630001007123456789012345',
                        userId: user.id
                    }
                });

                return {
                    user,
                    account,
                    beneficiaire
                };
            });

            logger.info({ userId: result.user.id, accountId: result.account.id }, 'Utilisateur et compte créés')

            return result;
        }

    
    
}