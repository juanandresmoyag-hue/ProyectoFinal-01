import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService, Cita, Medico, Cliente, UsuarioActual } from '../../services/database.service';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-admin.html',
  styleUrl: './panel-admin.css'
})
export class PanelAdminComponent implements OnInit {
  usuarioActual!: UsuarioActual;
  
  // Datos
  todasLasCitas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  clientes: Cliente[] = [];
  medicos: Medico[] = [];
  especialidades: string[] = [];

  // Pestaña activa
  pestanaActiva: 'citas' | 'clientes' | 'medicos' = 'citas';

  // Filtros
  busqueda: string = '';
  filtroMedico: string = 'todos';
  filtroEspecialidad: string = 'todas';
  filtroEstado: string = 'todos';

  // Estadísticas
  totalCitas: number = 0;
  totalPendientes: number = 0;
  totalAtendidas: number = 0;
  totalClientes: number = 0;
  totalMedicos: number = 0;

  constructor(
    private db: DatabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.db.getUsuarioActual();
    this.medicos = this.db.medicos;
    this.especialidades = this.db.especialidades;
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.todasLasCitas = this.db.getCitas();
    this.clientes = this.db.getClientes();
    this.totalMedicos = this.medicos.length;
    this.totalClientes = this.clientes.length;
    this.totalCitas = this.todasLasCitas.length;
    this.totalPendientes = this.todasLasCitas.filter(c => c.estado === 'Pendiente').length;
    this.totalAtendidas = this.todasLasCitas.filter(c => c.estado === 'Atendido').length;

    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    const query = this.busqueda.toLowerCase().trim();

    this.citasFiltradas = this.todasLasCitas.filter(c => {
      // Filtro de Médico
      if (this.filtroMedico !== 'todos' && c.medico_id !== Number(this.filtroMedico)) {
        return false;
      }

      // Filtro de Especialidad
      if (this.filtroEspecialidad !== 'todas' && c.especialidad !== this.filtroEspecialidad) {
        return false;
      }

      // Filtro de Estado
      if (this.filtroEstado !== 'todos' && c.estado !== this.filtroEstado) {
        return false;
      }

      // Búsqueda de texto
      if (query) {
        const coincidePaciente = c.paciente_nombre.toLowerCase().includes(query);
        const coincideDni = c.paciente_dni.includes(query);
        const coincideMedico = c.medico_nombre.toLowerCase().includes(query);
        const coincideMotivo = c.motivo.toLowerCase().includes(query);
        return coincidePaciente || coincideDni || coincideMedico || coincideMotivo;
      }

      return true;
    });
  }

  cambiarPestana(pestana: 'citas' | 'clientes' | 'medicos'): void {
    this.pestanaActiva = pestana;
  }

  atenderCitaAdmin(cita: Cita): void {
    const diagnostico = prompt(
      `[ADMINISTRACIÓN] Registrar diagnóstico para ${cita.paciente_nombre} (Atendido por ${cita.medico_nombre}):`,
      'Consulta finalizada y validada por administración.'
    );

    if (diagnostico !== null && diagnostico.trim() !== '') {
      this.db.atenderCita(cita.id, diagnostico.trim());
      this.cargarDatos();
    }
  }

  getCitasDeMedico(medicoId: number): number {
    return this.todasLasCitas.filter(c => c.medico_id === medicoId).length;
  }

  getCitasDeCliente(email: string, dni: string): number {
    const emailNorm = (email || '').toLowerCase().trim();
    return this.todasLasCitas.filter(c => 
      c.paciente_dni === dni || (c.paciente_correo && c.paciente_correo.toLowerCase() === emailNorm)
    ).length;
  }

  irAGestionCitas(): void {
    this.router.navigate(['/gestion-citas']);
  }

  irAPanelMedico(): void {
    this.router.navigate(['/panel-medico']);
  }

  cerrarSesion(): void {
    this.db.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
