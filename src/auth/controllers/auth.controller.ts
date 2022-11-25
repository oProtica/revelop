import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  SerializeOptions,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { DiscordGuard } from '../guards/discord.guard';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { LocalGuard } from '../guards/local.guard';
import RequestWithUser from '../requestWithUser.interface';
import { JwtGuard } from '../guards/jwt.guard';
import { RefreshJwtGuard } from '../guards/refreshJwt.guard';
import { UserService } from 'src/users/services/users.service';
import { TwoFaService } from '../services/2fa.service';

@Controller('auth')
@SerializeOptions({
  strategy: 'excludeAll',
})
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private twoFaService: TwoFaService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() user: CreateUserDto) {
    return this.authService.signup(user);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalGuard)
  signin(@Req() request: RequestWithUser) {
    const { user } = request;
    const accessToken = this.authService.createAccessJwt(user.id);
    const refreshToken = this.authService.createRefreshJWT(user.id);
    const accessCookie = `Authentication=${accessToken}; HttpOnly; Path=/; Max-Age=${process.env.JWT_EXPIRE}`;
    const refreshCookie = `Refresh=${refreshToken}; HttpOnly; Path=/; Max-Age=${process.env.REFRESH_EXPIRE}`;

    request.res.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    return user;
  }

  @UseGuards(RefreshJwtGuard)
  @Get('refresh')
  refresh(@Req() request: RequestWithUser) {
    const accessToken = this.authService.createAccessJwt(request.user.id);
    const accessCookie = `Authentication=${accessToken}; HttpOnly; Path=/; Max-Age=${process.env.JWT_EXPIRE}`;

    request.res.setHeader('Set-Cookie', accessCookie);
    return request.user;
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async signout(@Req() request: RequestWithUser) {
    await this.userService.removeRefreshToken(request.user.id);
    request.res.setHeader('Set-Cookie', [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ]);
    return 'Signed Out';
  }

  @Post('2fa/generate')
  @UseGuards(JwtGuard)
  async generateTwoFa(@Req() request: RequestWithUser) {
    const { otpauthUrl } =
      await this.twoFaService.generateTwoFactorAuthenticationSecret(
        request.user,
      );

    return otpauthUrl;
  }

  @Post('2fa/enable')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async enableTwoFa(@Req() request: RequestWithUser, @Body() { twoFaCode }) {
    console.log(twoFaCode);

    const valid = this.twoFaService.verifyTwoFaCode(twoFaCode, request.user);
    console.log(valid);
    if (!valid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.userService.enableTwoFa(request.user.id);
  }
}
