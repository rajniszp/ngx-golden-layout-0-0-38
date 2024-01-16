import { Injector, NgModuleRef } from '@angular/core';
import { PluginDependencyType } from './config';
import { Subject } from 'rxjs';
import { PluginURLProvider } from './plugin-url.service';
import * as ɵngcc0 from '@angular/core';
export declare class MockPluginRegistryService {
    pluginLoaded$: Subject<{
        id: string;
        module: NgModuleRef<any>;
    }>;
    pluginUnloaded$: Subject<string>;
    startLoadPlugin(): void;
    startUnloadPlugin(): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<MockPluginRegistryService, never>;
    static ɵprov: ɵngcc0.ɵɵInjectableDef<MockPluginRegistryService>;
}
/**
 * This class automates the loading of bundles built with ng-packagr,
 * registering the components with GoldenLayout
 * This service MUST be instantiated once per window and defines the 'public'
 * API for loading and unloading plugins.
 */
export declare class PluginRegistryService {
    private urlProvider;
    private injector;
    private availableDependencies;
    private loadedPlugins;
    pluginLoaded$: Subject<{
        id: string;
        module: NgModuleRef<any>;
    }>;
    pluginUnloaded$: Subject<string>;
    constructor(deps: PluginDependencyType[], urlProvider: PluginURLProvider, injector: Injector);
    startLoadPlugin(id: string, url: string): void;
    startUnloadPlugin(id: string): void;
    waitForPlugin(id: string): Promise<any>;
    private patchWindow;
    private load;
    private unload;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<PluginRegistryService, [{ optional: true; }, null, null]>;
    static ɵprov: ɵngcc0.ɵɵInjectableDef<PluginRegistryService>;
}

//# sourceMappingURL=plugin-registry.service.d.ts.map