export declare function MultiWindowInit(): void;
export declare type Constructor<T> = {
    new (...args: any[]): T;
};
export declare function isChildWindow(): boolean;
export declare function MultiWindowService<T>(uniqueName: string): (constructor: Constructor<T>) => Constructor<T>;
