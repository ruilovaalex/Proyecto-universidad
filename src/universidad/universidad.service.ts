import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type CrearCarreraParams = {
  nombreCarrera?: string;
  materias?: string[];
};

type CrearCicloParams = {
  nombreCiclo?: string;
  carreraNombre?: string;
};

type AsignarLaboratorioParams = {
  materiaNombre?: string;
  laboratorioNombre?: string;
};

@Injectable()
export class UniversidadService {
  constructor(private readonly prisma: PrismaService) {}

  async crearCarreraConMaterias(params: CrearCarreraParams) {
    const { nombreCarrera, materias } = params;

    if (!nombreCarrera) {
      throw new Error('Debe enviar el nombre de la carrera');
    }

    if (!materias || materias.length < 3) {
      throw new Error('Debe enviar al menos tres materias');
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const carrera = await tx.carrera.create({
        data: {
          nombre: nombreCarrera,
        },
      });

      const { id: carreraId } = carrera;

      const materiasData = materias.map((nombre) => ({ nombre, carreraId }));

      const [primeraMateria, segundaMateria, terceraMateria] = materiasData;

      if (!primeraMateria || !segundaMateria || !terceraMateria) {
        throw new Error('Debe enviar al menos tres materias');
      }

      await tx.materia.createMany({
        data: materiasData,
      });

      return tx.carrera.findUnique({
        where: { id: carreraId },
        include: {
          materias: true,
        },
      });
    });
  }

  async crearCicloYMatricular(params: CrearCicloParams) {
    const { nombreCiclo, carreraNombre } = params;

    if (!nombreCiclo) {
      throw new Error('Debe enviar el nombre del ciclo');
    }

    if (!carreraNombre) {
      throw new Error('Debe enviar el nombre de la carrera');
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const ciclo = await tx.ciclo.create({
        data: {
          nombre: nombreCiclo,
          activo: true,
        },
      });

      const { id: cicloId, nombre: nombreCicloCreado } = ciclo;

      const carrera = await tx.carrera.findFirst({
        where: {
          nombre: carreraNombre,
        },
      });

      if (!carrera) {
        throw new Error('Carrera no encontrada');
      }

      const { id: carreraId } = carrera;

      const estudiantes = await tx.estudiante.findMany();

      if (estudiantes.length === 0) {
        throw new Error('No hay estudiantes registrados');
      }

      const materias = await tx.materia.findMany({
        where: {
          carreraId,
        },
        orderBy: {
          id: 'asc',
        },
      });

      const [primeraMateria] = materias;

      if (!primeraMateria) {
        throw new Error('No hay materias registradas para la carrera');
      }

      const { id: materiaId, nombre: nombreMateria } = primeraMateria;

      const matriculas = estudiantes.map((estudiante) => {
        const { id: estudianteId } = estudiante;

        return {
          activa: true,
          estudianteId,
          cicloId,
          materiaId,
          carreraId,
        };
      });

      const { count: matriculasCreadas } = await tx.matricula.createMany({
        data: matriculas,
      });

      return {
        ciclo: {
          id: cicloId,
          nombre: nombreCicloCreado,
        },
        materiaAsignada: nombreMateria,
        matriculasCreadas,
      };
    });
  }

  async asignarLaboratorio(params: AsignarLaboratorioParams) {
    const {
      materiaNombre,
      laboratorioNombre,
    } = params;

    if (!materiaNombre) {
      throw new Error('Debe enviar el nombre de la materia');
    }

    if (!laboratorioNombre) {
      throw new Error('Debe enviar el nombre del laboratorio');
    }

    const ciclo = await this.prisma.ciclo.findFirst({
      where: {
        activo: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    if (!ciclo) {
      throw new Error('No hay ciclo activo');
    }

    const { id: cicloId, nombre: nombreCiclo } = ciclo;

    const materia = await this.prisma.materia.findFirst({
      where: {
        nombre: materiaNombre,
      },
      orderBy: {
        id: 'asc',
      },
    });

    if (!materia) {
      throw new Error('Materia no encontrada');
    }

    const { id: materiaId, nombre: nombreMateria } = materia;

    const matriculasActivas = await this.prisma.matricula.count({
      where: {
        cicloId,
        materiaId,
        activa: true,
      },
    });

    if (matriculasActivas === 0) {
      throw new Error('No hay matriculas activas para esta materia');
    }

    const laboratorio = await this.prisma.laboratorio.findFirst({
      where: {
        nombre: laboratorioNombre,
      },
      orderBy: {
        id: 'asc',
      },
    });

    if (!laboratorio) {
      throw new Error('Laboratorio no encontrado');
    }

    const { id: laboratorioId, nombre: nombreLaboratorio } = laboratorio;

    const asignacion = await this.prisma.asignacionLab.create({
      data: {
        laboratorioId,
        cicloId,
        materiaId,
      },
      include: {
        laboratorio: true,
        ciclo: true,
        materia: true,
      },
    });

    return {
      ...asignacion,
      resumen: {
        ciclo: nombreCiclo,
        materia: nombreMateria,
        laboratorio: nombreLaboratorio,
      },
    };
  }
}
