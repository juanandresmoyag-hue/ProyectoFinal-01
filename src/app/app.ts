// src/app/app.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // <-- Importación estándar para Standalone

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],                  // <-- Agregado RouterOutlet aquí
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent { } // <-- ¡Listo! El "export" permite que main.ts lo reconozca
