import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/createUser.dto';
import { User } from '../models/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getById(id: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }
  async getByEmail(email: string) {
    const user = await this.usersRepository.findOneBy({ email });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.getById(userId);

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (isRefreshTokenMatching) {
      return user;
    }
  }

  async setRefreshToken(unhashedRefreshToken: string, userId: string) {
    const refreshToken = await bcrypt.hash(unhashedRefreshToken, 10);
    await this.usersRepository.update(userId, {
      refreshToken,
    });
  }

  async removeRefreshToken(userId: string) {
    return this.usersRepository.update(userId, {
      refreshToken: null,
    });
  }

  async create(userData: CreateUserDto) {
    const newUser = await this.usersRepository.save(userData);

    return newUser;
  }

  async setTwoFaSecret(secret: string, userId: string) {
    return this.usersRepository.update(userId, {
      twoFaSecret: secret,
    });
  }

  async enableTwoFa(userId: string) {
    return this.usersRepository.update(userId, {
      twoFaEnabled: true,
    });
  }
}
