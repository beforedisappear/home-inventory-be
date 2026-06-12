import { ReportResponseDto } from '../dto/report-response.dto';
import { ReportDocument } from '../schemas/report.schema';

export class ReportMapper {
  static toResponseDto(
    doc: ReportDocument,
    downloadUrl: string | null,
  ): ReportResponseDto {
    return {
      id: doc._id.toString(),
      status: doc.status,
      containerId: doc.containerId.toString(),
      itemCount: doc.itemCount,
      fileSize: doc.fileSize,
      downloadUrl,
      error: doc.error,
      createdAt: doc.createdAt,
      completedAt: doc.completedAt,
    };
  }
}
