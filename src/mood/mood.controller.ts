import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { MoodEntryDto } from './dto/mood.dto';
import { MoodService } from './mood.service';

@Controller('mood-entry')
export class MoodController {
  constructor(private readonly moodEntryService: MoodService) {}

  @Post()
  async create(@Body() moodEntryDto: MoodEntryDto) {
    return this.moodEntryService.create(moodEntryDto);
  }

  @Get()
  async findAll() {
    return this.moodEntryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.moodEntryService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() moodEntryDto: MoodEntryDto) {
    return this.moodEntryService.update(id, moodEntryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.moodEntryService.remove(id);
  }
}
