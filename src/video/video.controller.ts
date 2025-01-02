import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { VideoService } from './video.service';

@Controller('video-sessions')
export class VideoController {
  constructor(private videoService: VideoService) {}

  @Post()
  async createSession(@Body() data: { appointmentId: string }) {
    return this.videoService.createVideoSession(data.appointmentId);
  }

  @Post(':id/token')
  async getToken(
    @Param('id') sessionId: string,
    @Body() data: { identity: string },
  ) {
    return {
      token: await this.videoService.generateToken(sessionId, data.identity),
    };
  }

  @Post(':id/end')
  async endSession(@Param('id') sessionId: string) {
    return this.videoService.endSession(sessionId);
  }
}
