import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService, Cita } from '../../services/database.service';

@Component({
  selector: 'app-panel-medico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-medico.html',
  styleUrl: './panel-medico.css'
})
export class PanelMedicoComponent implements OnInit {
  citasPendientes: Cita[] = [];
  pacientesAtendidos: Cita[] = [];
  busqueda: string = '';

  constructor(
    private db: DatabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarListas();
  }

  cargarListas(): void {
    const todas = this.db.getCitas();
    const filtro = this.busqueda.toLowerCase().trim();

    this.citasPendientes = todas.filter(c => 
      c.estado === 'Pendiente' &&
      (!filtro || c.medico_nombre.toLowerCase().includes(filtro) || c.paciente_nombre.toLowerCase().includes(filtro))
    );

    this.pacientesAtendidos = todas.filter(c => 
      c.estado === 'Atendido' &&
      (!filtro || c.medico_nombre.toLowerCase().includes(filtro) || c.paciente_nombre.toLowerCase().includes(filtro))
    );
  }

  atenderPaciente(cita: Cita): void {
    const diagnostico = prompt(`Ingresa el diagnóstico o nota médica para el paciente ${cita.paciente_nombre}:`, 'Paciente evaluado correctamente');
    if (diagnostico !== null && diagnostico.trim() !== '') {
      this.db.atenderCita(cita.id, diagnostico.trim());
      this.cargarListas();
    }
  }

  irAGestionCitas(): void {
    this.router.navigate(['/gestion-citas']);
  }

  cerrarSesion(): void {
    this.router.navigate(['/login']);
  }
}
