import { Type } from '@angular/core';
import { ComponentType } from './config';
import { PluginRegistryService } from './plugin-registry.service';
import * as ɵngcc0 from '@angular/core';
export declare class ComponentRegistryService {
    private pluginRegistry?;
    private components;
    private awaitedComponents;
    constructor(initialComponents?: ComponentType[], pluginRegistry?: PluginRegistryService);
    registeredComponents(): ComponentType[];
    componentMap(): Map<string, Type<any>>;
    registerComponent(component: ComponentType): void;
    waitForComponent(component: string): Promise<Type<any>>;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<ComponentRegistryService, [{ optional: true; }, { optional: true; }]>;
    static ɵprov: ɵngcc0.ɵɵInjectableDef<ComponentRegistryService>;
}

//# sourceMappingURL=component-registry.service.d.ts.map