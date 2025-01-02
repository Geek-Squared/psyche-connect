// src/session/session.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionDto } from './dto/session.dto';

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(sessionDto: SessionDto) {
    const { patientId, date, notes, assessmentFiles } = sessionDto;

    return this.prisma.session.create({
      data: {
        patientId,
        date: date || new Date(),
        notes,
        assessmentFiles: assessmentFiles || [],
      },
    });
  }

  async findAll() {
    return this.prisma.session.findMany({
      include: { patient: true },
    });
  }

  async findOne(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return session;
  }

  async update(id: string, sessionDto: SessionDto) {
    const { date, notes, assessmentFiles } = sessionDto;

    const existingSession = await this.prisma.session.findUnique({
      where: { id },
    });
    if (!existingSession) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return this.prisma.session.update({
      where: { id },
      data: {
        date,
        notes,
        assessmentFiles,
      },
    });
  }

  async remove(id: string) {
    const existingSession = await this.prisma.session.findUnique({
      where: { id },
    });
    if (!existingSession) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    await this.prisma.session.delete({ where: { id } });

    return { message: `Session with ID ${id} successfully deleted` };
  }
}
