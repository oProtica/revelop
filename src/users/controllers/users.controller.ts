import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  SerializeOptions,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import RequestWithUser from 'src/auth/requestWithUser.interface';
import { UserService } from '../services/users.service';

@Controller('users')
@SerializeOptions({
  strategy: 'excludeAll',
})
export class UserController {
  constructor(private userService: UserService) {}

  @Get('@me')
  @UseGuards(JwtGuard)
  me(@Req() request: RequestWithUser) {
    const user = request.user;
    user.password = undefined;
    return user;
  }
}
