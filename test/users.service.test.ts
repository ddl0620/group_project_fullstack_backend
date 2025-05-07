import { UserService } from '../services/user.service';
import { UserModel } from '../models/user.models';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { USER_ROLE } from '../enums/role.enum';

describe('UserService', () => {
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        await UserModel.deleteMany({});
    });

    it('should create a user successfully', async () => {
        const userData = {
            name: 'Test One',
            email: 'one@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            dateOfBirth: new Date('2000-01-01'),
            role: USER_ROLE.USER,
        };

        const result = await UserService.createUser(userData);
        const user = result.user as any;
        expect(user).toBeDefined();
        expect(user.email).toBe(userData.email);
    });

    it('should retrieve the created user by ID', async () => {
        const userData = {
            name: 'Test Two',
            email: 'two@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            dateOfBirth: new Date('1999-01-01'),
            role: USER_ROLE.USER,
        };

        const { user } = await UserService.createUser(userData) as any;
        const found = await UserService.getUserById(user._id);
        expect(found?.email).toBe(user.email);
    });

    it('should update a user name using UserModel directly', async () => {
        const userData = {
            name: 'Test Three',
            email: 'three@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            dateOfBirth: new Date('1998-01-01'),
            role: USER_ROLE.USER,
        };

        const { user } = await UserService.createUser(userData) as any;
        const updated = await UserModel.findByIdAndUpdate(
            user._id,
            { name: 'Updated Name' },
            { new: true }
        );
        expect(updated?.name).toBe('Updated Name');
    });

    it('should delete a user using UserModel directly', async () => {
        const userData = {
            name: 'Test Four',
            email: 'four@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            dateOfBirth: new Date('1997-01-01'),
            role: USER_ROLE.USER,
        };

        const { user } = await UserService.createUser(userData) as any;
        await UserModel.findByIdAndDelete(user._id);
        const found = await UserModel.findById(user._id);
        expect(found).toBeNull();
    });

    it('should not create a user with an existing email', async () => {
        const userData = {
            name: 'Test Five',
            email: 'five@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            dateOfBirth: new Date('1996-01-01'),
            role: USER_ROLE.USER,
        };

        await UserService.createUser(userData);
        await expect(UserService.createUser(userData)).rejects.toThrowError(
            'Failed to create user'
        );
    });

    it('should not create a user with a short password', async () => {
        const userData = {
            name: 'Test Six',
            email: 'six@example.com',
            password: '123',
            confirmPassword: '123',
            dateOfBirth: new Date('1995-01-01'),
            role: USER_ROLE.USER,
        };

        await expect(UserService.createUser(userData)).rejects.toThrowError(
            'Failed to create user'
        );
    });
});