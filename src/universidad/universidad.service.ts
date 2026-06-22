import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UniversidadService {
  constructor(private readonly prisma: PrismaService) {}

  async crearCarreraConMaterias() {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const carrera = await tx.carrera.create({
        data: {
          nombre: 'Desarrollo de Software',
        },
      });

      const { id: carreraId } = carrera;

      const materiasData = [
        { nombre: 'Programacion 1', carreraId },
        { nombre: 'Programacion 2', carreraId },
        { nombre: 'Base de Datos', carreraId },
      ];

      const [primeraMateria, segundaMateria, terceraMateria] = materiasData;
      const { nombre: nombreMateriaUno } = primeraMateria;
      const { nombre: nombreMateriaDos } = segundaMateria;
      const { nombre: nombreMateriaTres } = terceraMateria;

      await tx.materia.createMany({
        data: [
          { nombre: nombreMateriaUno, carreraId },
          { nombre: nombreMateriaDos, carreraId },
          { nombre: nombreMateriaTres, carreraId },
        ],
      });

      return tx.carrera.findUnique({
        where: { id: carreraId },
        include: {
          materias: true,
        },
      });
    });
  }

  async crearCicloYMatricular() {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const ciclo = await tx.ciclo.create({
        data: {
          nombre: '2026-2027',
          activo: true,
        },
      });

      const { id: cicloId, nombre: nombreCiclo } = ciclo;

      const carrera = await tx.carrera.findFirst({
        where: {
          nombre: 'Desarrollo de Software',
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
          nombre: nombreCiclo,
        },
        materiaAsignada: nombreMateria,
        matriculasCreadas,
      };
    });
  }

  async asignarLaboratorio() {
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
        nombre: {
          in: ['Programacion 1', 'Programacion 2', 'Base de Datos'],
        },
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
