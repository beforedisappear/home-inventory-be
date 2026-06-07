import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LibsModule } from '@/libs/libs.module';
import { InfraModule } from '@/infra/infra.module';

import { ContainerService } from './services/container.service';
import { ContainerController } from './controllers/container.controller';
import { ContainerRepository } from './repositories/container.repository';
import { ContainerRuleService } from './services/container-rule.service';
import { ContainerRuleSeedService } from './services/container-rule-seed.service';
import { ContainerRuleController } from './controllers/container-rule.controller';
import { ContainerRuleRepository } from './repositories/container-rule.repository';

import { Container, ContainerSchema } from './schemas/container.schema';
import {
  ContainerRule,
  ContainerRuleSchema,
} from './schemas/container-rule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Container.name, schema: ContainerSchema },
      { name: ContainerRule.name, schema: ContainerRuleSchema },
    ]),
    InfraModule,
    LibsModule,
  ],
  controllers: [ContainerController, ContainerRuleController],
  providers: [
    ContainerService,
    ContainerRepository,
    ContainerRuleService,
    ContainerRuleSeedService,
    ContainerRuleRepository,
  ],
})
export class ContainerModule {}
