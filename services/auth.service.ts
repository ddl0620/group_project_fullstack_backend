import { UserInterface } from '../interfaces/user.interfaces';
import { SignInType, SignUpType } from '../types/auth.type';
import { UserService } from './user.service';

export class AuthService {
    static async validateCredentials(input: SignInType): Promise<UserInterface> {
        const { email, password } = input;
        return await UserService.validateCredentials(email, password);
    }

    static async createUser(data: SignUpType): Promise<UserInterface> {
        const { name, email, password, role } = data;
        return await UserService.createUser({ name, email, password, role });
    }
}