import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { BillService } from './bill.service';
import { BillDto } from './dto/bill.dto';

@Controller('bill')
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Post()
  async create(@Body() billDto: BillDto) {
    return this.billService.create(billDto);
  }

  @Get()
  async findAll() {
    return this.billService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.billService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() billDto: BillDto) {
    return this.billService.update(id, billDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.billService.remove(id);
  }
}
