import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentStatusDto,
} from './dto/appointment.dto';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  // Create a new appointment
  @Post()
  async createAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.createAppointment(createAppointmentDto);
  }

  // Get appointments for a specific date
  @Get()
  async getAllAppointments() {
    return this.appointmentService.getAllAppointments();
  }

  @Get('by-date')
  async getAppointmentsByDate(@Query('date') date: string) {
    return this.appointmentService.getAppointmentsByDate(date);
  }

  // Update appointment status
  @Put(':id/status')
  async updateAppointmentStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentService.updateAppointmentStatus(id, updateDto);
  }

  // Send reminder for an appointment
  @Post(':id/reminder')
  async sendReminder(
    @Param('id') id: string,
    @Body('message') message: string,
  ) {
    return this.appointmentService.sendReminder(id, message);
  }

  @Delete()
  async deleteAppointments() {
    return this.appointmentService.deleteAllAppointments();
  }
}
