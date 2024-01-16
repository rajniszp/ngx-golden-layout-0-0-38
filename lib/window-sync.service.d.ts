import { ApplicationRef, Injector } from '@angular/core';
import { RootWindowService } from './root-window.service';
import * as ɵngcc0 from '@angular/core';
export declare class MockWindowSynchronizerService {
    restoreAppRefTick(): void;
    onUnload(): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<MockWindowSynchronizerService, never>;
    static ɵprov: ɵngcc0.ɵɵInjectableDef<MockWindowSynchronizerService>;
}
export declare class WindowSynchronizerService {
    private appref;
    private rootService;
    private injector;
    private topWindow;
    private isChildWindow;
    private unloaded;
    constructor(appref: ApplicationRef, rootService: RootWindowService, injector: Injector);
    restoreAppRefTick(): void;
    onUnload(): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<WindowSynchronizerService, never>;
    static ɵprov: ɵngcc0.ɵɵInjectableDef<WindowSynchronizerService>;
}

//# sourceMappingURL=window-sync.service.d.ts.map