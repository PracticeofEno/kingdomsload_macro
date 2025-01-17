import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { UsersService } from 'src/users/users.service';

enum RabbitMqMessage {
    CreateInstance = 'create_instance',
    Startinstance = 'start_instance',
    TEST = 'test',
}

const queueName = 'bluestack_task';

@Injectable()
export class RabbitMqService {
    constructor(
        private readonly amqpConnection: AmqpConnection,
        private readonly usersService: UsersService,
    ) {}

    @Interval(60000)
    async handleInterval() {
        const users = await this.usersService.getWantedExecuteUser();
        for (const user of users) {
            const message = {
                kinds: RabbitMqMessage.Startinstance,
                user_id: user.user_id,
                resource_ip: user.instance.resource_ip,
                adb_port_number: user.instance.adb_port_number,
            };
            console.log('handleInterval', message);
            await this.PublishMessage(queueName, message);
            await this.usersService.updateExecuteNull(user.id);
        }
    }

    async PublishMessage(queueName: string, message: any) {
        await this.amqpConnection.channel.assertQueue(queueName);
        await this.amqpConnection.channel.sendToQueue(
            queueName,
            Buffer.from(JSON.stringify(message)),
        );
        // await this.amqpConnection.publish(exchange, routingKey, message);
    }

    /**
     * user가 요청한 인스턴스 생성 요청을 MQ에 추가
     * @param user_id
     * @returns
     */
    async addCreateInstanceInMQ(
        user_id: string,
        resource_ip: string = '127.0.0.1',
    ) {
        const user = await this.usersService.findByUserId(user_id);
        if (!user) {
            // 유저가 없는 상황. 에러처리 및 로그 필요
            return;
        }
        const message = {
            kinds: RabbitMqMessage.CreateInstance,
            user_id: user_id,
            resource_ip: resource_ip,
        };
        console.log(message);
        await this.PublishMessage(queueName, message);
    }

    async addStartInstanceInMq(user_id: string, resource_ip: string) {
        const user = await this.usersService.findByUserId(user_id);
        if (!user) {
            // 유저가 없는 상황. 에러처리 및 로그 필요
            return;
        }
        const instance = await this.usersService.getInstanceByUserId(user.id);
        const message = {
            kinds: RabbitMqMessage.Startinstance,
            user_id: user_id,
            resource_ip: resource_ip,
            adb_port_number: instance.adb_port_number,
        };
        await this.PublishMessage(queueName, message);
    }

    async connect() {
        const message = {
            kinds: 'connect',
            resource_ip: '1.1.1.1',
            adb_port_number: '5625',
            user_id: 'egg1',
        };
        console.log(message);
        await this.PublishMessage(queueName, message);
    }

    async test() {
        const message = {
            kinds: 'test',
            resource_ip: '1.1.1.1',
            adb_port_number: '5625',
            user_id: 'egg1',
        };
        console.log(message);
        await this.PublishMessage(queueName, message);
    }
}
