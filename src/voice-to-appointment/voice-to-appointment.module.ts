import { Module } from '@nestjs/common';
import { AppointmentModule } from '../appointment/appointment.module';
import { CommunicationModule } from '../communication/communication.module';
import { PatientModule } from '../patient/patient.module';
import { VoiceAppointmentService } from './voice-to-appointment.service';
import { VoiceAppointmentController } from './voice-to-appointment.controller';

@Module({
  imports: [
    AppointmentModule, 
    CommunicationModule, 
    PatientModule
  ],
  providers: [VoiceAppointmentService],
  controllers: [VoiceAppointmentController]
})
export class VoiceAppointmentModule {}
