import "reflect-metadata";
import { InjectionToken, Injector, Type } from "injection-js";

let resolver: Injector | null = null;
export function setupInjector(injector: Injector) {
    resolver = injector;
}

export function resolveService<T>(token: Type<T> | InjectionToken<T>, notFoundValue?: T): T {
    if (!resolver) {
        throw new Error("dependency injector not initialized");
    }

    return resolver.get(token, notFoundValue);
}
