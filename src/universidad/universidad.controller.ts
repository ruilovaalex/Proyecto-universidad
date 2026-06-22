import { Controller, Post } from '@nestjs/common';
import { UniversidadService } from './universidad.service';

@Controller('universidad')
export class UniversidadController {
  constructor(private readonly universidadService: UniversidadService) {}

  @Post('carrera-materias')
  async crearCarreraConMaterias() {
    return this.universidadService.crearCarreraConMaterias();
  }

  @Post('ciclo-matricular')
  async crearCicloYMatricular() {
    return this.universidadService.crearCicloYMatricular();
  }

  @Post('asignar-laboratorio')
  async asignarLaboratorio() {
    return this.universidadService.asignarLaboratorio();
  }
}
