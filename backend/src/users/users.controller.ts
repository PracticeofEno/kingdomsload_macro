import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { LocalAuthGuard } from 'src/auth/guard/local-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('macro-time')
    async getMacroTime() {
        return await this.usersService.getMacroTime();
    }

    @Get('macro-data')
    @UseGuards(LocalAuthGuard)
    async getMacro(@Request() req) {
        return await this.usersService.getMacroData(req.user.user_id);
    }

    @Post('macro-data')
    @UseGuards(LocalAuthGuard)
    async setMacro(
        @Request() req,
        @Body('tax') tax,
        @Body('recruit') recruit,
        @Body('subscribe') subscribe,
        @Body('trial') trial,
        @Body('exploration') exploration,
    ) {
        return await this.usersService.setMacroData(req.user.user_id, {
            tax,
            recruit,
            subscribe,
            trial,
            exploration,
        });
    }

    @Get('macro-data/:user_id')
    async getMacroByUserId(@Param('user_id') user_id) {
        return await this.usersService.getMacroData(user_id);
    }

    @Get('')
    @UseGuards(LocalAuthGuard)
    async getUser(@Request() req, @Query('include') include) {
        return await this.usersService.getUserByUserId(
            req.user.user_id,
            include,
        );
    }

    @Post('')
    async createUser(@Body('user_id') user_id, @Body('user_pw') user_pw) {
        return await this.usersService.createUser(user_id, user_pw);
    }

    @Post('not-registered-yet')
    @UseGuards(LocalAuthGuard)
    async notRegisteredYet(
        @Request() req,
        @Body('login_id') login_id,
        @Body('login_pw') login_pw,
        @Body('kinds') kinds,
    ) {
        return await this.usersService.notRegisteredYet(
            req.user.user_id,
            login_id,
            login_pw,
            kinds,
        );
    }

    @Get('expired-user')
    async getExpiredUser() {
        return await this.usersService.getWantedExecuteUser();
    }

    @Post('mq')
    @UseGuards(LocalAuthGuard)
    async addMessageQueue(@Request() req) {
        return await this.usersService.setCurrentTime(req.user.user_id);
    }

    @Delete('mq')
    @UseGuards(LocalAuthGuard)
    async deleteMessageQueue(@Request() req) {
        return await this.usersService.deleteCurrentTime(req.user.user_id);
    }

    @Post('expired-user/:user_id')
    async getExpiredUser2(@Param('user_id') user_id) {
        return await this.usersService.getExpiredUser2(user_id);
    }

    @Post('callback/create-instance')
    async callbackCreateInstance(
        @Body('user_id') user_id,
        @Body('resource_ip') resource_ip,
        @Body('adb_port_number') adb_port_number,
    ) {
        await this.usersService.callbackCreateInstance(
            user_id,
            resource_ip,
            Number(adb_port_number),
        );
    }

    @Post('callback/execute-time')
    async callbackExecuteTime(
        @Body('user_id') user_id,
        @Body('hour') hour,
        @Body('minute') minute,
        @Body('second') second,
    ) {
        return await this.usersService.callbackExecuteTime(
            user_id,
            Number(hour),
            Number(minute),
            Number(second),
        );
    }

    @Get('test')
    async test() {
        return await this.usersService.test();
    }
}
