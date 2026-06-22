import { Module } from '@nestjs/common';
import { UniversidadController } from './universidad.controller';
import { UniversidadService } from './universidad.service';

@Module({
  controllers: [UniversidadController],
  providers: [UniversidadService],
})
export class UniversidadModule {}
