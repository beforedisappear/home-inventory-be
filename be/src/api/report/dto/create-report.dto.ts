import { IsMongoId } from 'class-validator';

export class CreateReportDto {
  @IsMongoId()
  containerId: string;
}
