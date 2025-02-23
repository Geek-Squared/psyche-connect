import { Injectable, Logger } from '@nestjs/common';
import { CommunicationDto, CommunicationType } from './dto/communication.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Twilio } from 'twilio';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CommunicationService {
  private twilioClient: Twilio;
  private readonly logger = new Logger(CommunicationService.name);
  private readonly temporarySlots: Map<string, any[]>;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.twilioClient = new Twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN'),
    );
    this.temporarySlots = new Map();
  }

  // Helper method for formatting dates in WhatsApp messages
  private formatDateForWhatsApp(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Helper method for formatting times in WhatsApp messages
  private formatTimeForWhatsApp(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  // This method sends a general message to a patient without affecting other flows.
  async sendGeneralMessage(patientId: string, message: string) {
    try {
      // Validate inputs
      if (!patientId || !message) {
        throw new Error('Patient ID and message are required.');
      }

      // Check if the patient exists
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found.`);
      }

      await this.sendMessage({
        patientId,
        message,
        type: CommunicationType.WHATSAPP,
        isCustom: true,
      });
    } catch (error) {
      this.logger.error(
        `Error sending general message to patient (ID: ${patientId}): ${error.message}`,
      );
      throw error;
    }
  }

  async sendMessage(dto: CommunicationDto) {
    try {
      const patient = await this.prisma.patient.findUnique({
        where: { id: dto.patientId },
        select: { cellPhone: true },
      });

      if (!patient?.cellPhone) {
        throw new Error('Patient phone number not found');
      }

      const message = await this.twilioClient.messages.create({
        from: `whatsapp:${this.configService.get('TWILIO_WHATSAPP_NUMBER')}`,
        to: `whatsapp:${patient.cellPhone}`,
        body: dto.message,
      });

      await this.prisma.communication.create({
        data: {
          patientId: dto.patientId,
          type: CommunicationType.WHATSAPP,
          message: dto.message,
          isCustom: dto.isCustom || false,
        },
      });

      return message.sid;
    } catch (error) {
      this.logger.error(`WhatsApp message failed: ${error.message}`);
      throw error;
    }
  }

  async handleIncomingMessage(from: string, body: string) {
    try {
      if (!from || typeof from !== 'string') {
        throw new Error('Invalid "from" field in incoming message');
      }

      const phoneNumber = from.replace('whatsapp:', '');
      const patient = await this.prisma.patient.findFirst({
        where: { cellPhone: phoneNumber },
      });

      if (!patient) {
        await this.sendMessage({
          patientId: null,
          message: "We couldn't find your record. Please contact support.",
          type: CommunicationType.WHATSAPP,
          isCustom: true,
        });
        return;
      }

      // Define mood-related keywords
      const moodKeywords = [
        'happy',
        'sad',
        'angry',
        'excited',
        'tired',
        'anxious',
        'suicidal',
        'suicide',
        'kill',
        'killing',
        'dead',
      ];
      const lowerCaseBody = body.toLowerCase();

      // Check if the message matches a mood keyword
      if (moodKeywords.some((keyword) => lowerCaseBody.includes(keyword))) {
        const mood =
          moodKeywords.find((keyword) => lowerCaseBody.includes(keyword)) ||
          'unknown';

        // Create MoodEntry
        await this.prisma.moodEntry.create({
          data: {
            patientId: patient.id,
            mood,
            journal: null,
          },
        });

        await this.sendMessage({
          patientId: patient.id,
          message: `Thanks for sharing your mood: "${mood}". Would you like to elaborate? Reply with your thoughts.`,
          type: CommunicationType.WHATSAPP,
          isCustom: true,
        });

        return;
      }

      // Check for the last MoodEntry to update the journal
      const lastMoodEntry = await this.prisma.moodEntry.findFirst({
        where: { patientId: patient.id },
        orderBy: { date: 'desc' },
      });

      if (lastMoodEntry && !lastMoodEntry.journal) {
        await this.prisma.moodEntry.update({
          where: { id: lastMoodEntry.id },
          data: { journal: body },
        });

        await this.sendMessage({
          patientId: patient.id,
          message:
            'Thanks for sharing more details. Your journal has been updated.',
          type: CommunicationType.WHATSAPP,
          isCustom: true,
        });

        return;
      }

      // For general messages: Log the message but avoid sending the default reply
      await this.prisma.communication.create({
        data: {
          patientId: patient.id,
          type: CommunicationType.WHATSAPP,
          message: body,
          isCustom: false,
        },
      });
    } catch (error) {
      this.logger.error(`Error handling incoming message: ${error.message}`);
      throw error;
    }
  }

  async sendMoodPrompt(patientId: string) {
    try {
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
        select: { cellPhone: true },
      });

      if (!patient?.cellPhone) {
        throw new Error('Patient phone number not found');
      }

      const message = await this.twilioClient.messages.create({
        from: `whatsapp:${this.configService.get('TWILIO_WHATSAPP_NUMBER')}`,
        to: `whatsapp:${patient.cellPhone}`,
        body: 'Hi! How are you feeling today?',
      });

      this.logger.log(`Mood prompt sent to ${patient.cellPhone}`);
      return message.sid;
    } catch (error) {
      this.logger.error(`Failed to send mood prompt: ${error.message}`);
      throw error;
    }
  }

  async handleIncomingWebhook(body: any) {
    const { From, Body: messageBody } = body;

    // Extract phone number
    const phoneNumber = From.replace('whatsapp:', '');

    // Find the patient in the database
    const patient = await this.prisma.patient.findFirst({
      where: { cellPhone: phoneNumber },
    });

    if (!patient) {
      throw new Error('Patient not found.');
    }

    // Log the incoming message
    const savedMessage = await this.prisma.communication.create({
      data: {
        patientId: patient.id,
        message: messageBody,
        type: CommunicationType.WHATSAPP,
        isCustom: false,
      },
    });

    return {
      success: true,
      message: 'Message received successfully.',
      data: savedMessage,
    };
  }

  async sendReply(replyDto: { patientId: string; message: string }) {
    const { patientId, message } = replyDto;

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new Error('Patient not found.');
    }

    // Send the reply message
    await this.sendMessage({
      patientId: patientId,
      message: message,
      type: CommunicationType.WHATSAPP,
      isCustom: true,
    });

    return {
      success: true,
      message: `Reply sent to ${patient.cellPhone}`,
    };
  }

  async sendReminderForUpcomingAppointments() {
    try {
      const now = new Date();
      const oneDayLater = new Date();
      oneDayLater.setDate(now.getDate() + 1);

      // Query upcoming appointments within the next 24 hours
      const upcomingAppointments = await this.prisma.appointment.findMany({
        where: {
          date: {
            gte: now,
            lte: oneDayLater,
          },
        },
        include: {
          patient: { select: { cellPhone: true, name: true } },
        },
      });

      if (upcomingAppointments.length === 0) {
        this.logger.log('No upcoming appointments for the next 24 hours.');
        return;
      }

      // Send reminders for each appointment
      for (const appointment of upcomingAppointments) {
        const { patient, date } = appointment;

        if (!patient?.cellPhone) {
          this.logger.warn(
            `Skipping reminder for appointment ${appointment.id}: No phone number found for patient.`,
          );
          continue;
        }

        const formattedDate = this.formatDateForWhatsApp(date);
        const formattedTime = this.formatTimeForWhatsApp(date);
        const message = `Hello ${patient.name}, this is a reminder for your upcoming appointment on ${formattedDate} at ${formattedTime}. Please let us know if you have any questions.`;

        await this.twilioClient.messages.create({
          from: `whatsapp:${this.configService.get('TWILIO_WHATSAPP_NUMBER')}`,
          to: `whatsapp:${patient.cellPhone}`,
          body: message,
        });

        this.logger.log(
          `Reminder sent to ${patient.cellPhone} for appointment on ${formattedDate}`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to send reminders: ${error.message}`);
      throw error;
    }
  }

  @Cron('0 8 * * *') // Runs daily at 8 AM
  async sendDailyReminders() {
    this.logger.log('Starting daily reminders for upcoming appointments...');
    await this.sendReminderForUpcomingAppointments();
  }

  async sendAvailableAppointments(patientId: string) {
    try {
      // Fetch patient details
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
        select: { cellPhone: true, name: true },
      });

      if (!patient || !patient.cellPhone) {
        throw new Error('Patient phone number not found');
      }

      // Fetch available appointments for the week
      const now = new Date();
      const oneWeekLater = new Date();
      oneWeekLater.setDate(now.getDate() + 7);

      const availableSlots = await this.prisma.appointment.findMany({
        where: {
          date: {
            gte: now,
            lte: oneWeekLater,
          },
          status: 'PENDING',
        },
        orderBy: { date: 'asc' },
      });

      if (availableSlots.length === 0) {
        await this.sendMessage({
          patientId,
          message: 'Sorry, there are no available appointments this week.',
          type: CommunicationType.WHATSAPP,
          isCustom: true,
        });
        return;
      }

      // Format the available slots into a message
      const options = availableSlots
        .map(
          (slot, index) =>
            `${index + 1}. ${this.formatDateForWhatsApp(slot.date)} at ${this.formatTimeForWhatsApp(slot.date)} (${slot.reason || 'General Consultation'})`,
        )
        .join('\n');

      const message = `Hello ${patient.name}, here are the available appointments for the week:\n\n${options}\n\nReply with the number corresponding to your preferred time slot to book your appointment.`;

      // Send the message
      await this.sendMessage({
        patientId,
        message,
        type: CommunicationType.WHATSAPP,
        isCustom: true,
      });

      this.logger.log(
        `Available appointment options sent to ${patient.cellPhone}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send available appointments: ${error.message}`,
      );
      throw error;
    }
  }

  // Add the new list picker method
  async sendAppointmentListPicker(
    patientId: string,
    appointmentSlots: Array<{ date: Date; id: string; reason?: string }>,
  ) {
    try {
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
        select: { id: true, cellPhone: true, name: true },
      });

      if (!patient?.cellPhone) {
        throw new Error('Patient phone number not found');
      }

      // Format appointment slots for the list picker
      const formattedSlots = appointmentSlots.map((slot) => ({
        id: slot.id,
        title:
          `${this.formatDateForWhatsApp(new Date(slot.date))} at ${this.formatTimeForWhatsApp(new Date(slot.date))}` + 
          (slot.reason ? ` (${slot.reason})` : ''),
      }));

      // Store appointment options in temporary storage for handling responses
      this.temporarySlots.set(patient.id, appointmentSlots);

      // Send the template with the list picker
      const message = await this.twilioClient.messages.create({
        from: `whatsapp:${this.configService.get('TWILIO_WHATSAPP_NUMBER')}`,
        to: `whatsapp:${patient.cellPhone}`,
        contentSid: 'HXbcf0b65e20c2ceaa347db6180fcf26fc',
        contentVariables: JSON.stringify({
          '1': `Hello ${patient.name}, please select from the available appointment times:`,
          list_items: formattedSlots,
        }),
      });

      await this.prisma.communication.create({
        data: {
          patientId,
          type: CommunicationType.WHATSAPP,
          message: `Sent appointment list picker with ${formattedSlots.length} options`,
          isCustom: true,
        },
      });

      return {
        success: true,
        messageSid: message.sid,
        appointmentCount: formattedSlots.length,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send appointment list picker: ${error.message}`,
      );
      throw error;
    }
  }

  // Method to handle list picker responses
  async handleListPickerResponse(from: string, selectedItemId: string) {
    try {
      const phoneNumber = from.replace('whatsapp:', '');
      const patient = await this.prisma.patient.findFirst({
        where: { cellPhone: phoneNumber },
      });

      if (!patient) {
        throw new Error('Patient not found');
      }

      // Get the stored appointment slots
      const appointmentSlots = this.temporarySlots.get(patient.id);
      if (!appointmentSlots) {
        await this.sendMessage({
          patientId: patient.id,
          message:
            'Your session has expired. Please request appointment options again.',
          type: CommunicationType.WHATSAPP,
          isCustom: true,
        });
        return;
      }

      // Find the selected appointment
      const selectedAppointment = appointmentSlots.find(
        (slot) => slot.id === selectedItemId,
      );
      if (!selectedAppointment) {
        await this.sendMessage({
          patientId: patient.id,
          message: 'Invalid selection. Please try again.',
          type: CommunicationType.WHATSAPP,
          isCustom: true,
        });
        return;
      }

      // Create the appointment in the database
      await this.prisma.appointment.create({
        data: {
          date: selectedAppointment.date,
          reason: selectedAppointment.reason || 'General Consultation',
          status: 'CONFIRMED',
          patientId: patient.id,
        },
      });

      // Format confirmation message
      const formattedDate = this.formatDateForWhatsApp(new Date(selectedAppointment.date));
      const formattedTime = this.formatTimeForWhatsApp(new Date(selectedAppointment.date));

      // Send confirmation
      await this.sendMessage({
        patientId: patient.id,
        message: `Your appointment has been confirmed for ${formattedDate} at ${formattedTime}. Thank you!`,
        type: CommunicationType.WHATSAPP,
        isCustom: true,
      });

      // Clear temporary slots after booking
      this.temporarySlots.delete(patient.id);

      return {
        success: true,
        appointment: {
          patientId: patient.id,
          date: selectedAppointment.date,
          reason: selectedAppointment.reason || 'General Consultation',
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to handle list picker response: ${error.message}`,
      );
      throw error;
    }
  }

  async sendCustomAvailableAppointments(
    patientIds: string | string[],
    slots: { date: string; time: string; reason?: string }[],
  ) {
    try {
      const ids = Array.isArray(patientIds) ? patientIds : [patientIds];

      // Fetch all patients at once
      const patients = await this.prisma.patient.findMany({
        where: { id: { in: ids } },
        select: { id: true, cellPhone: true, name: true },
      });

      if (!patients.length) {
        throw new Error('No valid patients found');
      }

      if (slots.length === 0) {
        throw new Error('No slots provided');
      }

      const invalidPatients = patients.filter((p) => !p.cellPhone);
      if (invalidPatients.length > 0) {
        this.logger.warn(
          `Some patients have no phone numbers: ${invalidPatients.map((p) => p.id).join(', ')}`,
        );
      }

      // Group slots by date
      const slotsByDate: Record<
        string,
        { date: string; time: string; reason?: string }[]
      > = slots.reduce((acc, slot) => {
        const date = slot.date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(slot);
        return acc;
      }, {});

      // Send messages to all valid patients
      const results = await Promise.all(
        patients
          .filter((patient) => patient.cellPhone)
          .map(async (patient) => {
            try {
              // Store slots for this patient
              this.temporarySlots.set(patient.id, slots);

              // Send initial message
              await this.sendMessage({
                patientId: patient.id,
                message: `Hello ${patient.name}, here are the available appointments for next week:`,
                type: CommunicationType.WHATSAPP,
                isCustom: true,
              });

              // Send slots grouped by date
              let slotNumber = 1;
              for (const [date, dateSlots] of Object.entries(slotsByDate)) {
                const options = dateSlots
                  .map(
                    (slot) =>
                      `${slotNumber++}. ${slot.time} (${slot.reason || 'General Consultation'})`,
                  )
                  .join('\n');

                await this.sendMessage({
                  patientId: patient.id,
                  message: `\n${date}:\n${options}`,
                  type: CommunicationType.WHATSAPP,
                  isCustom: true,
                });
              }

              // Send final instruction
              await this.sendMessage({
                patientId: patient.id,
                message:
                  'Reply with the number corresponding to your preferred time slot to book your appointment.',
                type: CommunicationType.WHATSAPP,
                isCustom: true,
              });

              return {
                patientId: patient.id,
                success: true,
                messagesSent: Object.keys(slotsByDate).length + 2, // Initial + dates + final
              };
            } catch (error) {
              this.logger.error(
                `Failed to send appointments to patient ${patient.id}: ${error.message}`,
              );
              return {
                patientId: patient.id,
                success: false,
                error: error.message,
              };
            }
          }),
      );

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      this.logger.log(
        `Custom appointment options sent to ${successCount} patients, failed for ${failureCount} patients`,
      );

      return {
        totalPatients: patients.length,
        successfulSends: successCount,
        failedSends: failureCount,
        details: results,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send custom available appointments: ${error.message}`,
      );
      throw error;
    }
  }

  async handleBookingResponse(from: string, body: string) {
    try {
      const phoneNumber = from.replace('whatsapp:', '');
      const patient = await this.prisma.patient.findFirst({
        where: { cellPhone: phoneNumber },
      });

      if (!patient) {
        throw new Error('Patient not found.');
      }

      const selectedOption = parseInt(body.trim(), 10);
      if (isNaN(selectedOption) || selectedOption < 1) {
        await this.sendMessage({
          patientId: patient.id,
          message: 'Invalid response. Please reply with a valid option number.',
          type: CommunicationType.WHATSAPP,
          isCustom: true,
        });
        return;
      }

      const availableSlots = this.temporarySlots.get(patient.id);
      if (!availableSlots || selectedOption > availableSlots.length) {
        await this.sendMessage({
          patientId: patient.id,
          message:
            'Invalid selection or your session has expired. Please request available appointments again.',
          type: CommunicationType.WHATSAPP,
          isCustom: true,
        });
        return;
      }

      const selectedSlot = availableSlots[selectedOption - 1];
      const [hours, minutes] = selectedSlot.time
        .replace(/\s*([AP]M)\s*$/i, ' $1')
        .match(/(\d+):(\d+)\s*([AP]M)/i)
        .slice(1, 3)
        .map(Number);

      const isPM = selectedSlot.time.toLowerCase().includes('pm');
      let hour = hours;
      if (isPM && hour !== 12) hour += 12;
      else if (!isPM && hour === 12) hour = 0;

      const appointmentDate = new Date(selectedSlot.date);
      appointmentDate.setHours(hour, minutes, 0, 0);

      // Check for existing appointments within 1 hour before and after
      const oneHourBefore = new Date(appointmentDate);
      oneHourBefore.setHours(oneHourBefore.getHours() - 1);
      const oneHourAfter = new Date(appointmentDate);
      oneHourAfter.setHours(oneHourAfter.getHours() + 1);

      const existingAppointment = await this.prisma.appointment.findFirst({
        where: {
          date: {
            gte: oneHourBefore,
            lte: oneHourAfter,
          },
          status: 'CONFIRMED',
        },
      });

      if (existingAppointment) {
        await this.sendMessage({
          patientId: patient.id,
          message:
            'Sorry, this time slot is no longer available. Please select a different time.',
          type: CommunicationType.WHATSAPP,
          isCustom: true,
        });
        return;
      }

      // Create the appointment
      await this.prisma.appointment.create({
        data: {
          date: appointmentDate,
          reason: selectedSlot.reason || 'General Consultation',
          status: 'CONFIRMED',
          patientId: patient.id,
        },
      });

      const formattedDate = this.formatDateForWhatsApp(appointmentDate);
      const formattedTime = this.formatTimeForWhatsApp(appointmentDate);

      const confirmationMessage = `Your appointment has been booked for ${formattedDate} at ${formattedTime} (${selectedSlot.reason || 'General Consultation'}). Thank you!`;

      await this.sendMessage({
        patientId: patient.id,
        message: confirmationMessage,
        type: CommunicationType.WHATSAPP,
        isCustom: true,
      });

      // Clear temporary slots after successful booking
      this.temporarySlots.delete(patient.id);

      this.logger.log(
        `Appointment booked for patient ${patient.name} at ${formattedDate} ${formattedTime}`,
      );
    } catch (error) {
      this.logger.error(`Failed to handle booking response: ${error.message}`);
      throw error;
    }
  }

  // Method to send Twilio WhatsApp template
  async sendTwilioTemplate(
    patientId: string,
    templateName: string,
    parameters: Record<string, string> = {},
  ) {
    try {
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
        select: { cellPhone: true },
      });

      if (!patient?.cellPhone) {
        throw new Error('Patient phone number not found');
      }

      // Send template message using Twilio Content API
      const message = await this.twilioClient.messages.create({
        from: `whatsapp:${this.configService.get('TWILIO_WHATSAPP_NUMBER')}`,
        to: `whatsapp:${patient.cellPhone}`,
        body: null, // Must be null when using template
        contentSid: templateName,
        contentVariables: JSON.stringify(parameters),
      });

      await this.prisma.communication.create({
        data: {
          patientId,
          type: CommunicationType.WHATSAPP,
          message: `Template: ${templateName}`,
          isCustom: true,
        },
      });

      return message.sid;
    } catch (error) {
      this.logger.error(`Failed to send Twilio template: ${error.message}`);
      throw error;
    }
  }
}