import { Injectable } from '@angular/core';

export interface Medico {
  id: number;
  nombre: string;
  especialidad: string;
}

export interface Cita {
  id: number;
  paciente_dni: string;
  paciente_nombre: string;
  paciente_correo: string;
  medico_id: number;
  medico_nombre: string;
  especialidad: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: 'Pendiente' | 'Atendido';
  diagnostico?: string;
  fecha_atencion?: string;
}

export interface UsuarioActual {
  nombre: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private STORAGE_KEY = 'clinica_citas_data';
  private USER_KEY = 'clinica_usuario_actual';

  // Lista base de médicos y especialidades
  public medicos: Medico[] = [
    { id: 1, nombre: 'Dr. Roberto Mendoza', especialidad: 'Medicina General' },
    { id: 2, nombre: 'Dra. Patricia Silva', especialidad: 'Medicina General' },
    { id: 3, nombre: 'Dra. Carmen Delgado', especialidad: 'Pediatría' },
    { id: 4, nombre: 'Dr. Jorge Ramírez', especialidad: 'Pediatría' },
    { id: 5, nombre: 'Dr. Fernando Salazar', especialidad: 'Cardiología' },
    { id: 6, nombre: 'Dra. Lucía Paredes', especialidad: 'Cardiología' },
    { id: 7, nombre: 'Dra. María Elena Castro', especialidad: 'Ginecología' },
    { id: 8, nombre: 'Dr. Andrés Guzmán', especialidad: 'Ginecología' }
  ];

  public especialidades = ['Medicina General', 'Pediatría', 'Cardiología', 'Ginecología'];

  constructor() {
    this.inicializarDatos();
  }

  private inicializarDatos(): void {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      const hoy = new Date().toISOString().split('T')[0];
      const citasIniciales: Cita[] = [
        {
          id: 1,
          paciente_dni: '71234567',
          paciente_nombre: 'Ana María Lozano',
          paciente_correo: 'ana.lozano@email.com',
          medico_id: 1,
          medico_nombre: 'Dr. Roberto Mendoza',
          especialidad: 'Medicina General',
          fecha: hoy,
          hora: '08:30 AM',
          motivo: 'Evaluación de exámenes y dolor de cabeza',
          estado: 'Pendiente'
        },
        {
          id: 2,
          paciente_dni: '71234567',
          paciente_nombre: 'Ana María Lozano',
          paciente_correo: 'ana.lozano@email.com',
          medico_id: 1,
          medico_nombre: 'Dr. Roberto Mendoza',
          especialidad: 'Medicina General',
          fecha: hoy,
          hora: '09:15 AM',
          motivo: 'Control de presión arterial',
          estado: 'Atendido',
          diagnostico: 'Presión arterial estable (120/80). Continuar con tratamiento.',
          fecha_atencion: hoy + ' 09:30 AM'
        },
        {
          id: 3,
          paciente_dni: '72345678',
          paciente_nombre: 'Roberto Torres Flores',
          paciente_correo: 'roberto.torres@email.com',
          medico_id: 5,
          medico_nombre: 'Dr. Fernando Salazar',
          especialidad: 'Cardiología',
          fecha: hoy,
          hora: '11:00 AM',
          motivo: 'Chequeo cardiológico',
          estado: 'Atendido',
          diagnostico: 'Electrocardiograma normal.',
          fecha_atencion: hoy + ' 11:30 AM'
        }
      ];
      this.guardarCitas(citasIniciales);
    }
  }

  public setUsuarioActual(usuario: UsuarioActual): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(usuario));
  }

  public getUsuarioActual(): UsuarioActual {
    const data = localStorage.getItem(this.USER_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {}
    }
    return { nombre: 'Ana María Lozano', email: 'ana.lozano@email.com' };
  }

  public getCitas(): Cita[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private guardarCitas(citas: Cita[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(citas));
  }

  public getMedicosPorEspecialidad(especialidad: string): Medico[] {
    return this.medicos.filter(m => m.especialidad === especialidad);
  }

  public registrarCita(datos: {
    paciente_dni: string;
    paciente_nombre: string;
    paciente_correo: string;
    especialidad: string;
    medico_id: number;
    fecha: string;
    hora: string;
    motivo: string;
  }): boolean {
    const citas = this.getCitas();
    const medico = this.medicos.find(m => m.id === Number(datos.medico_id));

    const nuevaCita: Cita = {
      id: Date.now(),
      paciente_dni: datos.paciente_dni,
      paciente_nombre: datos.paciente_nombre,
      paciente_correo: datos.paciente_correo,
      medico_id: Number(datos.medico_id),
      medico_nombre: medico ? medico.nombre : 'Médico General',
      especialidad: datos.especialidad,
      fecha: datos.fecha,
      hora: datos.hora,
      motivo: datos.motivo,
      estado: 'Pendiente'
    };

    citas.unshift(nuevaCita);
    this.guardarCitas(citas);
    return true;
  }

  public atenderCita(id: number, diagnostico: string): void {
    const citas = this.getCitas();
    const cita = citas.find(c => c.id === id);
    if (cita) {
      cita.estado = 'Atendido';
      cita.diagnostico = diagnostico;
      cita.fecha_atencion = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString();
      this.guardarCitas(citas);
    }
  }
}
