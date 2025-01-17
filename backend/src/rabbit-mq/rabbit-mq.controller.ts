import {
    Body,
    Controller,
    Get,
    Post,
    UseGuards,
    Request,
} from '@nestjs/common';
import { RabbitMqService } from './rabbit-mq.service';
import { LocalAuthGuard } from 'src/auth/guard/local-auth.guard';

@Controller('rabbit-mq')
export class RabbitMqController {
    constructor(private readonly rabbitMqService: RabbitMqService) {}

    @Post('create-instance')
    @UseGuards(LocalAuthGuard)
    async createInstance(
        @Request() req,
        // @Body('user_id') user_id: string,
        @Body('resource_ip') resource_ip: string,
    ) {
        // console.log(`user_id = `, user_id);
        // await this.rabbitMqService.addCreateInstanceInMQ(user_id, resource_ip);
        console.log(`user_id = `, req.user.user_id);
        await this.rabbitMqService.addCreateInstanceInMQ(
            req.user.user_id,
            resource_ip,
        );
    }

    @Post('start-instance')
    async startInstance(
        // @Request() req,
        @Body('user_id') user_id: string,
        @Body('resource_ip') resource_ip: string,
    ) {
        await this.rabbitMqService.addStartInstanceInMq(user_id, resource_ip);
    }

    @Get('test')
    async connect() {
        await this.rabbitMqService.connect();
    }

    @Get('test2')
    async test2() {
        await this.rabbitMqService.test();
    }
}
