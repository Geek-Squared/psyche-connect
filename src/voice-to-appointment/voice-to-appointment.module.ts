import { Module } from '@nestjs/common';
import { AppointmentModule } from '../appointment/appointment.module';
import { CommunicationModule } from '../communication/communication.module';
import { PatientModule } from '../patient/patient.module';
import { VoiceAppointmentController } from './voice-to-appointment.controller';
import { VoiceToAppointmentService } from './voice-to-appointment.service';

@Module({
  imports: [
    AppointmentModule, 
    CommunicationModule, 
    PatientModule
  ],
  providers: [VoiceToAppointmentService],
  controllers: [VoiceAppointmentController]
})
export class VoiceAppointmentModule {}
