import { UserService } from '../services/user.service';
import { UserModel } from '../models/user.models';
import { USER_ROLE as Role } from '../enums/role.enum';
import bcrypt from 'bcrypt';

// Mock the UserModel and bcrypt
jest.mock('../models/user.models');
jest.mock('bcrypt');

const mockUserData = {
  _id: 'user123',
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashedpassword',
  role: Role.USER,
  avatar: '',
  isDeleted: false,
};

describe('UserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should throw error if email already exists', async () => {
      (UserModel.findOne as jest.Mock).mockResolvedValue(mockUserData);

      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
        confirmPassword: '123456',
        dateOfBirth: new Date('1990-01-01'),
        role: Role.USER,
      };

      await expect(UserService.createUser(input)).rejects.toThrow('Email already exists');
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user by ID', async () => {
      (UserModel.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUserData),
      });

      const result = await UserService.getCurrentUser('user123');

      expect(UserModel.findOne).toHaveBeenCalledWith({
        _id: 'user123',
        isDeleted: false,
      });
      expect(result).toEqual(mockUserData);
    });

    it('should throw error if user is not found', async () => {
      (UserModel.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(UserService.getCurrentUser('507f1f77bcf86cd799439011')).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return a paginated list of users', async () => {
      const mockUsers = [mockUserData];
      (UserModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockUsers),
      });
      (UserModel.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await UserService.getAllUsers(1, 10, 'desc');

      expect(UserModel.find).toHaveBeenCalled();
      expect(UserModel.countDocuments).toHaveBeenCalled();
      expect(result.users).toEqual(mockUsers);
      expect(result.pagination.totalUsers).toBe(1);
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      (UserModel.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUserData),
      });

      const result = await UserService.getUserById('user123');

      expect(UserModel.findOne).toHaveBeenCalledWith({
        _id: 'user123',
        isDeleted: false,
      });
      expect(result).toEqual(mockUserData);
    });
  });

  describe('updateBasicInformation', () => {
    it('should throw error if restricted fields are updated', async () => {
      const updates = { password: 'newpassword' };

      await expect(
        UserService.updateBasicInformation('user123', updates, null, ['password'])
      ).rejects.toThrow('Cannot update restricted fields');
    });
  });

  describe('updatePassword', () => {
    it('should throw error if current password is incorrect', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUserData);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        UserService.updatePassword('user123', {
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword',
          confirmPassword: 'newpassword'
        })
      ).rejects.toThrow('Current password is incorrect');
    });
  });
});