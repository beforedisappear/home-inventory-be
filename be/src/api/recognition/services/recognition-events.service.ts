import { Injectable, MessageEvent } from '@nestjs/common';

import { filter, interval, map, merge, Observable, Subject } from 'rxjs';

import type { RecognitionEvent } from '../interfaces/recognition-event.interface';

// период heartbeat-комментария, чтобы прокси/балансировщик не рубил idle SSE-соединение
const HEARTBEAT_MS = 25_000;

@Injectable()
export class RecognitionEventsService {
  // общий in-memory поток событий (single-instance); пишем .emit, читаем подпиской
  private readonly stream$ = new Subject<RecognitionEvent>();

  emit(event: RecognitionEvent): void {
    this.stream$.next(event);
  }

  // Observable для конкретного юзера: Nest подписывается и шлёт каждое
  // MessageEvent в HTTP-стрим как SSE. На дисконнекте Nest отписывается —
  // и вся цепочка гасится сама.
  streamForUser(userId: string): Observable<MessageEvent> {
    const events$ = this.stream$.asObservable().pipe(
      // чужие события не утекают
      filter((e) => e.userId === userId),
      map((e): MessageEvent => {
        return {
          type: 'recognition',
          data: { recognitionId: e.recognitionId, status: e.status },
        };
      }),
    );

    const heartbeat$ = interval(HEARTBEAT_MS).pipe(
      map((): MessageEvent => ({ type: 'ping', data: '' })),
    );

    return merge(events$, heartbeat$);
  }
}
