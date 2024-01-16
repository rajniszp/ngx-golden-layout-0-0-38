import { Observable } from 'rxjs';
import * as ɵngcc0 from '@angular/core';
export interface IPluginURL {
    id: string;
    url: string;
}
/**
 * This class manages plugin load and unload requests across all windows.
 * Because we can't have progress reporting about all windows, we also don't
 * return any progress/success indicator here.
 */
export declare class PluginURLProvider {
    private loadedURLs;
    private loads;
    private unloads;
    loadRequests$(): Observable<IPluginURL>;
    unloadRequests$(): Observable<string>;
    allPlugins(): IPluginURL[];
    requestLoad(id: string, url: string): void;
    requestUnload(id: string): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<PluginURLProvider, never>;
    static ɵprov: ɵngcc0.ɵɵInjectableDef<PluginURLProvider>;
}

//# sourceMappingURL=plugin-url.service.d.ts.map