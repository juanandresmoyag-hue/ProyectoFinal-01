import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  modo: 'login' | 'registro' = 'login';
  
  loginForm!: FormGroup;
  registroForm!: FormGroup;

  mensajeError: string | null = null;
  mensajeExito: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private db: DatabaseService
  ) {}
  
  ngOnInit(): void {
    // Formulario de Iniciar Sesión
    this.loginForm = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });

    // Formulario de Registro de Nuevo Paciente / Cliente
    this.registroForm = this.fb.nonNullable.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8,12}$')]],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  cambiarModo(nuevoModo: 'login' | 'registro'): void {
    this.modo = nuevoModo;
    this.mensajeError = null;
    this.mensajeExito = null;
  }

  // --- INICIAR SESIÓN ---
  onLogin(): void {
    this.mensajeError = null;
    this.mensajeExito = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email } = this.loginForm.value;
    const emailNorm = (email || '').trim().toLowerCase();

    // 1. ¿Es Administrador?
    if (emailNorm.includes('admin')) {
      this.db.setUsuarioActual({
        nombre: 'Administrador General',
        email: emailNorm,
        rol: 'admin'
      });
      this.router.navigate(['/panel-admin']);
      return;
    }

    // 2. ¿Es Médico?
    const medico = this.db.buscarMedicoPorEmail(emailNorm);
    if (medico || emailNorm.includes('medico')) {
      const doc = medico || this.db.medicos[0];
      this.db.setUsuarioActual({
        nombre: doc.nombre,
        email: doc.email,
        rol: 'medico',
        medico_id: doc.id,
        especialidad: doc.especialidad
      });
      this.router.navigate(['/panel-medico']);
      return;
    }

    // 3. Es Paciente / Cliente
    const cliente = this.db.buscarClientePorEmail(emailNorm);
    const nombreUsuario = cliente ? cliente.nombre : 'Paciente ' + emailNorm.split('@')[0];
    const dniUsuario = cliente ? cliente.dni : '71234567';

    this.db.setUsuarioActual({
      nombre: nombreUsuario,
      email: emailNorm,
      rol: 'paciente',
      dni: dniUsuario
    });

    this.router.navigate(['/gestion-citas']);
  }

  // --- REGISTRAR NUEVO CLIENTE (Con validación de duplicados) ---
  onRegistro(): void {
    this.mensajeError = null;
    this.mensajeExito = null;

    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    const valor = this.registroForm.value;

    const resultado = this.db.registrarCliente({
      dni: valor.dni,
      nombre: valor.nombre,
      email: valor.email,
      password: valor.password,
      telefono: valor.telefono
    });

    if (!resultado.success) {
      this.mensajeError = resultado.message;
      return;
    }

    // Guardar sesión y entrar directamente
    this.db.setUsuarioActual({
      nombre: valor.nombre,
      email: valor.email,
      rol: 'paciente',
      dni: valor.dni
    });

    this.mensajeExito = '¡Registro exitoso! Redirigiendo a tu panel...';
    setTimeout(() => {
      this.router.navigate(['/gestion-citas']);
    }, 1000);
  }

  // --- BOTONES DEMO ---
  demoPaciente(): void {
    this.db.setUsuarioActual({
      nombre: 'Ana María Lozano',
      email: 'ana.lozano@email.com',
      rol: 'paciente',
      dni: '71234567'
    });
    this.router.navigate(['/gestion-citas']);
  }

  demoMedico(): void {
    const doc = this.db.medicos[0]; // Dr. Roberto Mendoza
    this.db.setUsuarioActual({
      nombre: doc.nombre,
      email: doc.email,
      rol: 'medico',
      medico_id: doc.id,
      especialidad: doc.especialidad
    });
    this.router.navigate(['/panel-medico']);
  }

  demoAdmin(): void {
    this.db.setUsuarioActual({
      nombre: 'Administrador del Sistema',
      email: 'admin@salud.com',
      rol: 'admin'
    });
    this.router.navigate(['/panel-admin']);
  }
}
