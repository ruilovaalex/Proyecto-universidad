import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UniversidadModule } from './universidad/universidad.module';

@Module({
  imports: [PrismaModule, UniversidadModule],
})
export class AppModule {}
