import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MoodEntryDto } from './dto/mood.dto';

@Injectable()
export class MoodService {
  constructor(private readonly prisma: PrismaService) {}

  async create(moodEntryDto: MoodEntryDto) {
    const { patientId, date, mood, journal } = moodEntryDto;

    return this.prisma.moodEntry.create({
      data: {
        patientId,
        date: date || new Date(),
        mood,
        journal,
      },
    });
  }

  async findAll() {
    return this.prisma.moodEntry.findMany({
      include: { patient: true },
    });
  }

  async findOne(id: string) {
    const moodEntry = await this.prisma.moodEntry.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!moodEntry) {
      throw new NotFoundException(`MoodEntry with ID ${id} not found`);
    }

    return moodEntry;
  }

  async update(id: string, moodEntryDto: MoodEntryDto) {
    const { date, mood, journal } = moodEntryDto;

    const existingMoodEntry = await this.prisma.moodEntry.findUnique({
      where: { id },
    });
    if (!existingMoodEntry) {
      throw new NotFoundException(`MoodEntry with ID ${id} not found`);
    }

    return this.prisma.moodEntry.update({
      where: { id },
      data: {
        date,
        mood,
        journal,
      },
    });
  }

  async remove(id: string) {
    const existingMoodEntry = await this.prisma.moodEntry.findUnique({
      where: { id },
    });
    if (!existingMoodEntry) {
      throw new NotFoundException(`MoodEntry with ID ${id} not found`);
    }

    await this.prisma.moodEntry.delete({ where: { id } });

    return { message: `MoodEntry with ID ${id} successfully deleted` };
  }
}
