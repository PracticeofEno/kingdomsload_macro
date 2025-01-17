import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';
import { WebsocketsModule } from 'src/websockets/websockets.module';

@Module({
    imports: [PrismaModule, UsersModule, WebsocketsModule],
    controllers: [LogsController],
    providers: [LogsService],
    exports: [LogsService],
})
export class LogsModule {}
