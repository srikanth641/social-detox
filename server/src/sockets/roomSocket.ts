import { Server, Socket } from 'socket.io';
import { RoomService } from '../services/roomService.js';

export function setupRoomSocket(io: Server): void {
  io.on('connection', (socket: Socket) => {
    // Join a focus room channel
    socket.on('join_room', async (data: { roomId: string; userId?: string; username?: string }) => {
      const { roomId, userId } = data;
      socket.join(roomId);

      try {
        const room = await RoomService.getRoomByIdOrCode(roomId);
        // Send fresh server-governed room state to the newly joined client
        socket.emit('room_state', room);
        // Broadcast user joined to other room participants
        socket.to(roomId).emit('participant_joined', { userId, timestamp: new Date() });
      } catch (err: any) {
        socket.emit('room_error', { code: 'SD-001', message: err.message });
      }
    });

    // Host triggers start / pause / resume / complete
    socket.on('room_action', async (data: { roomId: string; action: 'start' | 'pause' | 'resume' | 'complete'; userId: string }) => {
      const { roomId, action, userId } = data;
      try {
        const updatedRoom = await RoomService.updateRoomStatus(roomId, action, userId);
        // Broadcast new synchronized state to everyone in the room
        io.to(roomId).emit('room_updated', updatedRoom);
      } catch (err: any) {
        socket.emit('room_error', { code: err.code || 'SD-001', message: err.message });
      }
    });

    // Check-in action
    socket.on('submit_checkin', async (data: { roomId: string; userId: string; displayName?: string }) => {
      const { roomId, userId, displayName } = data;
      try {
        const result = await RoomService.checkIn(roomId, userId);
        io.to(roomId).emit('participant_checked_in', {
          userId,
          displayName: displayName || 'Study Peer',
          checkinCount: result.checkinCount,
          timestamp: new Date(),
        });
      } catch (err: any) {
        socket.emit('room_error', { code: err.code || '400', message: err.message });
      }
    });

    // Client requests resync
    socket.on('request_resync', async (data: { roomId: string }) => {
      try {
        const room = await RoomService.getRoomByIdOrCode(data.roomId);
        socket.emit('room_resync_response', room);
      } catch (err: any) {
        socket.emit('room_error', { code: 'SD-001', message: err.message });
      }
    });

    socket.on('leave_room', (data: { roomId: string; userId?: string }) => {
      socket.leave(data.roomId);
      socket.to(data.roomId).emit('participant_left', { userId: data.userId });
    });
  });
}
