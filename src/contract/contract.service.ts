import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContractDto } from './dto/contract.dto';

@Injectable()
export class ContractService {
  constructor(private readonly prisma: PrismaService) {}

  async create(contractDto: ContractDto) {
    const { patientId, terms, signedAt, documentUrl } = contractDto;

    return this.prisma.contract.create({
      data: {
        patientId,
        terms,
        signedAt: signedAt || new Date(),
        documentUrl,
      },
    });
  }

  async findAll() {
    return this.prisma.contract.findMany({
      include: { patient: true },
    });
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return contract;
  }

  async update(id: string, contractDto: ContractDto) {
    const { terms, signedAt, documentUrl } = contractDto;

    const existingContract = await this.prisma.contract.findUnique({
      where: { id },
    });
    if (!existingContract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return this.prisma.contract.update({
      where: { id },
      data: {
        terms,
        signedAt,
        documentUrl,
      },
    });
  }

  async remove(id: string) {
    const existingContract = await this.prisma.contract.findUnique({
      where: { id },
    });
    if (!existingContract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    await this.prisma.contract.delete({ where: { id } });

    return { message: `Contract with ID ${id} successfully deleted` };
  }
}
