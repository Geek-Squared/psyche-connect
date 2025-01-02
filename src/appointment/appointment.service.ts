import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentStatusDto,
} from './dto/appointment.dto';

@Injectable()
export class AppointmentService {
  logger: any;
  constructor(private readonly prisma: PrismaService) {}

  // Create an appointment
  async createAppointment(createAppointmentDto: CreateAppointmentDto) {
    const { patientId, date, reason } = createAppointmentDto;

    return await this.prisma.appointment.create({
      data: {
        patientId,
        date: new Date(date),
        reason,
        status: 'PENDING', // Default status
      },
    });
  }

  async getAllAppointments() {
    const appointments = this.prisma.appointment.findMany({});
    return appointments;
  }

  // Get all appointments for a specific date
  async getAppointmentsByDate(date: string) {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: { patient: true },
    });
  }

  // Update appointment status
  async updateAppointmentStatus(
    id: string,
    updateDto: UpdateAppointmentStatusDto,
  ) {
    const { status } = updateDto;

    return await this.prisma.appointment.update({
      where: { id },
      data: { status },
    });
  }

  // Send reminder
  async sendReminder(appointmentId: string, message: string) {
    return await this.prisma.notification.create({
      data: {
        appointmentId,
        type: 'EMAIL',
        message,
        sentAt: new Date(),
      },
    });
  }

  async deleteAllAppointments() {
    try {
      await this.prisma.appointment.deleteMany({});
      return { message: 'All appointments deleted successfully' };
    } catch (error) {
      this.logger.error('Failed to delete appointments:', error);
      throw error;
    }
  }
}
