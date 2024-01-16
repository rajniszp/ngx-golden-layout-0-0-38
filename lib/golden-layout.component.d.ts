import { ComponentFactoryResolver, ViewContainerRef, OnInit, OnDestroy, NgZone, Injector, EventEmitter, ComponentRef } from '@angular/core';
import * as GoldenLayout from 'golden-layout';
import { ComponentRegistryService } from './component-registry.service';
import { RootWindowService } from './root-window.service';
import { Observable } from 'rxjs';
import { WindowSynchronizerService } from './window-sync.service';
import { IExtendedGoldenLayoutConfig } from './config';
import * as ɵngcc0 from '@angular/core';
export declare const GetComponentFromLayoutManager: (lm: GoldenLayout, id: string) => GoldenLayout.ContentItem;
export declare class GoldenLayoutComponent implements OnInit, OnDestroy {
    private rootService;
    private componentRegistry;
    private viewContainer;
    private componentFactoryResolver;
    private ngZone;
    private readonly injector;
    private windowSync;
    private parentGoldenLayout;
    private readonly fallbackComponent;
    layout: Observable<IExtendedGoldenLayoutConfig>;
    stateChanged: EventEmitter<never>;
    tabActivated: EventEmitter<GoldenLayout.ContentItem>;
    private el;
    private goldenLayout;
    private onUnloaded;
    private stateChangePaused;
    private stateChangeScheduled;
    private tabsList;
    pushStateChange: () => void;
    resumeStateChange: () => boolean;
    pauseStateChange: () => boolean;
    pushTabActivated: (ci: GoldenLayout.ContentItem) => void;
    private fallbackType;
    private layoutSubscription;
    private openedComponents;
    private poppedIn;
    private _eventEmitter;
    onResize(): void;
    constructor(rootService: RootWindowService, componentRegistry: ComponentRegistryService, viewContainer: ViewContainerRef, componentFactoryResolver: ComponentFactoryResolver, ngZone: NgZone, injector: Injector, windowSync: WindowSynchronizerService, parentGoldenLayout: GoldenLayoutComponent, fallbackComponent: any);
    ngOnInit(): void;
    beforeUnload(): void;
    pageHide(): void;
    ngOnDestroy(): void;
    getGoldenLayoutInstance(): GoldenLayout;
    addEvent(kind: string, callback: Function, context?: any): void;
    getSerializableState(): any;
    getComponents(): {
        [id: string]: GoldenLayout.ContentItem;
    };
    closeComponent(component: string): void;
    focusComponent(component: string): void;
    createNewComponent(config: GoldenLayout.ComponentConfig, componentToDock?: string): Promise<ComponentRef<any>>;
    private findStack;
    private destroyGoldenLayout;
    private initializeGoldenLayout;
    /**
     * Build a 'virtual' constructor which is used to pass the components to goldenLayout
     * @param componentType
     */
    private buildConstructor;
    /**
     * Creates an injector capable of injecting the GoldenLayout object,
     * component container, and initial component state.
     */
    private _createComponentInjector;
    /**
     * Registers an event handler for each implemented hook.
     * @param container Golden Layout component container.
     * @param component Angular component instance.
     */
    private _bindEventHooks;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<GoldenLayoutComponent, [null, null, null, null, null, null, null, { optional: true; skipSelf: true; }, { optional: true; }]>;
    static ɵcmp: ɵngcc0.ɵɵComponentDefWithMeta<GoldenLayoutComponent, "golden-layout-root", never, { "layout": "layout"; }, { "stateChanged": "stateChanged"; "tabActivated": "tabActivated"; }, never, never>;
}

//# sourceMappingURL=golden-layout.component.d.ts.map