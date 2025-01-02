import { Controller, Post, Body, Logger, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommunicationService } from './communication.service';
import { CommunicationDto } from './dto/communication.dto';

@ApiTags('communication')
@Controller('communication')
export class CommunicationController {
  private readonly logger = new Logger(CommunicationController.name);

  constructor(private readonly communicationService: CommunicationService) {}

  @Post('whatsapp')
  @ApiOperation({ summary: 'Send WhatsApp message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async sendWhatsAppMessage(@Body() dto: CommunicationDto) {
    return this.communicationService.sendMessage(dto);
  }

  @Post('incoming')
  async handleTwilioWebhook(@Body() body: any) {
    this.logger.log(`Webhook received: ${JSON.stringify(body)}`);

    if (!body?.From || !body?.Body) {
      this.logger.error(`Invalid request payload: ${JSON.stringify(body)}`);
      return { status: 'error', message: 'Invalid payload' };
    }

    const from = body.From;
    const messageBody = body.Body;

    this.logger.log(`Incoming message from ${from}: ${messageBody}`);

    try {
      await this.communicationService.handleBookingResponse(from, messageBody);
      return { status: 'success' };
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  @Post('send-prompt')
  async sendMoodPrompt(@Body() data: { patientId: string }) {
    return await this.communicationService.sendMoodPrompt(data.patientId);
  }

  @Post('send-general')
  async sendGeneralMessage(
    @Body() body: { patientId: string; message: string },
  ) {
    const { patientId, message } = body;

    if (!patientId || !message) {
      return {
        status: 'error',
        message: 'Patient ID and message are required.',
      };
    }

    try {
      await this.communicationService.sendGeneralMessage(patientId, message);
      return { status: 'success', message: 'Message sent successfully.' };
    } catch (error) {
      this.logger.error(`Failed to send general message: ${error.message}`);
      return {
        status: 'error',
        message: `Failed to send message: ${error.message}`,
      };
    }
  }

  @Post('reply')
  async sendReply(@Body() replyDto: { patientId: string; message: string }) {
    return this.communicationService.sendReply(replyDto);
  }

  // Add this endpoint for sending reminders
  @Post('send-reminders')
  @ApiOperation({ summary: 'Send reminders for upcoming appointments' })
  @ApiResponse({ status: 200, description: 'Reminders sent successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendReminders() {
    try {
      await this.communicationService.sendReminderForUpcomingAppointments();
      return {
        status: 'success',
        message: 'Reminders sent successfully.',
      };
    } catch (error) {
      this.logger.error(`Failed to send reminders: ${error.message}`);
      return {
        status: 'error',
        message: `Failed to send reminders: ${error.message}`,
      };
    }
  }

  // New endpoint: Send available appointment slots
  @Post('send-available-appointments')
  @ApiOperation({ summary: 'Send available appointment slots to a patient' })
  @ApiResponse({
    status: 200,
    description: 'Appointment slots sent successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid patient ID' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendAvailableAppointments(@Body() data: { patientId: string }) {
    try {
      await this.communicationService.sendAvailableAppointments(data.patientId);
      return {
        status: 'success',
        message: 'Available appointment slots sent successfully.',
      };
    } catch (error) {
      this.logger.error(
        `Failed to send available appointments: ${error.message}`,
      );
      return {
        status: 'error',
        message: `Failed to send available appointments: ${error.message}`,
      };
    }
  }

  @Post('send-custom-available-appointments')
  @ApiOperation({ summary: 'Send custom available appointments to a patient' })
  @ApiResponse({
    status: 200,
    description: 'Custom appointment slots sent successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendCustomAvailableAppointments(
    @Body()
    data: {
      patientId: string;
      slots: { date: string; time: string; reason?: string }[];
    },
  ) {
    try {
      const { patientId, slots } = data;

      if (!patientId || !slots || slots.length === 0) {
        return {
          status: 'error',
          message: 'Patient ID and slots are required.',
        };
      }

      await this.communicationService.sendCustomAvailableAppointments(
        patientId,
        slots,
      );

      return {
        status: 'success',
        message: 'Custom appointment slots sent successfully.',
      };
    } catch (error) {
      this.logger.error(
        `Failed to send custom available appointments: ${error.message}`,
      );
      return {
        status: 'error',
        message: `Failed to send custom available appointments: ${error.message}`,
      };
    }
  }
}
