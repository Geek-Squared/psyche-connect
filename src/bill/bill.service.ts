import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BillDto } from './dto/bill.dto';

@Injectable()
export class BillService {
  constructor(private readonly prisma: PrismaService) {}

  async create(billDto: BillDto) {
    const { patientId, amount, isPaid, dueDate, paymentMethod } = billDto;

    return this.prisma.bill.create({
      data: {
        patientId,
        amount,
        isPaid: isPaid || false,
        dueDate,
        paymentMethod,
      },
    });
  }

  async findAll() {
    return this.prisma.bill.findMany({
      include: { patient: true },
    });
  }

  async findOne(id: string) {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!bill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }

    return bill;
  }

  async update(id: string, billDto: BillDto) {
    const { amount, isPaid, dueDate, paymentMethod } = billDto;

    const existingBill = await this.prisma.bill.findUnique({ where: { id } });
    if (!existingBill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }

    return this.prisma.bill.update({
      where: { id },
      data: {
        amount,
        isPaid,
        dueDate,
        paymentMethod,
      },
    });
  }

  async remove(id: string) {
    const existingBill = await this.prisma.bill.findUnique({ where: { id } });
    if (!existingBill) {
      throw new NotFoundException(`Bill with ID ${id} not found`);
    }

    await this.prisma.bill.delete({ where: { id } });

    return { message: `Bill with ID ${id} successfully deleted` };
  }
}
