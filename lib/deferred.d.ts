export declare class Deferred<T> {
    promise: Promise<T>;
    resolve: (val: T) => void;
    reject: (reason: Error | string) => void;
    constructor();
}
