import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService, Medico, Cita, UsuarioActual } from '../../services/database.service';

@Component({
  selector: 'app-gestion-citas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestion-citas.html',
  styleUrl: './gestion-citas.css'
})
export class GestionCitasComponent implements OnInit {
  reservaForm!: FormGroup;
  especialidades: string[] = [];
  medicos: Medico[] = [];
  
  usuarioActual!: UsuarioActual;
  misCitasPendientes: Cita[] = [];
  miHistorialMedico: Cita[] = [];
  
  // Horarios sugeridos rápidos
  horariosRapidos: string[] = ['08:00', '09:00', '10:30', '11:30', '14:00', '15:30', '16:30'];
  
  mensajeExito: string | null = null;

  constructor(
    private fb: FormBuilder,
    private db: DatabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.db.getUsuarioActual();
    this.especialidades = this.db.especialidades;

    this.reservaForm = this.fb.group({
      especialidad: ['', [Validators.required]],
      medico_id: ['', [Validators.required]],
      paciente_dni: [this.usuarioActual.dni || '71234567', [Validators.required]],
      paciente_nombre: [this.usuarioActual.nombre, [Validators.required]],
      paciente_correo: [this.usuarioActual.email, [Validators.required, Validators.email]],
      fecha: [new Date().toISOString().split('T')[0], [Validators.required]],
      hora: ['09:30', [Validators.required]],
      motivo: ['', [Validators.required]]
    });

    // Cuando cambia la especialidad, filtramos los médicos disponibles
    this.reservaForm.get('especialidad')?.valueChanges.subscribe((esp) => {
      this.medicos = this.db.getMedicosPorEspecialidad(esp);
      if (this.medicos.length > 0) {
        this.reservaForm.get('medico_id')?.setValue(this.medicos[0].id);
      } else {
        this.reservaForm.get('medico_id')?.setValue('');
      }
    });

    this.reservaForm.get('especialidad')?.setValue(this.especialidades[0]);
    this.cargarDatosPaciente();
  }

  seleccionarHorario(hora: string): void {
    this.reservaForm.get('hora')?.setValue(hora);
  }

  cargarDatosPaciente(): void {
    const todasLasCitas = this.db.getCitas();
    const nombreUsuario = (this.usuarioActual.nombre || '').toLowerCase().trim();
    const correoUsuario = (this.usuarioActual.email || '').toLowerCase().trim();
    const dniUsuario = (this.usuarioActual.dni || '').trim();

    // Filtra las citas pertenecientes a este paciente
    const misCitas = todasLasCitas.filter(c => 
      (dniUsuario && c.paciente_dni === dniUsuario) ||
      (correoUsuario && c.paciente_correo.toLowerCase() === correoUsuario) ||
      (nombreUsuario && c.paciente_nombre.toLowerCase().includes(nombreUsuario))
    );

    this.misCitasPendientes = misCitas.filter(c => c.estado === 'Pendiente');
    this.miHistorialMedico = misCitas.filter(c => c.estado === 'Atendido');
  }

  registrarCita(): void {
    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      return;
    }

    const valor = { ...this.reservaForm.value };
    
    // Formatear la hora de 24h a formato legible con AM/PM
    let horaFinal = valor.hora;
    if (horaFinal && horaFinal.includes(':') && !horaFinal.includes('AM') && !horaFinal.includes('PM')) {
      const [hStr, mStr] = horaFinal.split(':');
      let h = parseInt(hStr, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12;
      horaFinal = `${String(h).padStart(2, '0')}:${mStr} ${ampm}`;
    }
    valor.hora = horaFinal;

    this.db.registrarCita(valor);
    this.mensajeExito = `¡Cita agendada para las ${horaFinal}! Ya puedes verla en tus Citas Agendadas.`;
    
    // Actualizar las listas en la columna izquierda inmediatamente
    this.cargarDatosPaciente();

    // Limpiar motivo
    this.reservaForm.patchValue({
      motivo: ''
    });

    setTimeout(() => {
      this.mensajeExito = null;
    }, 4000);
  }

  irAlPanel(): void {
    if (this.usuarioActual.rol === 'admin') {
      this.router.navigate(['/panel-admin']);
    } else {
      this.router.navigate(['/panel-medico']);
    }
  }

  cerrarSesion(): void {
    this.db.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
