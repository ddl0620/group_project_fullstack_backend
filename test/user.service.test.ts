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
    /*it('should successfully create a user with hashed password', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      (UserModel.create as jest.Mock).mockResolvedValue(mockUserData);

      const input = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
        confirmPassword: '123456',
        dateOfBirth: new Date('1990-01-01'),
        role: Role.USER,
      };

      const result = await UserService.createUser(input);

      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(UserModel.create).toHaveBeenCalledWith({
        ...input,
        password: 'hashedpassword',
        avatar: '',
      });
      expect(result.user).toEqual(mockUserData);
    });*/

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
    /*it('should update user information and return updated user', async () => {
      const updates = { name: 'Updated Name' };
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUserData);
      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        ...mockUserData,
        ...updates,
      });

      const result = await UserService.updateBasicInformation(
        'user123',
        updates,
        null,
        ['password']
      );

      expect(UserModel.findById).toHaveBeenCalledWith('user123');
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        {
          $set: {
            ...updates,
            avatar: mockUserData.avatar,
          },
        },
        { new: true, runValidators: true }
      );
      expect(result.name).toBe('Updated Name');
    });*/

    it('should throw error if restricted fields are updated', async () => {
      const updates = { password: 'newpassword' };

      await expect(
        UserService.updateBasicInformation('user123', updates, null, ['password'])
      ).rejects.toThrow('Cannot update restricted fields');
    });
  });

  describe('updatePassword', () => {
    /*it('should update the user password', async () => {
      (UserModel.findById as jest.Mock).mockResolvedValue(mockUserData);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newhashedpassword');
      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        ...mockUserData,
        password: 'newhashedpassword',
      });

      const result = await UserService.updatePassword(
        'user123',
        '123456',
        'newpassword',
        'newpassword'
      );

      expect(bcrypt.compare).toHaveBeenCalledWith('123456', mockUserData.password);
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $set: { password: 'newhashedpassword' } },
        { new: true, runValidators: true }
      );
      expect(result.password).toBeUndefined();
    });*/

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

  describe('deleteUser', () => {
    /*it('should mark user as deleted', async () => {
      (UserModel.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUserData),
      });
      (UserModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        ...mockUserData,
        isDeleted: true,
      });

      const result = await UserService.deleteUser('user123');

      expect(UserModel.findOne).toHaveBeenCalledWith({
        _id: 'user123',
        isDeleted: false,
      });
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { isDeleted: true },
        { new: true, runValidators: true }
      );
      expect(result.isDeleted).toBe(true);
    });

    it('should throw error if user is not found', async () => {
      (UserModel.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(UserService.deleteUser('507f1f77bcf86cd799439011')).rejects.toThrow(
        'User not found'
      );
    });*/
  });
});