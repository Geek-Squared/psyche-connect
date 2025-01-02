import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as twilio from 'twilio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VideoService {
  private twilioClient: twilio.Twilio;
  private configService: ConfigService;

  constructor(private prisma: PrismaService) {
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }

  async createVideoSession(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true },
    });

    const roomName = `session-${appointmentId}`;
    const room = await this.twilioClient.video.v1.rooms.create({
      uniqueName: roomName,
      type: 'go', // Peer-to-peer room
    });

    return this.prisma.videoSession.create({
      data: {
        roomName,
        appointmentId,
        status: 'SCHEDULED',
      },
    });
  }

  async generateToken(sessionId: string, identity: string) {
    const session = await this.prisma.videoSession.findUnique({
      where: { id: sessionId },
    });

    const AccessToken = twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    const token = new AccessToken(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
      this.configService.get('TWILIO_API_KEY'),
      {
        ttl: 3600,
        identity,
        region: 'us1',
      },
    );

    token.identity = identity;

    const videoGrant = new VideoGrant({
      room: session.roomName,
    });

    token.addGrant(videoGrant);
    return token.toJwt();
  }

  async endSession(sessionId: string) {
    const session = await this.prisma.videoSession.findUnique({
      where: { id: sessionId },
    });

    await this.twilioClient.video.v1.rooms(session.roomName).update({
      status: 'completed',
    });

    return this.prisma.videoSession.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED' },
    });
  }
}
