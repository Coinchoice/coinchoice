import {
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

// https://docs.nestjs.com/websockets/gateways
// https://www.joshmorony.com/creating-a-simple-live-chat-server-with-nestjs-websockets/
// https://github.com/nestjs/nest/blob/master/sample/02-gateways/client/index.html
@WebSocketGateway({
	cors: {
		origin: '*',
	},
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() public server: Server;

	private readonly logger = new Logger(AppGateway.name);

	@SubscribeMessage('newMessage')
	onNewMessage(@MessageBody() data: any) {
		console.log(data);
		this.server.emit('onMessage', { msg: 'new message', content: data });
	}

	@SubscribeMessage('identity')
	async identity(@MessageBody() data: number): Promise<any> {
		if (data == 0) {
			return 'zero';
		} else {
			return data;
		}
	}

	async handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`Client connected: ${client.id}`);
	}

	async handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}
}
