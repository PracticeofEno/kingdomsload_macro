import { Module } from '@nestjs/common';
import { InstanceService } from './instance.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [InstanceService],
    exports: [InstanceService],
})
export class InstanceModule {}
