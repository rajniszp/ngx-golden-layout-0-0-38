import { OnInit, OnDestroy } from '@angular/core';
import { GlHeaderItem, GlOnHide, GlOnShow, GlOnResize, GlOnTab } from './hooks';
import * as ɵngcc0 from '@angular/core';
export declare class WrapperComponent implements GlHeaderItem, OnInit, OnDestroy, GlOnHide, GlOnShow, GlOnResize, GlOnTab {
    private host;
    private container;
    private state;
    get headerComponent(): any;
    get additionalTokens(): any;
    private originalComponent;
    private destroyed;
    private initialized;
    constructor(host: any, container: any, state: any);
    ngOnInit(): void;
    ngOnDestroy(): void;
    private redock;
    glOnHide(): void;
    glOnShow(): void;
    glOnResize(): void;
    glOnTab(tab: any): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<WrapperComponent, never>;
    static ɵcmp: ɵngcc0.ɵɵComponentDefWithMeta<WrapperComponent, "gl-wrapper", never, {}, {}, never, never>;
}

//# sourceMappingURL=wrapper.component.d.ts.map