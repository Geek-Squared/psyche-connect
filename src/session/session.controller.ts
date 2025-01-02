// src/session/session.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionDto } from './dto/session.dto';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async create(@Body() sessionDto: SessionDto) {
    return this.sessionService.create(sessionDto);
  }

  @Get()
  async findAll() {
    return this.sessionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.sessionService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() sessionDto: SessionDto) {
    return this.sessionService.update(id, sessionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.sessionService.remove(id);
  }
}
