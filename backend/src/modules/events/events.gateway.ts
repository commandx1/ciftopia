import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'app',
  cors: { origin: '*' },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(AppGateway.name);

  handleConnection(client: any) {
    const coupleId = client.handshake?.auth?.coupleId;
    const userId = client.handshake?.auth?.userId;
    if (coupleId) {
      client.join(`couple:${coupleId}`);
      this.logger.log(`App socket: client ${client.id} joined couple:${coupleId}`);
    }
    if (userId) {
      client.join(`user:${userId}`);
    }
  }

  handleDisconnect(client: any) {
    this.logger.log(`App socket disconnected: ${client.id}`);
  }

  emitToCouple(coupleId: string, event: string, payload: unknown) {
    this.server?.to(`couple:${coupleId}`).emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    this.server?.to(`user:${userId}`).emit(event, payload);
  }
}
