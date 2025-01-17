import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
    WsException,
    // ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { WsGuard } from 'src/auth/guard/ws-gaurd';
import { UsersService } from 'src/users/users.service';
import { WebSocketDto } from './dto/socketData';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'dashboard',
})
export class WSGateWay implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly authService: AuthService,
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService,
    ) {}

    @WebSocketServer()
    server: Server;
    wsClients = new Map<string, WebSocketDto>();

    @UseGuards(WsGuard)
    async handleConnection(client: Socket) {
        try {
            const jwt = client.handshake.auth.token.split(' ')[1];
            const user_id = this.authService.decode(jwt)['user_id'];
            const user = await this.usersService.findByUserId(user_id);
            if (!user) throw new WsException('존재하지 않는 아이디입니다.');
            const tmp = new WebSocketDto(client.id, client, user.user_id);
            this.wsClients.set(user.user_id, tmp);
            console.log('Connected WS : ', user.user_id, client.id);
            console.log(this.wsClients.size);
        } catch (e) {
            console.log(e);
            console.log(`Disconnected WS : ${client.id}`);
        }
    }

    async handleDisconnect(client: Socket) {
        console.log(`Disconnected WS : ${client.id}`);
        this.wsClients.delete(client.id);
        console.log(Array.from(this.wsClients.values()).length);
    }

    broadCastHartEvent(eventName: string, data: any) {
        this.wsClients.forEach((client) => {
            client.socket.emit(eventName, data);
        });
    }

    sendEventByUserId(user_id: string, eventName: string, data: any) {
        this.wsClients.get(user_id)?.socket.emit(eventName, data);
    }
}
