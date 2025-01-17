import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: any) {
        console.log(`payload = `, payload);
        const data = await this.authService.validateUser(payload.user_id);
        // console.log(`data = `, data);
        if (data == null) {
            throw new UnauthorizedException("Can't find user");
        }
        const user = {
            user_id: data.user_id,
        };
        return user;
    }
}
