import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { PatientService } from './patient.service';
  import { PatientDto } from './dto/patient.dto';
  
  @Controller('patient')
  export class PatientController {
    constructor(private readonly patientService: PatientService) {}
  
    @Post()
    async create(@Body() patientDto: PatientDto) {
      try {
        return await this.patientService.create(patientDto);
      } catch (error) {
        throw new HttpException(
          'Error creating patient: ' + error.message,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    @Get()
    async findAll() {
      try {
        return await this.patientService.findAll();
      } catch (error) {
        throw new HttpException(
          'Error retrieving patients: ' + error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string) {
      try {
        return await this.patientService.findOne(id);
      } catch (error) {
        throw new HttpException(
          'Patient not found: ' + error.message,
          HttpStatus.NOT_FOUND,
        );
      }
    }
  
    @Put(':id')
    async update(@Param('id') id: string, @Body() patientDto: PatientDto) {
      try {
        return await this.patientService.update(id, patientDto);
      } catch (error) {
        throw new HttpException(
          'Error updating patient: ' + error.message,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    @Delete(':id')
    async remove(@Param('id') id: string) {
      try {
        return await this.patientService.remove(id);
      } catch (error) {
        throw new HttpException(
          'Error deleting patient: ' + error.message,
          HttpStatus.NOT_FOUND,
        );
      }
    }
  }
  