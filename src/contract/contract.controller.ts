import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractDto } from './dto/contract.dto';

@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post()
  async create(@Body() contractDto: ContractDto) {
    return this.contractService.create(contractDto);
  }

  @Get()
  async findAll() {
    return this.contractService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contractService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() contractDto: ContractDto) {
    return this.contractService.update(id, contractDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.contractService.remove(id);
  }
}
