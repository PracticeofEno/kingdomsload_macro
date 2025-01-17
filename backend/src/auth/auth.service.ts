import { HttpException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async signIn(id: string, pw: string): Promise<any> {
        const user = await this.userService.find(id, pw);
        console.log(user);
        if (!user) {
            throw new HttpException('Not Found', 404);
        }
        const payload = {
            user_id: user.user_id ?? '',
        };
        console.log(payload);
        const jwt = await this.jwtService.signAsync(payload);
        return jwt;
    }

    async validateUser(userId: string): Promise<any> {
        const user = await this.userService.findByUserId(userId);
        if (user) {
            return user;
        }
        return null;
    }

    validate(token: string) {
        return this.jwtService.verify(token);
    }

    decode(token: string) {
        return this.jwtService.decode(token);
    }
}
