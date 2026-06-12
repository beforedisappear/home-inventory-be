import { Injectable, MessageEvent } from '@nestjs/common';

import { filter, interval, map, merge, Observable, Subject } from 'rxjs';

import type { ReportEvent } from '../interfaces/report-event.interface';

// период heartbeat-комментария, чтобы прокси/балансировщик не рубил idle SSE-соединение
const HEARTBEAT_MS = 25_000;

@Injectable()
export class ReportEventsService {
  // поток для записи (.next), и для чтения (подписка)
  private readonly stream$ = new Subject<ReportEvent>();

  emit(event: ReportEvent): void {
    this.stream$.next(event);
  }

  // Возвращает Observable конкретно для этого юзера; Nest подписывается на него
  // и каждое испущенное MessageEvent отправляет в HTTP-стрим как SSE-событие.
  // Когда клиент отключается — Nest отписывается, и вся цепочка ниже гасится сама.
  streamForUser(userId: string): Observable<MessageEvent> {
    const events$ = this.stream$.asObservable().pipe(
      // из общего потока берём только события этого юзера (чужие не утекают)
      filter((e) => e.userId === userId),
      // приводим доменное событие к формату SSE: { type → event:, data → data: (JSON) }
      map((e): MessageEvent => {
        return {
          type: 'report',
          data: { reportId: e.reportId, status: e.status },
        };
      }),
    );

    // отдельный поток-пульс: interval раз в HEARTBEAT_MS шлёт пустой ping.
    const heartbeat$ = interval(HEARTBEAT_MS).pipe(
      map((): MessageEvent => ({ type: 'ping', data: '' })),
    );

    // merge склеивает оба потока в один: и реальные события, и пинги
    return merge(events$, heartbeat$);
  }
}
