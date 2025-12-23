import { Injectable, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class CustomCacheService implements OnModuleDestroy {
    private readonly storage = new Map<string, any>();
    private readonly timeouts = new Map<string, NodeJS.Timeout>();

    private readonly DEFAULT_TTL = 60;
    set(key: string, value: any, ttl: number = this.DEFAULT_TTL): void {
        this.del(key);

        this.storage.set(key, value);

        const timeout = setTimeout(() => {
            this.storage.delete(key);
            this.timeouts.delete(key);
        }, ttl * 1000);

        this.timeouts.set(key, timeout);
    }

    get<T>(key: string): T | null {
        return (this.storage.get(key) as T) || null;
    }

    del(key: string): void {
        if (this.timeouts.has(key)) {
            clearTimeout(this.timeouts.get(key));
            this.timeouts.delete(key);
        }
        this.storage.delete(key);
    }

    onModuleDestroy() {
        this.timeouts.forEach(t => clearTimeout(t));
        this.storage.clear();
        this.timeouts.clear();
    }
}