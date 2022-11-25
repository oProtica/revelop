import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../../users/dto/CreateUser.dto';
import { UserService } from '../../users/services/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  public createAccessJwt(userId: string) {
    const payload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: parseInt(process.env.JWT_EXPIRE),
    });
    return token;
  }

  public createRefreshJWT(userId: string) {
    const payload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_SECRET,
      expiresIn: parseInt(process.env.REFRESH_EXPIRE),
    });
    this.usersService.setRefreshToken(token, userId);
    return token;
  }

  private hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }

  private async verifyPassword(password: string, hashedPassword: string) {
    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }

  public getUserFromJwt(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
    if (payload.userId) {
      return this.usersService.getById(payload.userId);
    }
  }

  // Signup
  public async signup(userData: CreateUserDto) {
    const hashedPassword = await this.hashPassword(userData.password);

    try {
      const createdUser = await this.usersService.create({
        ...userData,
        password: hashedPassword,
      });
      createdUser.password = undefined;
      return createdUser;
    } catch (error) {
      if (error?.code === '23505') {
        throw new HttpException(
          'User with that email or username already exists',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        console.log(error);
        throw new HttpException(
          'Something went wrong',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async signin(email: string, password: string) {
    try {
      const user = await this.usersService.getByEmail(email);
      await this.verifyPassword(password, user.password);
      user.password = undefined;
      return user;
    } catch (error) {
      console.log(error);
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }
}
