import {
    Body,
    Controller,
    Get,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { LogsService } from './logs.service';
import { LocalAuthGuard } from 'src/auth/guard/local-auth.guard';

@Controller('logs')
export class LogsController {
    constructor(private readonly logsService: LogsService) {}

    @Get('progress')
    @UseGuards(LocalAuthGuard)
    async getProgressLogs(@Request() req) {
        return await this.logsService.getProgressLogs(req.user.user_id);
    }

    @Post('progress')
    async inputProgress(
        @Body('message') message,
        @Body('user_id') user_id,
        @Body('grade') grade: string,
    ) {
        return await this.logsService.inputProgressLogs(
            user_id,
            message,
            grade.toUpperCase(),
        );
    }

    @Get('general')
    @UseGuards(LocalAuthGuard)
    async getGeneralLogs(@Request() req) {
        return await this.logsService.getGeneralLogs(req.user.user_id);
    }

    @Post('general')
    async inputGeneralLogs(@Body('name') name, @Body('user_id') user_id) {
        return await this.logsService.generalLogs(user_id, name);
    }
}
