import { Injectable, NotFoundException } from '@nestjs/common';
import { PatientDto } from './dto/patient.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(patientDto: PatientDto) {
    const {
      name,
      email,
      homePhone,
      cellPhone,
      address,
      occupation,
      maritalStatus,
      referringDoctor,
      dateOfBirth,
      age,
      gender,
      nextOfKin,
      medicalHistory,
      reasonForService,
      isProBono,
    } = patientDto;

    const nextOfKinData = nextOfKin
      ? {
          create: {
            name: nextOfKin.name,
            homePhone: nextOfKin.homePhone,
            cellPhone: nextOfKin.cellPhone,
            address: nextOfKin.address,
            email: nextOfKin.email,
            relationship: nextOfKin.relationship,
          },
        }
      : undefined;

    return this.prisma.patient.create({
      data: {
        name,
        email,
        homePhone,
        cellPhone,
        address,
        occupation,
        maritalStatus,
        referringDoctor,
        dateOfBirth,
        age,
        gender,
        medicalHistory,
        reasonForService,
        isProBono: isProBono || false,
        nextOfKin: nextOfKinData,
      },
      include: {
        nextOfKin: true,
      },
    });
  }

  async findAll() {
    return this.prisma.patient.findMany({
      include: {
        nextOfKin: true,
      },
    });
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        nextOfKin: true,
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async update(id: string, patientDto: PatientDto) {
    const {
      name,
      email,
      homePhone,
      cellPhone,
      address,
      occupation,
      maritalStatus,
      referringDoctor,
      dateOfBirth,
      age,
      gender,
      nextOfKin,
      medicalHistory,
      reasonForService,
      isProBono,
    } = patientDto;

    const existingPatient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!existingPatient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    const nextOfKinData = nextOfKin
      ? {
          upsert: {
            create: {
              name: nextOfKin.name,
              homePhone: nextOfKin.homePhone,
              cellPhone: nextOfKin.cellPhone,
              address: nextOfKin.address,
              email: nextOfKin.email,
              relationship: nextOfKin.relationship,
            },
            update: {
              name: nextOfKin.name,
              homePhone: nextOfKin.homePhone,
              cellPhone: nextOfKin.cellPhone,
              address: nextOfKin.address,
              email: nextOfKin.email,
              relationship: nextOfKin.relationship,
            },
          },
        }
      : undefined;

    return this.prisma.patient.update({
      where: { id },
      data: {
        name,
        email,
        homePhone,
        cellPhone,
        address,
        occupation,
        maritalStatus,
        referringDoctor,
        dateOfBirth,
        age,
        gender,
        medicalHistory,
        reasonForService,
        isProBono,
        nextOfKin: nextOfKinData,
      },
      include: {
        nextOfKin: true,
      },
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    const existingPatient = await this.prisma.patient.findUnique({
      where: { id },
    });

    if (!existingPatient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    await this.prisma.patient.delete({ where: { id } });

    return { message: `Patient with ID ${id} successfully deleted` };
  }
}
