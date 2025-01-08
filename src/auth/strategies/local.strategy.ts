import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'emailOrUsername',
      passwordField: 'password',
    });
  }

  async validate(emailOrUsername: string, password: string): Promise<any> {
    const user = emailOrUsername.includes('@')
      ? await this.authService.validateUserWithEmail(emailOrUsername, password)
      : await this.authService.validateUserWithUsername(emailOrUsername, password);

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}