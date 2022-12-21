import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { CredentialDto } from './dto/credential.dto';
import { UserService } from './user.service';

@Controller('/api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('login')
  async login(@Body() credential: CredentialDto) {
    const user = await this.userService.getUserByKey(credential.key);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
