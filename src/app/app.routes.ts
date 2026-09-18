import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { GestionCitasComponent } from './pages/gestion-citas/gestion-citas';
import { PanelMedicoComponent } from './pages/panel-medico/panel-medico';
import { PanelAdminComponent } from './pages/panel-admin/panel-admin';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'gestion-citas', component: GestionCitasComponent },
  { path: 'panel-medico', component: PanelMedicoComponent },
  { path: 'panel-admin', component: PanelAdminComponent },
  { path: '**', redirectTo: 'login' }
];

