import { Body, Controller, Post } from '@nestjs/common';
import { UniversidadService } from './universidad.service';
import { AsignarLaboratorioDto } from './dto/asignar-laboratorio.dto';
import { CrearCarreraDto } from './dto/crear-carrera.dto';
import { CrearCicloDto } from './dto/crear-ciclo.dto';

@Controller('universidad')
export class UniversidadController {
  constructor(private readonly universidadService: UniversidadService) {}

  @Post('carrera-materias')
  async crearCarreraConMaterias(@Body() body: CrearCarreraDto) {
    return this.universidadService.crearCarreraConMaterias(body);
  }

  @Post('ciclo-matricular')
  async crearCicloYMatricular(@Body() body: CrearCicloDto) {
    return this.universidadService.crearCicloYMatricular(body);
  }

  @Post('asignar-laboratorio')
  async asignarLaboratorio(@Body() body: AsignarLaboratorioDto) {
    return this.universidadService.asignarLaboratorio(body);
  }
}
