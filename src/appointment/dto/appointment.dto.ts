// CreateAppointmentDto
export class CreateAppointmentDto {
    patientId: string;
    date: string;
    reason?: string;
  }
  
  // UpdateAppointmentStatusDto
  export class UpdateAppointmentStatusDto {
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'AVAILABLE';
  }
  