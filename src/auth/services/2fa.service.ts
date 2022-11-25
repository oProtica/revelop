import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { User } from 'src/users/models/user.entity';
import { UserService } from 'src/users/services/users.service';

@Injectable()
export class TwoFaService {
  constructor(private readonly userService: UserService) {}

  public async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();

    const otpauthUrl = authenticator.keyuri(
      user.email,
      process.env.TWOFA_APP_NAME,
      secret,
    );

    await this.userService.setTwoFaSecret(secret, user.id);

    return {
      secret,
      otpauthUrl,
    };
  }

  public verifyTwoFaCode(twoFaCode: string, user: User) {
    return authenticator.check(twoFaCode, user.twoFaSecret);
  }
}
