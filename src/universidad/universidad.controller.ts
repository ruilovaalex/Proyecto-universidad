import { Body, Controller, Post } from '@nestjs/common';
import { UniversidadService } from './universidad.service';

type CrearCarreraBody = {
  nombreCarrera?: string;
  materias?: string[];
};

type CrearCicloBody = {
  nombreCiclo?: string;
  carreraNombre?: string;
};

type AsignarLaboratorioBody = {
  materiaNombre?: string;
  laboratorioNombre?: string;
};

@Controller('universidad')
export class UniversidadController {
  constructor(private readonly universidadService: UniversidadService) {}

  @Post('carrera-materias')
  async crearCarreraConMaterias(@Body() body: CrearCarreraBody) {
    return this.universidadService.crearCarreraConMaterias(body);
  }

  @Post('ciclo-matricular')
  async crearCicloYMatricular(@Body() body: CrearCicloBody) {
    return this.universidadService.crearCicloYMatricular(body);
  }

  @Post('asignar-laboratorio')
  async asignarLaboratorio(@Body() body: AsignarLaboratorioBody) {
    return this.universidadService.asignarLaboratorio(body);
  }
}
