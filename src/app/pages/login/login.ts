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
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private db: DatabaseService
  ) {}
  
/*   crea la base para el formulario de login con validaciones para cada campo */
  ngOnInit(): void {
    this.loginForm = this.fb.nonNullable.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { nombre, email } = this.loginForm.value;

    // Guardar los datos de la persona que se registra/inicia sesión
    this.db.setUsuarioActual({
      nombre: nombre || 'Usuario',
      email: email || ''
    });

    if (email && email.toLowerCase().includes('medico')) {
      this.router.navigate(['/panel-medico']);
    } else {
      this.router.navigate(['/gestion-citas']);
    }
  }
}
