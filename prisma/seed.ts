import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const estudiantesBase = ['Ana Perez', 'Luis Garcia', 'Maria Lopez'];

  for (const nombre of estudiantesBase) {
    const estudiante = await prisma.estudiante.findFirst({
      where: { nombre },
    });

    if (!estudiante) {
      await prisma.estudiante.create({
        data: { nombre },
      });
    }
  }

  const laboratorio = await prisma.laboratorio.findFirst({
    where: { nombre: 'Laboratorio A' },
  });

  if (!laboratorio) {
    await prisma.laboratorio.create({
      data: { nombre: 'Laboratorio A' },
    });
  }
}

main()
  .catch(async (error) => {
    console.error('Error al ejecutar el seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
