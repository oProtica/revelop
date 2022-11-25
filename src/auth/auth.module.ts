import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './guards/jwt.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DiscordStrategy } from './guards/discord.strategy';
import { UserService } from 'src/users/services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/models/user.entity';
import { LocalStrategy } from './strategies/local.strategy';
import { LocalGuard } from './guards/local.guard';
import { RefreshJwtGuard } from './guards/refreshJwt.guard';
import { RefreshJwtStrategy } from './strategies/refreshJwt.strategy';
import { TwoFaService } from './services/2fa.service';
console.log(process.env.JWT_EXPIRE);
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: 360 /*parseInt(process.env.JWT_EXPIRE)*/ },
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    AuthService,
    UserService,
    TwoFaService,
    JwtGuard,
    JwtStrategy,
    RefreshJwtGuard,
    RefreshJwtStrategy,
    LocalGuard,
    LocalStrategy,
    DiscordStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
