import { 
    Controller, 
    Post, 
    UploadedFile, 
    UseInterceptors, 
    Param 
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
import { VoiceAppointmentService } from './voice-to-appointment.service';
import { Express } from 'express';

  @Controller('voice-appointments')
  export class VoiceAppointmentController {
    constructor(
      private readonly voiceAppointmentService: VoiceAppointmentService
    ) {}
  
    @Post(':patientId')
    @UseInterceptors(FileInterceptor('audio'))
    async createVoiceAppointment(
      @UploadedFile() audioFile: Express.Multer.File,
      @Param('patientId') patientId: string
    ) {
      return this.voiceAppointmentService.transcribeAndProcessAppointment(
        audioFile, 
        patientId
      );
    }
  }
  