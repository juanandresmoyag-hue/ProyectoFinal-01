import { Injectable } from '@angular/core';

export interface Medico {
  id: number;
  nombre: string;
  especialidad: string;
  email: string;
}

export interface Cliente {
  id: number;
  dni: string;
  nombre: string;
  email: string;
  password?: string;
  telefono?: string;
  fechaRegistro: string;
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
  rol: 'paciente' | 'medico' | 'admin';
  dni?: string;
  medico_id?: number;
  especialidad?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private STORAGE_KEY = 'clinica_citas_data';
  private USER_KEY = 'clinica_usuario_actual';
  private CLIENTES_KEY = 'clinica_clientes_data';

  // Lista base de médicos y especialidades con correos para login
  public medicos: Medico[] = [
    { id: 1, nombre: 'Dr. Roberto Mendoza', especialidad: 'Medicina General', email: 'mendoza@salud.com' },
    { id: 2, nombre: 'Dra. Patricia Silva', especialidad: 'Medicina General', email: 'silva@salud.com' },
    { id: 3, nombre: 'Dra. Carmen Delgado', especialidad: 'Pediatría', email: 'delgado@salud.com' },
    { id: 4, nombre: 'Dr. Jorge Ramírez', especialidad: 'Pediatría', email: 'ramirez@salud.com' },
    { id: 5, nombre: 'Dr. Fernando Salazar', especialidad: 'Cardiología', email: 'salazar@salud.com' },
    { id: 6, nombre: 'Dra. Lucía Paredes', especialidad: 'Cardiología', email: 'paredes@salud.com' },
    { id: 7, nombre: 'Dra. María Elena Castro', especialidad: 'Ginecología', email: 'castro@salud.com' },
    { id: 8, nombre: 'Dr. Andrés Guzmán', especialidad: 'Ginecología', email: 'guzman@salud.com' }
  ];

  public especialidades = ['Medicina General', 'Pediatría', 'Cardiología', 'Ginecología'];

  constructor() {
    this.inicializarDatos();
  }

  private inicializarDatos(): void {
    const hoy = new Date().toISOString().split('T')[0];

    // 1. Inicializar clientes si no existen
    if (!localStorage.getItem(this.CLIENTES_KEY)) {
      const clientesIniciales: Cliente[] = [
        {
          id: 1,
          dni: '71234567',
          nombre: 'Ana María Lozano',
          email: 'ana.lozano@email.com',
          fechaRegistro: hoy
        },
        {
          id: 2,
          dni: '72345678',
          nombre: 'Roberto Torres Flores',
          email: 'roberto.torres@email.com',
          fechaRegistro: hoy
        },
        {
          id: 3,
          dni: '73456789',
          nombre: 'Carla Morales Vega',
          email: 'carla.morales@email.com',
          fechaRegistro: hoy
        }
      ];
      this.guardarClientes(clientesIniciales);
    }

    // 2. Inicializar citas si no existen
    if (!localStorage.getItem(this.STORAGE_KEY)) {
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
          motivo: 'Evaluación de exámenes y dolor de cabeza recurrente',
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
          diagnostico: 'Presión arterial estable (120/80). Continuar con tratamiento indicado.',
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
          motivo: 'Chequeo cardiológico y taquicardia',
          estado: 'Atendido',
          diagnostico: 'Electrocardiograma dentro de límites normales. Se recomienda reducir consumo de cafeína.',
          fecha_atencion: hoy + ' 11:30 AM'
        },
        {
          id: 4,
          paciente_dni: '73456789',
          paciente_nombre: 'Carla Morales Vega',
          paciente_correo: 'carla.morales@email.com',
          medico_id: 3,
          medico_nombre: 'Dra. Carmen Delgado',
          especialidad: 'Pediatría',
          fecha: hoy,
          hora: '10:00 AM',
          motivo: 'Control de crecimiento y vacunas de su hijo',
          estado: 'Pendiente'
        },
        {
          id: 5,
          paciente_dni: '72345678',
          paciente_nombre: 'Roberto Torres Flores',
          paciente_correo: 'roberto.torres@email.com',
          medico_id: 2,
          medico_nombre: 'Dra. Patricia Silva',
          especialidad: 'Medicina General',
          fecha: hoy,
          hora: '02:00 PM',
          motivo: 'Revisión general preventiva',
          estado: 'Pendiente'
        }
      ];
      this.guardarCitas(citasIniciales);
    }
  }

  // --- GESTIÓN DE CLIENTES (Evitar duplicados) ---
  public getClientes(): Cliente[] {
    const data = localStorage.getItem(this.CLIENTES_KEY);
    return data ? JSON.parse(data) : [];
  }

  private guardarClientes(clientes: Cliente[]): void {
    localStorage.setItem(this.CLIENTES_KEY, JSON.stringify(clientes));
  }

  public registrarCliente(datos: {
    dni: string;
    nombre: string;
    email: string;
    password?: string;
    telefono?: string;
  }): { success: boolean; message: string; cliente?: Cliente } {
    const clientes = this.getClientes();
    const dniNormalizado = (datos.dni || '').trim();
    const emailNormalizado = (datos.email || '').trim().toLowerCase();

    // Validar si el DNI ya existe
    const existeDni = clientes.some(c => c.dni.trim() === dniNormalizado);
    if (existeDni) {
      return {
        success: false,
        message: `El DNI "${dniNormalizado}" ya está registrado por otro paciente.`
      };
    }

    // Validar si el Correo ya existe
    const existeEmail = clientes.some(c => c.email.trim().toLowerCase() === emailNormalizado);
    if (existeEmail) {
      return {
        success: false,
        message: `El correo electrónico "${emailNormalizado}" ya se encuentra registrado. Inicia sesión directamente.`
      };
    }

    // Crear y registrar nuevo cliente
    const nuevoCliente: Cliente = {
      id: Date.now(),
      dni: dniNormalizado,
      nombre: datos.nombre.trim(),
      email: emailNormalizado,
      password: datos.password,
      telefono: datos.telefono,
      fechaRegistro: new Date().toISOString().split('T')[0]
    };

    clientes.push(nuevoCliente);
    this.guardarClientes(clientes);

    return {
      success: true,
      message: 'Cliente registrado exitosamente.',
      cliente: nuevoCliente
    };
  }

  public buscarClientePorEmail(email: string): Cliente | undefined {
    const clientes = this.getClientes();
    const emailNorm = (email || '').trim().toLowerCase();
    return clientes.find(c => c.email.trim().toLowerCase() === emailNorm);
  }

  public buscarMedicoPorEmail(email: string): Medico | undefined {
    const emailNorm = (email || '').trim().toLowerCase();
    if (emailNorm === 'medico@salud.com') {
      return this.medicos[0]; // Dr. Roberto Mendoza como demo
    }
    return this.medicos.find(m => m.email.trim().toLowerCase() === emailNorm);
  }

  // --- GESTIÓN DE SESIÓN ---
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
    return { 
      nombre: 'Ana María Lozano', 
      email: 'ana.lozano@email.com', 
      rol: 'paciente',
      dni: '71234567'
    };
  }

  public cerrarSesion(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // --- GESTIÓN DE CITAS ---
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

    // Si el paciente no está en el listado de clientes, registrarlo para mantener persistencia
    const clienteExistente = this.buscarClientePorEmail(datos.paciente_correo);
    if (!clienteExistente) {
      this.registrarCliente({
        dni: datos.paciente_dni,
        nombre: datos.paciente_nombre,
        email: datos.paciente_correo
      });
    }

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
