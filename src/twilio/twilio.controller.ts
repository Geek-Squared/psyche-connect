// src/twilio/twilio.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { TwilioService } from './twilio.service';

@Controller('communication')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  @Post('send')
  async sendSms(
    @Body() body: { patientId: string; to: string; message: string },
  ) {
    const from = process.env.TWILIO_PHONE_NUMBER;
    if (!from) {
      throw new Error('TWILIO_PHONE_NUMBER is not set in environment variables');
    }
  
    return await this.twilioService.sendWhatsApp(
      body.to,
      from,
      body.message,
      body.patientId,
    );
  }  
}
