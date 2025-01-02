import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AppointmentReminderService {
  constructor(private readonly prisma: PrismaService) {}

  // Send reminders every hour
  @Cron('0 * * * *') // Runs every hour
  async sendReminders() {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        date: {
          gte: now,
          lte: oneHourLater,
        },
      },
      include: { patient: true },
    });

    for (const appointment of upcomingAppointments) {
      // Logic for sending reminders (email, SMS, etc.)
      console.log(`Reminder sent for appointment: ${appointment.id}`);
      await this.prisma.notification.create({
        data: {
          appointmentId: appointment.id,
          type: 'EMAIL',
          message: `Reminder: You have an appointment at ${appointment.date}`,
          sentAt: new Date(),
        },
      });
    }
  }
}
