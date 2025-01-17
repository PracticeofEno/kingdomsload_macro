import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { RabbitMqModule } from './rabbit-mq/rabbit-mq.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { InstanceModule } from './instance/instance.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { LogsModule } from './logs/logs.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        RabbitMqModule,
        UsersModule,
        AuthModule,
        InstanceModule,
        WebsocketsModule,
        LogsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
