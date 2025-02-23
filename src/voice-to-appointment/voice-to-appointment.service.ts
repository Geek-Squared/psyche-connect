import { Injectable, BadRequestException } from '@nestjs/common';
import { Express } from 'express';
import OpenAI from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class VoiceToAppointmentService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async transcribeAndProcessAppointment(
    audioFile: Express.Multer.File,
    patientId: string,
  ) {
    try {
      // 1. Verify patient exists
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (!patient) {
        throw new BadRequestException('Patient not found');
      }

      // 2. Transcribe audio to text
      const transcription = await this.transcribeAudio(audioFile);

      // 3. Extract appointment details using AI
      const appointmentDetails =
        await this.extractAppointmentDetails(transcription);

      // 4. Validate appointment data
      const isValid = await this.validateAppointmentData(appointmentDetails);

      if (!isValid) {
        throw new BadRequestException('Invalid appointment details');
      }

      // 5. Create appointment in database
      const appointment = await this.createAppointment(
        patientId,
        appointmentDetails,
      );

      // 6. Optionally create a notification
      await this.createNotification(appointment.id);

      return {
        success: true,
        transcription,
        appointmentDetails: appointment,
      };
    } catch (error) {
      console.error('Error processing voice appointment:', error);
      throw error;
    }
  }

  private async transcribeAudio(
    audioFile: Express.Multer.File,
  ): Promise<string> {
    const transcription = await this.openai.audio.transcriptions.create({
      //@ts-ignore
      file: audioFile.buffer,
      model: 'whisper-1',
    });

    return transcription.text;
  }

  private async extractAppointmentDetails(transcription: string): Promise<any> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Extract appointment details from the transcription. 
          Provide a structured response with the following fields:
          - date (in ISO date format)
          - reason (string describing the appointment reason)
          - additionalNotes (optional additional context)`,
        },
        {
          role: 'user',
          content: transcription,
        },
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0].message.content);
  }

  async validateAppointmentData(appointmentData: any): Promise<boolean> {
    // Implement comprehensive validation
    return !!(
      appointmentData.date &&
      new Date(appointmentData.date).toString() !== 'Invalid Date' &&
      appointmentData.reason
    );
  }

  private async createAppointment(patientId: string, details: any) {
    return this.prisma.appointment.create({
      data: {
        patientId,
        date: new Date(details.date),
        reason: details.reason || details.additionalNotes,
        status: AppointmentStatus.PENDING,
      },
    });
  }

  private async createNotification(appointmentId: string) {
    return this.prisma.notification.create({
      data: {
        appointmentId,
        type: 'SMS', // You can make this configurable
        message: 'A new appointment has been scheduled.',
      },
    });
  }
}
