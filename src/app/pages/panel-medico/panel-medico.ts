import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService, Cita, UsuarioActual, Medico } from '../../services/database.service';

@Component({
  selector: 'app-panel-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-medico.html',
  styleUrl: './panel-medico.css'
})
export class PanelMedicoComponent implements OnInit {
  usuarioActual!: UsuarioActual;
  medicoActual?: Medico;
  medicosDisponibles: Medico[] = [];
  
  citasPendientes: Cita[] = [];
  pacientesAtendidos: Cita[] = [];
  busqueda: string = '';

  constructor(
    private db: DatabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.medicosDisponibles = this.db.medicos;
    this.usuarioActual = this.db.getUsuarioActual();

    // Si no tiene rol de médico o no tiene médico asignado, asignar por defecto al Dr. Roberto Mendoza
    if (this.usuarioActual.rol !== 'medico' || !this.usuarioActual.medico_id) {
      const docDefecto = this.db.medicos[0];
      this.usuarioActual = {
        nombre: docDefecto.nombre,
        email: docDefecto.email,
        rol: 'medico',
        medico_id: docDefecto.id,
        especialidad: docDefecto.especialidad
      };
      this.db.setUsuarioActual(this.usuarioActual);
    }

    this.medicoActual = this.db.medicos.find(m => m.id === this.usuarioActual.medico_id) || this.db.medicos[0];
    this.cargarListas();
  }

  cambiarMedicoActivo(medicoId: string | number): void {
    const id = Number(medicoId);
    const doc = this.db.medicos.find(m => m.id === id);
    if (doc) {
      this.usuarioActual = {
        nombre: doc.nombre,
        email: doc.email,
        rol: 'medico',
        medico_id: doc.id,
        especialidad: doc.especialidad
      };
      this.db.setUsuarioActual(this.usuarioActual);
      this.medicoActual = doc;
      this.cargarListas();
    }
  }

  cargarListas(): void {
    const todas = this.db.getCitas();
    const filtro = this.busqueda.toLowerCase().trim();
    const medicoId = this.usuarioActual.medico_id;
    const medicoNombre = (this.usuarioActual.nombre || '').toLowerCase().trim();

    // FILTRO ESTRICTO: Solo citas registradas al nombre / ID de este médico
    const citasDelMedico = todas.filter(c => 
      (medicoId ? c.medico_id === medicoId : false) ||
      (c.medico_nombre && c.medico_nombre.toLowerCase().includes(medicoNombre))
    );

    this.citasPendientes = citasDelMedico.filter(c => 
      c.estado === 'Pendiente' &&
      (!filtro || 
       c.paciente_nombre.toLowerCase().includes(filtro) || 
       c.paciente_dni.includes(filtro) ||
       c.motivo.toLowerCase().includes(filtro))
    );

    this.pacientesAtendidos = citasDelMedico.filter(c => 
      c.estado === 'Atendido' &&
      (!filtro || 
       c.paciente_nombre.toLowerCase().includes(filtro) || 
       c.paciente_dni.includes(filtro) ||
       (c.diagnostico && c.diagnostico.toLowerCase().includes(filtro)))
    );
  }

  atenderPaciente(cita: Cita): void {
    const diagnostico = prompt(
      `Ingresa el diagnóstico o nota médica para el paciente ${cita.paciente_nombre}:`, 
      'Paciente evaluado. Signos vitales normales y tratamiento indicado.'
    );
    if (diagnostico !== null && diagnostico.trim() !== '') {
      this.db.atenderCita(cita.id, diagnostico.trim());
      this.cargarListas();
    }
  }

  irAGestionCitas(): void {
    this.router.navigate(['/gestion-citas']);
  }

  cerrarSesion(): void {
    this.db.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
