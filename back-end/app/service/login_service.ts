import { prisma } from '../../lib/prisma.js'
import hash from '@adonisjs/core/services/hash'


export class LoginService {
    public async loginService(email: string, password: string) {
        const user = await prisma.user.findUnique({where: {email}})
        if (!user) {
            throw new Error('User not found');
        }
        const isPasswordValid = await hash.verify(user.password, password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }
        // 3. Generate JWT token
        // 4. Return user data and token

        return { email, password };
    }
}