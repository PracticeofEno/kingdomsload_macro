import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMqController } from './rabbit-mq.controller';
import { RabbitMqService } from './rabbit-mq.service';
import { UsersModule } from 'src/users/users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // 환경 변수를 전역에서 사용 가능하게 설정
        }),
        RabbitMQModule.forRootAsync(RabbitMQModule, {
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('RABBITMQ_URI'),
                queues: [
                    {
                        name: configService.get<string>('RABBITMQ_QUEUE_NAME'),
                        routingKey: configService.get<string>(
                            'RABBITMQ_ROUTING_KEY',
                        ),
                    },
                ],
                connectionInitOptions: { wait: false },
            }),
            inject: [ConfigService],
        }),
        ScheduleModule.forRoot(),
        UsersModule,
    ],
    controllers: [RabbitMqController],
    providers: [RabbitMqService],
    exports: [RabbitMqService],
})
export class RabbitMqModule {}
