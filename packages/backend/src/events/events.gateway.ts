import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'socket.io';

// https://docs.nestjs.com/websockets/gateways
// https://www.joshmorony.com/creating-a-simple-live-chat-server-with-nestjs-websockets/
// https://github.com/nestjs/nest/blob/master/sample/02-gateways/client/index.html
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    return from([1, 2, 3, 4, 5, 6]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<any> {
    if (data == 0) {
      return 'zero';
    } else {
      return data;
    }
  }

  async handleConnection() {
    this.server.emit('events', 'hello');
  }

  async handleDisconnect() {
    this.server.emit('events', 'bye');
  }
}
