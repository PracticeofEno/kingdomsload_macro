import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { WSGateWay } from './websockets.gateway';
import { WebsocketsService } from './websockets.service';

@Module({
    imports: [AuthModule, forwardRef(() => UsersModule)],
    providers: [WebsocketsService, WSGateWay],
    controllers: [],
    exports: [WSGateWay],
})
export class WebsocketsModule {}
