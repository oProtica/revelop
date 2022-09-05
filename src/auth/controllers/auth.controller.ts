import { Body, Controller, Post } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { User } from '../models/user.interface';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() user: User): Observable<User> {
    return this.authService.signup(user);
  }

  @Post('signin')
  signin(@Body() user: User): Observable<{ token: string }> {
    return this.authService
      .signin(user)
      .pipe(map((jwt: string) => ({ token: jwt })));
  }

  @Post('announce')
  announce(
    @Body('topic') topic: string,
    @Body('message') message: string,
  ): Observable<any> {
    return this.authService.announce(topic, message);
  }
}
