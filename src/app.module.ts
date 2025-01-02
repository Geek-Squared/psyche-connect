import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientModule } from './patient/patient.module';
import { SessionModule } from './session/session.module';
import { BillModule } from './bill/bill.module';
import { ContractModule } from './contract/contract.module';
import { CommunicationModule } from './communication/communication.module';
import { MoodModule } from './mood/mood.module';
import { EventModule } from './event/event.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TwilioModule } from './twilio/twilio.module';
import { AppointmentService } from './appointment/appointment.service';
import { AppointmentController } from './appointment/appointment.controller';
import { AppointmentModule } from './appointment/appointment.module';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PatientModule,
    SessionModule,
    BillModule,
    ContractModule,
    CommunicationModule,
    MoodModule,
    EventModule,
    PrismaModule,
    TwilioModule,
    AppointmentModule,
    VideoModule,
  ],
  controllers: [AppController, AppointmentController],
  providers: [AppService, AppointmentService],
})
export class AppModule {}
