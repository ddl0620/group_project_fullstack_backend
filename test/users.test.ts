import { UserModel as User } from '../models/user.models'; // Corrected import path
import { faker } from '@faker-js/faker'; // Updated faker import
import bcrypt from 'bcrypt';

describe('User Model', () => {
    /*it('should create a user with valid data', async () => {
        const userData = {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            dateOfBirth: faker.date.past({ years: 20 }),
        };
    
        console.log('Creating user instance...');
        const user = new User(userData);
    
        console.log('Saving user to database...');
        const savedUser = await user.save();
        console.log('User saved:', savedUser);
    
        // Check if the user was saved correctly
        expect(savedUser._id).toBeDefined();
        expect(savedUser.name).toBe(userData.name);
        expect(savedUser.email).toBe(userData.email);
    
        // Verify that the password is hashed
        const isPasswordHashed = await bcrypt.compare(userData.password, savedUser.password);
        expect(isPasswordHashed).toBe(true);
    
        // Check if the date of birth matches
        expect(savedUser.dateOfBirth.toISOString()).toBe(userData.dateOfBirth.toISOString());
    }, 20000); // Increased timeout to 20 seconds*/

    it('should not create a user without required fields', async () => {
        const userData = {
            name: faker.person.fullName(), // Updated to use faker.person
            email: faker.internet.email(),
            password: faker.internet.password(),
            // dateOfBirth is missing
        };

        const user = new User(userData);

        // Check for a specific validation error
        await expect(user.save()).rejects.toThrowError(/Ngày sinh là bắt buộc/);
    });

    it('should not create a user with an invalid email', async () => {
        const userData = {
            name: faker.person.fullName(), // Updated to use faker.person
            email: 'invalid-email',
            password: faker.internet.password(),
            dateOfBirth: faker.date.past({ years: 20 }),
        };

        const user = new User(userData);

        // Check for a specific validation error
        await expect(user.save()).rejects.toThrowError(/Email không hợp lệ/);
    });

    it('should not create a user with a short password', async () => {
        const userData = {
            name: faker.person.fullName(), // Updated to use faker.person
            email: faker.internet.email(),
            password: '123', // Too short
            dateOfBirth: faker.date.past({ years: 20 }),
        };

        const user = new User(userData);

        // Check for a specific validation error
        await expect(user.save()).rejects.toThrowError(/Mật khẩu phải có ít nhất 6 ký tự/);
    });
});