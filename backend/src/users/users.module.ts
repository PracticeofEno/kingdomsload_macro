import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InstanceModule } from 'src/instance/instance.module';
import { WebsocketsModule } from 'src/websockets/websockets.module';

@Module({
    imports: [PrismaModule, InstanceModule, forwardRef(() => WebsocketsModule)],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule {}
