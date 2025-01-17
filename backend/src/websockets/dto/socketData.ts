import { Socket } from 'socket.io';
export class WebSocketDto {
    public client_id: string;
    public socket: Socket;
    public user_id: string;

    constructor(client_id: string, socket: Socket, user_id: string) {
        this.client_id = client_id;
        this.socket = socket;
        this.user_id = user_id;
    }
}
