import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import {
  BehaviorSubject,
  Observable,
  Subject,
  filter,
  firstValueFrom,
  take,
  timeout,
} from 'rxjs';

type SocketConnectionState = 'disconnected' | 'connecting' | 'connected';

interface TopicEntry {
  stream: Subject<unknown>;
  refCount: number;
  subscription?: StompSubscription;
}

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private readonly socketUrl = 'http://localhost:8080/ws';
  private readonly ngZone = inject(NgZone);

  private readonly connectionStateSubject =
    new BehaviorSubject<SocketConnectionState>('disconnected');
  readonly connectionState$ = this.connectionStateSubject.asObservable();

  private readonly topics = new Map<string, TopicEntry>();

  private readonly client = new Client({
    webSocketFactory: () => new SockJS(this.socketUrl),
    reconnectDelay: 5000,
    onConnect: () => {
      this.runInAngular(() => {
        this.connectionStateSubject.next('connected');
        this.resubscribeAll();
      });
    },
    onDisconnect: () => {
      this.runInAngular(() => {
        this.connectionStateSubject.next('disconnected');
        this.clearSubscriptions();
      });
    },
    onStompError: (frame) => {
      console.error(
        'STOMP error',
        frame.headers['message'] ?? 'Unknown broker error',
        frame.body,
      );
    },
    onWebSocketClose: () => {
      this.runInAngular(() => {
        this.connectionStateSubject.next('disconnected');
        this.clearSubscriptions();
      });
    },
    onWebSocketError: (event) => {
      console.error('WebSocket error', event);
    },
  });

  constructor() {
    this.client.debug = () => {};
  }

  watch<T>(destination: string): Observable<T> {
    return new Observable<T>((observer) => {
      const topic = this.getOrCreateTopic(destination);
      topic.refCount += 1;

      const streamSubscription = topic.stream.asObservable().subscribe({
        next: (message) => observer.next(message as T),
        error: (error) => observer.error(error),
        complete: () => observer.complete(),
      });

      this.ensureConnection();
      this.subscribeToTopic(destination, topic);

      return () => {
        streamSubscription.unsubscribe();
        topic.refCount -= 1;

        if (topic.refCount > 0) {
          return;
        }

        topic.subscription?.unsubscribe();
        topic.stream.complete();
        this.topics.delete(destination);

        if (!this.hasActiveTopics()) {
          void this.client.deactivate();
          this.connectionStateSubject.next('disconnected');
        }
      };
    });
  }

  async publish(destination: string, payload: unknown): Promise<void> {
    this.ensureConnection();
    await this.waitUntilConnected();

    this.client.publish({
      destination,
      body: typeof payload === 'string' ? payload : JSON.stringify(payload),
    });
  }

  disconnect(): void {
    this.clearSubscriptions();
    void this.client.deactivate();
    this.connectionStateSubject.next('disconnected');
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.connectionStateSubject.complete();

    for (const topic of this.topics.values()) {
      topic.stream.complete();
    }

    this.topics.clear();
  }

  private getOrCreateTopic(destination: string): TopicEntry {
    const existingTopic = this.topics.get(destination);
    if (existingTopic) {
      return existingTopic;
    }

    const newTopic: TopicEntry = {
      stream: new Subject<unknown>(),
      refCount: 0,
    };

    this.topics.set(destination, newTopic);
    return newTopic;
  }

  private ensureConnection(): void {
    if (this.client.connected || this.client.active) {
      return;
    }

    this.connectionStateSubject.next('connecting');
    this.client.activate();
  }

  private async waitUntilConnected(): Promise<void> {
    if (this.client.connected) {
      return;
    }

    await firstValueFrom(
      this.connectionState$.pipe(
        filter((state) => state === 'connected'),
        take(1),
        timeout({ first: 5000 }),
      ),
    );
  }

  private resubscribeAll(): void {
    for (const [destination, topic] of this.topics.entries()) {
      topic.subscription = undefined;
      this.subscribeToTopic(destination, topic);
    }
  }

  private subscribeToTopic(destination: string, topic: TopicEntry): void {
    if (!this.client.connected || topic.subscription || topic.refCount === 0) {
      return;
    }

    topic.subscription = this.client.subscribe(destination, (message: IMessage) => {
      this.runInAngular(() => {
        topic.stream.next(this.parseMessage(message));
      });
    });
  }

  private clearSubscriptions(): void {
    for (const topic of this.topics.values()) {
      topic.subscription = undefined;
    }
  }

  private hasActiveTopics(): boolean {
    return Array.from(this.topics.values()).some((topic) => topic.refCount > 0);
  }

  private parseMessage<T>(message: IMessage): T {
    try {
      return JSON.parse(message.body) as T;
    } catch {
      return message.body as T;
    }
  }

  private runInAngular(callback: () => void): void {
    if (NgZone.isInAngularZone()) {
      callback();
      return;
    }

    this.ngZone.run(callback);
  }
}
