import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ItemModule } from '@/api/item/item.module';
import { InfraModule } from '@/infra/infra.module';
import { LibsModule } from '@/libs/libs.module';

import { ContainerRuleController } from './controllers/container-rule.controller';
import { ContainerController } from './controllers/container.controller';
import { ContainerRuleRepository } from './repositories/container-rule.repository';
import { ContainerRepository } from './repositories/container.repository';
import {
  ContainerRule,
  ContainerRuleSchema,
} from './schemas/container-rule.schema';
import { Container, ContainerSchema } from './schemas/container.schema';
import { ContainerRuleSeedService } from './services/container-rule-seed.service';
import { ContainerRuleService } from './services/container-rule.service';
import { ContainerService } from './services/container.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Container.name, schema: ContainerSchema },
      { name: ContainerRule.name, schema: ContainerRuleSchema },
    ]),
    InfraModule,
    LibsModule,
    forwardRef(() => ItemModule),
  ],
  controllers: [ContainerController, ContainerRuleController],
  providers: [
    ContainerService,
    ContainerRepository,
    ContainerRuleService,
    ContainerRuleSeedService,
    ContainerRuleRepository,
  ],
  exports: [ContainerService],
})
export class ContainerModule {}
