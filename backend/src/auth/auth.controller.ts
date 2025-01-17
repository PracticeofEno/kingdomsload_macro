import { Body, Controller, Delete, Post, Request, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(
        @Body('user_id') user_id: string,
        @Body('user_pw') user_pw: string,
    ) {
        console.log(user_id, user_pw);
        const jwt = await this.authService.signIn(user_id, user_pw);
        return jwt;
    }

    @Delete('logout')
    async logout(@Request() req, @Res() res: Response) {
        res.cookie('jwt', '', { expires: new Date(0) });
        res.send();
    }
}
