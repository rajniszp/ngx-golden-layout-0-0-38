import { InjectionToken, Injectable, ɵNgModuleFactory, Inject, Optional, Injector, Component, ViewEncapsulation, ApplicationRef, EventEmitter, isDevMode, ViewContainerRef, ComponentFactoryResolver, NgZone, SkipSelf, Input, Output, ViewChild, HostListener, ANALYZE_FOR_ENTRY_COMPONENTS, NgModule } from '@angular/core';
import { Subject, BehaviorSubject, of } from 'rxjs';
import { __decorate } from 'tslib';
import * as GoldenLayout from 'golden-layout';
import { takeUntil, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

/**
 * Inject an array of ComponentType into this token to
 * register those by default with the ComponentRegistry
 */
const GoldenLayoutComponents = new InjectionToken('ComponentTypes');
/**
 * Inject dependency modules to be used with the PluginRegistry
 * This token can use multi: true
 */
const GoldenLayoutPluginDependency = new InjectionToken('Dependencies');

class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}

function MultiWindowInit() {
    if (!isChildWindow()) {
        if (!window.__services && !window.__serviceConstructors) {
            window.__services = new window.Map();
            window.__serviceConstructors = new window.Map();
            // Electron compatibility, when we have a global 'require' in our window, we throw it into the new window context
            if (window.require) {
                const originalWindowOpen = window.open.bind(window);
                window.open = (url, target, features, replace) => {
                    const newWindow = originalWindowOpen(url, target, features, replace);
                    newWindow.require = window.require;
                    return newWindow;
                };
            }
        }
    }
}
function isChildWindow() {
    try {
        return !!window.opener && !!window.opener.location.href;
    }
    catch (e) {
        return false;
    }
}
function MultiWindowService(uniqueName) {
    MultiWindowInit();
    return function (constructor) {
        const constr = constructor;
        const rootWindow = (isChildWindow() ? window.opener : window);
        const rootWindowIsMyWindow = rootWindow === window;
        if (rootWindowIsMyWindow) {
            const constrGot = rootWindow.__serviceConstructors.get(uniqueName);
            if (constrGot && constrGot !== constr) {
                throw new Error(`MultiWindowService(): uniqueName ${uniqueName} already taken by ${constrGot}, wanted by ${constr}`);
            }
            rootWindow.__serviceConstructors.set(uniqueName, constr);
        }
        const newConstructor = (function (...args) {
            const hasInstance = rootWindow.__services.has(uniqueName);
            if (!hasInstance) {
                const storedConstr = rootWindow.__serviceConstructors.get(uniqueName) || constr;
                rootWindow.__services.set(uniqueName, new storedConstr(...args));
            }
            return rootWindow.__services.get(uniqueName);
        });
        if (rootWindowIsMyWindow) {
            // https://github.com/angular/angular/issues/36120
            // ɵfac is created before this decorator runs.
            // so copy over the static properties.
            for (const prop in constr) {
                if (constr.hasOwnProperty(prop)) {
                    newConstructor[prop] = constr[prop];
                }
            }
        }
        try {
            if (rootWindowIsMyWindow) {
                const metadata = Reflect.getMetadata('design:paramtypes', constr);
                Reflect.metadata('design:paramtypes', metadata)(newConstructor);
            }
        }
        catch (_a) {
            // obviously, we're in ivy.
        }
        return newConstructor;
    };
}

;
/**
 * This class manages plugin load and unload requests across all windows.
 * Because we can't have progress reporting about all windows, we also don't
 * return any progress/success indicator here.
 */
let PluginURLProvider = class PluginURLProvider {
    constructor() {
        this.loadedURLs = new Map();
        this.loads = new Subject();
        this.unloads = new Subject();
    }
    loadRequests$() {
        return this.loads;
    }
    unloadRequests$() {
        return this.unloads;
    }
    allPlugins() {
        return [...this.loadedURLs.entries()].map(p => ({ id: p[0], url: p[1] }));
    }
    requestLoad(id, url) {
        const p = this.loadedURLs.get(id);
        if (p) {
            if (p !== url) {
                throw new Error(`Plugin ${id} is already loaded with another URL`);
            }
            return;
        }
        this.loadedURLs.set(id, url);
        this.loads.next({ id, url });
    }
    requestUnload(id) {
        const p = this.loadedURLs.get(id);
        if (!p) {
            throw new Error(`Plugin ${id} is not loaded`);
        }
        this.loadedURLs.delete(id);
        this.unloads.next(id);
    }
};
PluginURLProvider.decorators = [
    { type: Injectable }
];
PluginURLProvider = __decorate([
    MultiWindowService('_gl__PluginURLProvider')
], PluginURLProvider);

;
class MockPluginRegistryService {
    constructor() {
        this.pluginLoaded$ = new Subject();
        this.pluginUnloaded$ = new Subject();
    }
    startLoadPlugin() {
        throw new Error('MockPluginRegistry does not support loading/unloading');
    }
    startUnloadPlugin() {
        throw new Error('MockPluginRegistry does not support loading/unloading');
    }
}
MockPluginRegistryService.decorators = [
    { type: Injectable }
];
/**
 * This class automates the loading of bundles built with ng-packagr,
 * registering the components with GoldenLayout
 * This service MUST be instantiated once per window and defines the 'public'
 * API for loading and unloading plugins.
 */
class PluginRegistryService {
    constructor(deps = [], urlProvider, injector) {
        this.urlProvider = urlProvider;
        this.injector = injector;
        this.availableDependencies = new Map();
        this.loadedPlugins = new Map();
        this.pluginLoaded$ = new Subject();
        this.pluginUnloaded$ = new Subject();
        console.log('Creating PluginRegistry, got', deps.length, 'additional dependency modules');
        deps.forEach(x => this.availableDependencies.set(x.name, x.loader));
        this.patchWindow();
        this.urlProvider.loadRequests$().subscribe(p => this.load(p));
        // Load all previously loaded plugins
        this.urlProvider.allPlugins().forEach(p => this.load(p));
    }
    startLoadPlugin(id, url) {
        this.urlProvider.requestLoad(id, url);
    }
    startUnloadPlugin(id) {
        this.urlProvider.requestUnload(id);
    }
    waitForPlugin(id) {
        const p = this.loadedPlugins.get(id);
        if (p) {
            return p.module.promise;
        }
        const newPlugin = {
            id: id,
            module: new Deferred(),
            url: null,
            script: null,
            moduleRef: null,
        };
        this.loadedPlugins.set(id, newPlugin);
        return newPlugin.module.promise;
    }
    patchWindow() {
        window.define = (moduleId, deps, factory) => {
            const x = this.loadedPlugins.get(moduleId);
            if (!x) {
                console.warn('Unknown plugin called define():', moduleId);
                return;
            }
            // first param is exports
            deps = deps.slice(1);
            const depsExports = deps.map(d => {
                const p = this.availableDependencies.get(d);
                if (!p) {
                    console.warn('Plugin', moduleId, 'requested unknown dependency', d);
                    return Promise.resolve(undefined);
                }
                const promisifiedP = Promise.resolve(p);
                return promisifiedP.catch(err => {
                    console.warn('Plugin', moduleId, 'dependency', d, 'but load failed', err);
                    return undefined;
                });
            });
            Promise.all(depsExports).then(deps => {
                const exports = {};
                factory(exports, ...deps);
                console.log('Plugin', moduleId, 'loaded.');
                const moduleKlass = exports.MODULE;
                if (!moduleKlass) {
                    return Promise.reject("No MODULE export found");
                }
                const moduleFactory = new ɵNgModuleFactory(moduleKlass);
                x.moduleRef = moduleFactory.create(this.injector);
                x.module.resolve(exports);
                this.pluginLoaded$.next({ id: x.id, module: x.moduleRef });
            }).catch(err => {
                console.warn('Failed to load plugin', moduleId, 'error', err);
                x.module.reject(err);
            });
        };
        window.define.amd = true;
        console.log('Window AMD shim established.');
    }
    load({ id, url }) {
        let p = this.loadedPlugins.get(id);
        // plugin is already loaded or in progress.
        if (p && p.url) {
            if (p.url !== url) {
                throw new Error("Plugin is already loaded with another URL");
            }
            return;
        }
        // !p means that p is not acitvely being waited on, so create it.
        // if p is defined here it means that component construction actively
        // waits on the loading of this plugin, so we don't need to recreate
        // the structure here.
        if (!p) {
            p = {
                id: id,
                module: new Deferred(),
                url: null,
                moduleRef: null,
                script: null,
            };
        }
        // Start the actual loading process
        p.url = url;
        this.loadedPlugins.set(id, p);
        const script = document.createElement('script');
        script.onerror = (e) => p.module.reject(e);
        script.type = 'text/javascript';
        script.src = url;
        p.script = script;
        document.body.appendChild(script);
    }
    unload(id) {
        // TBD
    }
}
PluginRegistryService.decorators = [
    { type: Injectable }
];
PluginRegistryService.ctorParameters = () => [
    { type: Array, decorators: [{ type: Inject, args: [GoldenLayoutPluginDependency,] }, { type: Optional }] },
    { type: PluginURLProvider },
    { type: Injector }
];

const GoldenLayoutContainer = new InjectionToken('GoldenLayoutContainer');
const GoldenLayoutComponentState = new InjectionToken('GoldenLayoutComponentState');
const GoldenLayoutEventHub = new InjectionToken('GoldenLayoutEventHub');
const GoldenLayoutComponentHost = new InjectionToken('GoldenLayoutComponentHost');

/**
 * Type guard which determines if a component implements the GlOnResize interface.
 */
function implementsGlOnResize(obj) {
    return typeof obj === 'object' && typeof obj.glOnResize === 'function';
}
/**
 * Type guard which determines if a component implements the GlOnShow interface.
 */
function implementsGlOnShow(obj) {
    return typeof obj === 'object' && typeof obj.glOnShow === 'function';
}
/**
 * Type guard which determines if a component implements the GlOnHide interface.
 */
function implementsGlOnHide(obj) {
    return typeof obj === 'object' && typeof obj.glOnHide === 'function';
}
/**
 * Type guard which determines if a component implements the GlOnTab interface.
 */
function implementsGlOnTab(obj) {
    return typeof obj === 'object' && typeof obj.glOnTab === 'function';
}
/**
 * Type guard which determines if a component implements the GlOnClose interface.
 */
function implementsGlOnClose(obj) {
    return typeof obj === 'object' && typeof obj.glOnClose === 'function';
}
function implementsGlOnPopin(obj) {
    return typeof obj === 'object' && typeof obj.glOnPopin === 'function';
}
function implementsGlOnUnload(obj) {
    return typeof obj === 'object' && typeof obj.glOnUnload === 'function';
}
function implementsGlOnPopout(obj) {
    return typeof obj === 'object' && typeof obj.glOnPopout === 'function';
}
function implementsGlHeaderItem(obj) {
    return typeof obj === 'object' && typeof obj.headerComponent === 'function';
}
const uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

class WrapperComponent {
    constructor(host, container, state) {
        this.host = host;
        this.container = container;
        this.state = state;
        this.destroyed = false;
        this.initialized = false;
        this.originalComponent = this.host.getGoldenLayoutInstance()._getAllComponents()[this.state.originalId];
    }
    get headerComponent() {
        if (!this.originalComponent || !this.originalComponent.instance) {
            return undefined;
        }
        return this.originalComponent.instance.then(x => x.instance.headerComponent);
    }
    get additionalTokens() {
        if (!this.originalComponent || !this.originalComponent.instance) {
            return undefined;
        }
        return this.originalComponent.instance.then(x => x.instance.additionalTokens);
    }
    ngOnInit() {
        this.originalComponent.instance.then((componentRef) => {
            if (this.destroyed || this.initialized) {
                return;
            }
            this.redock(componentRef, this.container.getElement());
            this.initialized = true;
        });
    }
    ngOnDestroy() {
        this.originalComponent.instance.then((cr) => {
            if (!this.initialized || this.destroyed) {
                return;
            }
            this.redock(cr, this.originalComponent.container.getElement());
            this.destroyed = true;
        });
    }
    redock(componentRef, to) {
        const el = $(componentRef.location.nativeElement);
        el.remove();
        to.append(el);
        if (implementsGlOnResize(componentRef.instance)) {
            componentRef.instance.glOnResize();
        }
    }
    glOnHide() {
        this.originalComponent.instance.then((cr) => {
            if (implementsGlOnHide(cr.instance)) {
                cr.instance.glOnHide();
            }
        });
    }
    glOnShow() {
        this.originalComponent.instance.then((cr) => {
            if (implementsGlOnShow(cr.instance)) {
                cr.instance.glOnShow();
            }
        });
    }
    glOnResize() {
        this.originalComponent.instance.then((cr) => {
            if (implementsGlOnResize(cr.instance)) {
                cr.instance.glOnResize();
            }
        });
    }
    glOnTab(tab) {
        this.originalComponent.instance.then((cr) => {
            if (implementsGlOnTab(cr.instance)) {
                debugger;
                cr.instance.glOnTab(this.originalComponent.tab);
            }
        });
    }
}
WrapperComponent.decorators = [
    { type: Component, args: [{
                selector: 'gl-wrapper',
                encapsulation: ViewEncapsulation.None,
                template: `<div class="wrapper"></div>`
            },] }
];
WrapperComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [GoldenLayoutComponentHost,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [GoldenLayoutContainer,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [GoldenLayoutComponentState,] }] }
];

class ComponentRegistryService {
    constructor(initialComponents, pluginRegistry) {
        var _a;
        this.pluginRegistry = pluginRegistry;
        this.components = new Map();
        this.awaitedComponents = new Map();
        (initialComponents || []).forEach(c => this.registerComponent(c));
        this.registerComponent({
            name: 'gl-wrapper',
            type: WrapperComponent,
        });
        (_a = this.pluginRegistry) === null || _a === void 0 ? void 0 : _a.pluginLoaded$.subscribe(({ id, module }) => {
            const registeredTokens = module.injector.get(GoldenLayoutComponents, []);
            console.log('Plugin', id, 'wants to register', registeredTokens.length, 'components');
            registeredTokens.forEach(c => this.registerComponent(Object.assign(Object.assign({}, c), { plugin: id })));
        });
    }
    registeredComponents() {
        return [...this.components.entries()].map((e) => ({ name: e[0], type: e[1] }));
    }
    // This is only for use by the GoldenLayoutComponent
    componentMap() {
        return this.components;
    }
    registerComponent(component) {
        const otherComponent = this.components.get(component.name);
        if (!!otherComponent && otherComponent !== component.type) {
            const err = new Error(`Failed to register component, ${component.name} is already taken by another component: ${otherComponent}`);
            throw err;
        }
        this.components.set(component.name, component.type);
        const d = this.awaitedComponents.get(component.name);
        if (d) {
            this.awaitedComponents.delete(component.name);
            d.resolve(component.type);
        }
    }
    waitForComponent(component) {
        const c = this.components.get(component);
        if (c) {
            return Promise.resolve(c);
        }
        let d = this.awaitedComponents.get(component);
        if (!d) {
            d = new Deferred();
            this.awaitedComponents.set(component, d);
        }
        return d.promise;
    }
}
ComponentRegistryService.decorators = [
    { type: Injectable }
];
ComponentRegistryService.ctorParameters = () => [
    { type: Array, decorators: [{ type: Inject, args: [GoldenLayoutComponents,] }, { type: Optional }] },
    { type: PluginRegistryService, decorators: [{ type: Optional }] }
];

/**
 * Inject an angular component using this token to indicate
 * that the component should be rendered when there is an error rendering
 * the actual component.
 * Errors could be exceptions thrown at construction time or a not-registered component.
 */
const FallbackComponent = new InjectionToken("fallback component");
/**
 * This token is injected into the FallbackComponent when it is instantiated and contains
 * the name of the component that failed to initialize.
 */
const FailedComponent = new InjectionToken("failed component");

class RootWindowService {
    constructor() { }
    isChildWindow() {
        try {
            return !!window.opener && !!window.opener.location.href;
        }
        catch (e) {
            return false;
        }
    }
    getRootWindow() {
        return this.isChildWindow() ? window.opener : window;
    }
}
RootWindowService.decorators = [
    { type: Injectable }
];
RootWindowService.ctorParameters = () => [];

class MockWindowSynchronizerService {
    restoreAppRefTick() { }
    onUnload() { }
}
MockWindowSynchronizerService.decorators = [
    { type: Injectable }
];
class WindowSynchronizerService {
    constructor(appref, rootService, injector) {
        this.appref = appref;
        this.rootService = rootService;
        this.injector = injector;
        this.unloaded = false;
        this.topWindow = this.rootService.getRootWindow();
        this.isChildWindow = this.rootService.isChildWindow();
        if (this.isChildWindow) {
            window.document.title = window.document.URL;
            console.__log = console.log;
            console.log = (...args) => this.topWindow.console.log('[CHILD] =>', ...args);
        }
        // Multi-Window compatibility.
        // We need to synchronize all appRefs that could tick
        // Store them in a global array and also overwrite the injector using the injector from the main window.
        let anyWin = this.topWindow;
        if (!this.isChildWindow) {
            anyWin.__apprefs = [];
            anyWin.__injector = this.injector;
        }
        // attach the application reference to the root window, save the original 'tick' method
        anyWin.__apprefs.push(this.appref);
        this.appref.__tick = this.appref.tick;
        // Overwrite the tick method running all apprefs in their zones.
        this.appref.tick = () => {
            for (const ar of this.topWindow.__apprefs) {
                ar._zone.run(() => ar.__tick());
            }
        };
    }
    restoreAppRefTick() {
        this.appref.tick = this.appref.__tick;
    }
    onUnload() {
        if (this.unloaded) {
            return;
        }
        this.unloaded = true;
        if (this.isChildWindow) {
            const index = this.topWindow.__apprefs.indexOf(this.appref);
            if (index >= 0) {
                this.topWindow.__apprefs.splice(index, 1);
            }
        }
    }
}
WindowSynchronizerService.decorators = [
    { type: Injectable }
];
WindowSynchronizerService.ctorParameters = () => [
    { type: ApplicationRef },
    { type: RootWindowService },
    { type: Injector }
];

// We need to wrap some golden layout internals, so we can intercept close and 'close stack'
// For close, the tab is wrapped and the close element to change the event handler to close the correct container.
const lm = GoldenLayout;
const isCloned = (contentItem) => contentItem.isComponent &&
    contentItem.config &&
    contentItem.config.componentState &&
    contentItem.config.componentState.originalId;
const ɵ0 = isCloned;
const GetComponentFromLayoutManager = (lm, id) => {
    const itemList = lm.root.getItemsById(id);
    if (itemList.length !== 1) {
        console.warn('non unique ID found: ' + id);
        return undefined;
    }
    return itemList[0];
};
const originalComponent = (contentItem) => {
    const comp = GetComponentFromLayoutManager(contentItem.layoutManager, contentItem.config.componentState.originalId);
    if (!comp.isComponent) {
        throw new Error('Expected component');
    }
    return comp;
};
const ɵ1 = originalComponent;
const tabFromId = (contentItem) => {
    const ci = originalComponent(contentItem);
    return ci ? ci.tab : undefined;
};
const ɵ2 = tabFromId;
// This code wraps the original golden-layout Tab
// A tab is instantiated by the golden-layout Header
// We rebind the close event listener to properly dispose the angular item container
// In order to destroy the angular component ref and be able to defer the close.
const originalTab = lm.__lm.controls.Tab;
const newTab = function (header, tabContentItem) {
    const tab = new originalTab(header, tabContentItem);
    /**
     * This piece of code implements close functionality for the tab close.
     * If we have a cloned tab, i.e. one which is contained in a maximised dummy stack
     * we close the container backing the tab.
     */
    tab.closeElement.off('click touchstart');
    tab.closeElement.on('click touchstart', (ev) => {
        ev.stopPropagation();
        if (isCloned(tab.contentItem)) {
            const c = originalComponent(tab.contentItem);
            if (c && c.isComponent) {
                // If we have a dummy tab, close the actual tab behind it.
                c.container.close();
            }
        }
        else {
            // Otherwise close our own tab.
            tab.contentItem.container.close();
        }
    });
    /**
     * This script emits a tabActivated event for the correct content item
     * when running in a maximised dummy stack.
     */
    tab.element.on('mousedown touchstart', ev => {
        let contentItem = tab.contentItem;
        if (isCloned(contentItem)) {
            contentItem = originalComponent(tab.contentItem);
        }
        contentItem.layoutManager.emit('tabActivated', contentItem);
    });
    if (isCloned(tab.contentItem) && tab._layoutManager.config.settings.reorderEnabled === true) {
        // Reimplement tab drag start by redirecting the tab state.
        tab.element.on('mousedown touchstart', (ev) => {
            const originalTab = tabFromId(tab.contentItem);
            if (originalTab && originalTab._dragListener) {
                const dl = originalTab._dragListener;
                const destroyDummy = () => {
                    dl.off('dragStart', destroyDummy, dl);
                    if (header.layoutManager._maximisedItem === tab.contentItem.parent) {
                        tab.contentItem.parent.toggleMaximise();
                    }
                };
                dl.off('dragStart', originalTab._onDragStart, originalTab);
                dl.on('dragStart', destroyDummy, dl);
                dl.on('dragStart', originalTab._onDragStart, originalTab);
                dl._fDown(ev);
            }
        });
    }
    return tab;
};
const ɵ3 = newTab;
newTab._template = '<li class="lm_tab"><i class="lm_left"></i>' +
    '<span class="lm_title"></span><div class="lm_close_tab"></div>' +
    '<i class="lm_right"></i></li>';
lm.__lm.controls.Tab = newTab;
// Header is wrapped to catch the maximise and close buttons.
const originalHeader = lm.__lm.controls.Header;
const newHeader = function (layoutManager, parent) {
    const maximise = parent._header['maximise'];
    const popout = parent._header['popout'];
    if (maximise && layoutManager.config.settings.maximiseAllItems === true) {
        // Check whether we should maximise all stacks and if so, force the header to
        // not generate a maximise button.
        delete parent._header['maximise'];
    }
    if (popout && layoutManager.config.settings.maximiseAllItems === true) {
        delete parent._header['popout'];
    }
    // Generate the original header
    const header = new originalHeader(layoutManager, parent);
    // Check whether we should maximise all stacks, and if so, generate a custom popout button
    // but keep the order with the maximise and close button
    if (popout && layoutManager.config.settings.maximiseAllItems === true) {
        header.popoutButton = new lm.__lm.controls.HeaderButton(header, popout, 'lm_popout', () => {
            let contentItem = header.activeContentItem;
            if (isCloned(contentItem)) {
                // We are within the dummy stack, our component is a wrapper component
                // and has a reference to the original (= wrapped) component.
                // Therefore, popping out the whole stack would be stupid, because it wouldn't leave
                // any item in this window.
                contentItem = originalComponent(contentItem);
                contentItem.popout();
            }
            else if (layoutManager.config.settings.popoutWholeStack === true) {
                // We have a regular stack, so honor the popoutWholeStack setting.
                header.parent.popout();
            }
            else {
                contentItem.popout();
            }
        });
    }
    // Check whether we should maximise all stacks, and if so, generate a custom maximise button
    // but keep the order with the close button.
    if (maximise && layoutManager.config.settings.maximiseAllItems === true) {
        header.maximiseButton = new lm.__lm.controls.HeaderButton(header, maximise, 'lm_maximise', () => {
            // The maximise button was clicked, so create a dummy stack, containing a wrapper component for each opened component.
            if (layoutManager._maximisedItem === parent) {
                parent.toggleMaximise();
            }
            else {
                layoutManager.generateAndMaximiseDummyStack(parent);
            }
        });
    }
    if (header.closeButton) {
        header.closeButton._$destroy();
        const label = header._getHeaderSetting('close');
        header.closeButton = new lm.__lm.controls.HeaderButton(header, label, 'lm_close', () => {
            header.parent.contentItems.forEach(ci => {
                ci.container.close();
            });
        });
    }
    return header;
};
const ɵ4 = newHeader;
newHeader._template = [
    '<div class="lm_header">',
    '<ul class="lm_tabs"></ul>',
    '<ul class="lm_controls"></ul>',
    '<ul class="lm_tabdropdown_list"></ul>',
    '</div>'
].join('');
lm.__lm.controls.Header = newHeader;
// Patch the drag proxy in order to have an itemDragged event.
const origDragProxy = lm.__lm.controls.DragProxy;
const dragProxy = function (x, y, dragListener, layoutManager, contentItem, originalParent) {
    layoutManager.emit('itemDragged', contentItem);
    return new origDragProxy(x, y, dragListener, layoutManager, contentItem, originalParent);
};
const ɵ5 = dragProxy;
dragProxy._template = origDragProxy._template;
lm.__lm.controls.DragProxy = dragProxy;
// Patch the stack in order to have an activeContentItemChanged$ observable
const origStack = lm.__lm.items.Stack;
function MyStack(lm, config, parent) {
    origStack.call(this, lm, config, parent);
    this.activeContentItem$ = new BehaviorSubject(null);
    const callback = (ci) => {
        if (this.activeContentItem$) {
            this.activeContentItem$.next(ci);
        }
        ;
    };
    this.on('activeContentItemChanged', callback);
    const origDestroy = this._$destroy;
    this.___destroyed = false;
    this._$destroy = () => {
        if (this.___destroyed) {
            return;
        }
        this.___destroyed = true;
        this.off('activeContentItemChanged', callback);
        this.activeContentItem$.complete();
        this.activeContentItem$ = null;
        origDestroy.call(this);
    };
    return this;
}
MyStack.prototype = Object.create(origStack.prototype);
// Force stacks to be flattened.
MyStack.prototype['addChild'] = function (contentItem, index) {
    if (contentItem.type === 'stack') {
        // We try to pop in a stack into another stack (i.e. nested tab controls.)
        // This breaks the other stuff in custom header components, therefore it's not recommended.
        // So we add the items directly into this stack.
        (contentItem.content || []).forEach((ci, idx) => origStack.prototype.addChild.call(this, ci, index + idx));
        if (contentItem.content.length) {
            this.setActiveContentItem(this.contentItems[index + contentItem.activeItemIndex]);
        }
    }
    else {
        origStack.prototype.addChild.call(this, contentItem, index);
    }
};
MyStack.prototype['setSize'] = function () {
    if (this.layoutManager._maximisedItem === this && this.layoutManager.config.settings.maximiseAllItems === true) {
        // Actually enforce that this item will be the correct size
        this.element.width(this.layoutManager.container.width());
        this.element.height(this.layoutManager.container.height());
    }
    origStack.prototype.setSize.call(this);
};
lm.__lm.items.Stack = MyStack;
const origPopout = lm.__lm.controls.BrowserPopout;
const popout = function (config, dimensions, parent, index, lm) {
    if (config.length !== 1) {
        console.warn('This should not happen, permitting', config);
    }
    else {
        if (config[0].type === 'component') {
            config = [{
                    type: 'stack',
                    title: config[0].title,
                    content: [config[0]],
                }];
        }
    }
    return new origPopout(config, dimensions, parent, index, lm);
};
const ɵ6 = popout;
lm.__lm.controls.BrowserPopout = popout;
// Fixup for nested golden-layout instances.
// nested instances should be able to be docked out completely
// but the golden layout will recognize its query string and be incorrectly nested.
const getQueryStringParam = lm.__lm.utils.getQueryStringParam;
let firstQueryString = true;
lm.__lm.utils.getQueryStringParam = (param) => {
    if (firstQueryString) {
        firstQueryString = false;
        return getQueryStringParam(param);
    }
    return null;
};
class GoldenLayoutComponent {
    constructor(rootService, componentRegistry, viewContainer, componentFactoryResolver, ngZone, injector, windowSync, parentGoldenLayout, fallbackComponent) {
        this.rootService = rootService;
        this.componentRegistry = componentRegistry;
        this.viewContainer = viewContainer;
        this.componentFactoryResolver = componentFactoryResolver;
        this.ngZone = ngZone;
        this.injector = injector;
        this.windowSync = windowSync;
        this.parentGoldenLayout = parentGoldenLayout;
        this.fallbackComponent = fallbackComponent;
        this.stateChanged = new EventEmitter();
        this.tabActivated = new EventEmitter();
        this.goldenLayout = null;
        this.onUnloaded = new Deferred();
        this.stateChangePaused = false;
        this.stateChangeScheduled = false;
        this.tabsList = new BehaviorSubject({});
        this.pushStateChange = () => {
            // For each state change, we want to refresh the list of the opened components. At the moment, we only care about the keys.
            this.tabsList.next(this.goldenLayout._getAllComponents());
            if (this.stateChangePaused || this.stateChangeScheduled) {
                return;
            }
            this.stateChangeScheduled = true;
            window.requestAnimationFrame(() => {
                this.stateChangeScheduled = false;
                this.stateChanged.emit();
            });
        };
        this.resumeStateChange = () => this.stateChangePaused = false;
        this.pauseStateChange = () => this.stateChangePaused = true;
        this.pushTabActivated = (ci) => {
            this.tabActivated.emit(ci);
        };
        this.fallbackType = null;
        this.openedComponents = [];
        this.poppedIn = false;
        this._eventEmitter = new lm.__lm.utils.EventEmitter();
        console.log(parentGoldenLayout);
        if (!!this.fallbackComponent) {
            this.fallbackType = this.buildConstructor(this.fallbackComponent);
        }
        if (isDevMode())
            console.log(`Create@${this.rootService.isChildWindow ? 'child' : 'root'}!`);
    }
    onResize() {
        if (this.goldenLayout) {
            this.goldenLayout.updateSize();
        }
    }
    ngOnInit() {
        if (isDevMode())
            console.log(`Init@${this.rootService.isChildWindow ? 'child' : 'root'}!`);
        this.layoutSubscription = this.layout.subscribe(layout => {
            this.destroyGoldenLayout();
            this.initializeGoldenLayout(layout);
        });
    }
    // Map beforeunload to onDestroy to simplify the handling
    beforeUnload() {
        if (this.poppedIn) {
            this.onUnloaded.promise.then(() => this.ngOnDestroy());
            this.onUnloaded.resolve();
            this.windowSync.onUnload();
        }
    }
    // Map beforeunload to onDestroy to simplify the handling
    pageHide() {
        if (!this.poppedIn) {
            this.openedComponents.forEach(c => {
                if (implementsGlOnUnload(c)) {
                    c.glOnUnload();
                }
            });
        }
        this.onUnloaded.promise.then(() => this.ngOnDestroy());
        this.onUnloaded.resolve();
        this.windowSync.onUnload();
    }
    ngOnDestroy() {
        if (isDevMode()) {
            console.log(`Destroy@${this.rootService.isChildWindow ? 'child' : 'root'}!`);
        }
        this.layoutSubscription.unsubscribe();
        // restore the original tick method.
        // this appens in two cases:
        // either the window is closed, after that it's not important to restore the tick method
        // or within the root window, where we HAVE to restore the original tick method
        this.windowSync.restoreAppRefTick();
        this.destroyGoldenLayout();
        // Discard all previously made subscriptions.
        this._eventEmitter._mSubscriptions = { [lm.__lm.utils.EventEmitter.ALL_EVENT]: [] };
    }
    getGoldenLayoutInstance() {
        if (!this.goldenLayout) {
            throw new Error('Component is not initialized yet');
        }
        return this.goldenLayout;
    }
    addEvent(kind, callback, context) {
        this._eventEmitter.on(kind, callback, context);
    }
    getSerializableState() {
        if (this.goldenLayout) {
            const configObj = this.goldenLayout.toConfig();
            const wrapperMax = this.goldenLayout.__wrapperMaximisedItemId;
            if (wrapperMax) {
                configObj.maximisedItemId = wrapperMax;
                const filterContent = (ci) => {
                    if (ci.type === 'stack' && ci.isDummy) {
                        return false;
                    }
                    if (ci.type !== 'component') {
                        ci.content = ci.content.filter(filterContent);
                    }
                    return true;
                };
                configObj.content = configObj.content.filter(filterContent);
            }
            return configObj;
        }
        return null;
    }
    getComponents() {
        return this.goldenLayout._getAllComponents();
    }
    closeComponent(component) {
        const c = GetComponentFromLayoutManager(this.goldenLayout, component);
        if (!c) {
            return;
        }
        c.remove();
    }
    focusComponent(component) {
        const c = GetComponentFromLayoutManager(this.goldenLayout, component);
        if (!c) {
            return;
        }
        c.parent.setActiveContentItem(c);
    }
    createNewComponent(config, componentToDock) {
        if (!this.goldenLayout) {
            throw new Error("golden layout is not initialized");
        }
        let myConfig = config;
        const root = this.goldenLayout.root;
        let element = null;
        if (componentToDock) {
            const c = GetComponentFromLayoutManager(this.goldenLayout, componentToDock);
            if (c.parent.isStack) {
                element = c.parent;
            }
            else {
                const stack = this.goldenLayout.createContentItem({
                    type: 'stack',
                    width: c.parent.config.width,
                    height: c.parent.config.height,
                    content: [],
                });
                c.parent.replaceChild(c, stack, false);
                stack.addChild(c);
                element = stack;
            }
        }
        else {
            if (!root.contentItems || root.contentItems.length === 0) {
                element = root;
                // Ensure there is a stack when closing ALL items and creating a new item.
                myConfig = {
                    type: 'stack',
                    content: [Object.assign(Object.assign({}, myConfig), { type: 'component' })],
                };
            }
            else {
                element = this.findStack(root.contentItems);
            }
        }
        if (element === null) {
            throw new Error("this should never happen!");
        }
        const content = this.goldenLayout.createContentItem(myConfig);
        element.addChild(content);
        if (content.isComponent) {
            // Usually
            return content.instance;
        }
        else if (content.isStack && content.contentItems.length === 1) {
            return content.contentItems[0].instance; // The case when this is the first component.
        }
        else {
            return content;
        }
    }
    findStack(contentItems) {
        if (!contentItems) {
            return null;
        }
        for (const x of contentItems) {
            if (x.isStack) {
                if (x.config.isDummy) {
                    continue;
                }
                return x;
            }
            const s = this.findStack(x.contentItems);
            if (s !== null) {
                return s;
            }
        }
    }
    destroyGoldenLayout() {
        if (!this.goldenLayout) {
            return;
        }
        this.goldenLayout.off('stateChanged', this.pushStateChange);
        this.goldenLayout.off('itemDropped', this.resumeStateChange);
        this.goldenLayout.off('itemDragged', this.pauseStateChange);
        this.goldenLayout.off('tabActivated', this.pushTabActivated);
        this.goldenLayout.off('initialised');
        this.goldenLayout.off(lm.__lm.utils.EventEmitter.ALL_EVENT, this._eventEmitter.emit, this._eventEmitter);
        this.goldenLayout.destroy();
        this.goldenLayout = null;
    }
    initializeGoldenLayout(layout) {
        this.goldenLayout = new GoldenLayout(layout, $(this.el.nativeElement));
        const origPopout = this.goldenLayout.createPopout.bind(this.goldenLayout);
        this.goldenLayout.createPopout = (item, dim, parent, index) => {
            /**
             * Traverse the component tree below the item we're trying to pop out.
             * This has basically two cases:
             * a) we have a component to popout (or end up at a component somewhen)
             *    for components, contentItems is either undefined or empty, so ignore it
             *    during the children push.
             *    however, for components, we need to check for glOnPopout and call it.
             * b) everything else, where contentItems is a non-empty array.
             *    For these parts, we need to consider all children recursively.
             *
             * Here, an iterative algorithm was chosen.
             */
            const rec = [item];
            while (rec.length) {
                const itemToProcess = rec.shift();
                if (itemToProcess.contentItems && itemToProcess.contentItems.length > 0) {
                    rec.push(...itemToProcess.contentItems);
                }
                if (itemToProcess.isComponent) {
                    const component = itemToProcess.container.__ngComponent;
                    if (component && implementsGlOnPopout(component)) {
                        component.glOnPopout();
                    }
                }
            }
            return origPopout(item, dim, parent, index);
        };
        /**
         * buildComponentMap creates an object of all opened components below the given item.
         * object keys are component IDs, object values the component with the ID.
         */
        const buildComponentMap = (item) => {
            let ret = {};
            for (const ci of item.contentItems) {
                if (ci.isComponent) {
                    if (ci.config && ci.config.componentState && ci.config.componentState.originalId) {
                        // Skip the dummy components
                        continue;
                    }
                    ret[ci.id] = ci;
                }
                else {
                    ret = Object.assign(Object.assign({}, ret), buildComponentMap(ci));
                }
            }
            return ret;
        };
        this.goldenLayout._getAllComponents = () => buildComponentMap(this.goldenLayout.root);
        this.goldenLayout.generateAndMaximiseDummyStack = (parent, item) => {
            /**
             * This function creates a dummy stack, which is being used if 'maximiseAllItems' is true.
             * The dummy stack contains a dummy component for each component opened in the real layout.
             * It will furthermore track component closes/spawns and create/close the dummy components accordingly.
             * parent is the parent of the item we want to maximise
             * item is the item which was active when we wanted to maximise it.
             * required to set the active item index.
             */
            const openedComponents = buildComponentMap(this.goldenLayout.root);
            const componentIdList = Object.keys(openedComponents);
            if (componentIdList.length === 0) {
                return; // How did we get here?!
            }
            // We only have a single child, so we restore the original behavior
            const rootContentItem = this.goldenLayout.root.contentItems[0];
            if (rootContentItem.isStack) {
                rootContentItem.toggleMaximise();
                return;
            }
            /**
             * At this point, there are at least two children, so use the dummy component.
             */
            const config = {
                type: 'stack',
                content: componentIdList.map(k => ({
                    type: 'component',
                    componentName: 'gl-wrapper',
                    title: openedComponents[k].config.title,
                    reorderEnabled: false,
                    componentState: {
                        originalId: k,
                    },
                })),
                isClosable: false,
                isDummy: true,
                state: 'dummy',
                activeItemIndex: componentIdList.findIndex(j => j === (item || parent._activeContentItem.id)),
            };
            // add this item as first child ever, causing golden-layout to create a stack object
            rootContentItem.addChild(config, 0);
            // Fetch the stack
            const myStack = rootContentItem.contentItems[0];
            // Setup an __wrapperMaximisedItemId in order to setActiveContentItem on the underlying stack later.
            this.goldenLayout.__wrapperMaximisedItemId = parent._activeContentItem.id;
            myStack.activeContentItem$.subscribe((ci) => {
                // Setup the __wrapperMaximisedItemId lateron.
                this.goldenLayout.__wrapperMaximisedItemId = ci.config.componentState.originalId;
            });
            const teardown$ = new Subject();
            myStack.on('minimised', () => {
                // Dummy stack was minimised, so enforce all dummy components to be disposed
                // and dispose the dummy stack as well.
                this.goldenLayout.__wrapperMaximisedItemId = null;
                teardown$.next();
                teardown$.complete();
                myStack.remove();
            });
            // Maximise the dummy stack.
            myStack.toggleMaximise();
            // Whenever a tab is being created or closed, perform a diff algorithm
            // on the active tabs list and create or delete the dummy tabs.
            this.tabsList.pipe(takeUntil(teardown$), distinctUntilChanged((a, b) => {
                const keysA = Object.keys(a);
                const keysB = new Set(Object.keys(b));
                return keysA.length === keysB.size && keysA.every(key => keysB.has(key));
            })).subscribe(targetState => {
                const workingCopy = Object.assign({}, targetState);
                const tabs = new Set(Object.keys(workingCopy));
                // currently opened tabs
                const openedTabs = new Set(myStack.contentItems.map(ci => {
                    return ci.config.componentState.originalId;
                }));
                for (const key of tabs) {
                    if (openedTabs.has(key)) {
                        // item is both currently opened in dummy and background, nothing to do
                        openedTabs.delete(key);
                    }
                    else {
                        // item is not opened in dummy, create a component
                        myStack.addChild({
                            type: 'component',
                            componentName: 'gl-wrapper',
                            title: targetState[key].config.title,
                            reorderEnabled: false,
                            componentState: {
                                originalId: key,
                            },
                        });
                    }
                }
                // The remaining tabs are opened in the dummy but not in the background, so close the dummy.
                for (const tab of openedTabs) {
                    const tabObj = myStack.contentItems.find(j => j.config.componentState.originalId === tab);
                    tabObj.remove();
                }
            });
        };
        this.goldenLayout.on('popIn', () => {
            this.poppedIn = true;
            this.openedComponents.forEach(c => {
                if (implementsGlOnPopin(c)) {
                    c.glOnPopin();
                }
            });
        });
        // Overwrite the 'getComponent' method to dynamically resolve JS components.
        // We need to do this, because the component map is not flexible enough for us since we can dynamically chainload plugins.
        this.goldenLayout.getComponent = (type) => {
            if (isDevMode()) {
                console.log(`Resolving component ${type}`);
            }
            return this.buildConstructor(type);
        };
        this.goldenLayout.on('stackCreated', (stack) => {
            const customHeaderElement = document.createElement('li');
            customHeaderElement.classList.add('custom-header');
            customHeaderElement.style.display = 'none';
            const ctr = stack.header.controlsContainer[0];
            let element = null;
            ctr.prepend(customHeaderElement);
            const disposeControl = () => {
                customHeaderElement.style.display = 'none';
                if (element) {
                    customHeaderElement.childNodes.forEach(e => customHeaderElement.removeChild(e));
                    element.destroy();
                    element = null;
                    stack.header._updateTabSizes();
                }
            };
            const bootstrapComponent = (ct, tokens, injector) => {
                if (element) {
                    disposeControl();
                }
                customHeaderElement.style.display = '';
                const factory = this.componentFactoryResolver.resolveComponentFactory(ct);
                const headerInjector = Injector.create(tokens, injector);
                element = this.viewContainer.createComponent(factory, undefined, headerInjector);
                customHeaderElement.prepend(element.location.nativeElement);
                stack.header._updateTabSizes();
            };
            // Wait until the content item is loaded and done
            stack.activeContentItem$.pipe(switchMap((contentItem) => {
                if (!contentItem || !contentItem.isComponent) {
                    return of(null);
                }
                return contentItem.instance || of(null);
            }), switchMap((cr) => {
                if (!cr) {
                    return Promise.all([null, null, null]);
                }
                const inst = cr.instance.headerComponent;
                const tokens = cr.instance.additionalTokens;
                return Promise.all([
                    Promise.resolve(inst),
                    Promise.resolve(tokens),
                    Promise.resolve(cr)
                ]);
            })).subscribe(([header, tokens, componentRef]) => {
                // This is the currently visible content item, after it's loaded.
                // Therefore, we can check whether (and what) to render as header component here.
                if (!header || !componentRef) {
                    disposeControl();
                }
                else {
                    bootstrapComponent(header, tokens || [], componentRef.injector);
                }
            }, disposeControl, disposeControl);
        });
        // Initialize the layout.
        this.goldenLayout.on('initialised', () => {
            window.requestAnimationFrame(() => {
                if (layout.maximisedItemId) {
                    const c = GetComponentFromLayoutManager(this.goldenLayout, layout.maximisedItemId);
                    if (c) {
                        this.goldenLayout.generateAndMaximiseDummyStack(c.parent, layout.maximisedItemId);
                    }
                }
            });
        });
        this.goldenLayout.init();
        this.goldenLayout.on('stateChanged', this.pushStateChange);
        this.goldenLayout.on('itemDragged', this.pauseStateChange);
        this.goldenLayout.on('itemDropped', this.resumeStateChange);
        this.goldenLayout.on('tabActivated', this.pushTabActivated);
        this.goldenLayout.on(lm.__lm.utils.EventEmitter.ALL_EVENT, this._eventEmitter.emit, this._eventEmitter);
        this._eventEmitter.emit('initialised');
    }
    /**
     * Build a 'virtual' constructor which is used to pass the components to goldenLayout
     * @param componentType
     */
    buildConstructor(componentName) {
        // Can't use an ES6 lambda here, since it is not a constructor
        const self = this;
        return function (container, componentState) {
            const glComponent = container.parent;
            if (glComponent.config.id) {
                glComponent.id = glComponent.config.id;
            }
            else {
                glComponent.id = uuid();
                glComponent.config.id = glComponent.id;
            }
            const d = new Deferred();
            self.ngZone.run(() => {
                // Wait until the component registry can provide a type for the component
                // TBD: Maybe add a timeout here?
                const componentPromise = self.componentRegistry.waitForComponent(componentName);
                componentPromise.then((componentType) => {
                    // We got our component type
                    if (isDevMode()) {
                        console.log(`Component ${componentName} returned from componentRegistry`);
                    }
                    // Create an instance of the angular component.
                    const factory = self.componentFactoryResolver.resolveComponentFactory(componentType);
                    let failedComponent = null;
                    if (componentType === self.fallbackComponent) {
                        // Failed to find the component constructor **AND** we have a fallback component defined,
                        // so lookup the failed component's name and inject it into the fallback component.
                        failedComponent = container._config.componentName;
                    }
                    const injector = self._createComponentInjector(container, componentState, failedComponent);
                    const componentRef = self.viewContainer.createComponent(factory, undefined, injector);
                    // Bind the new component to container's client DOM element.
                    container.getElement().append($(componentRef.location.nativeElement));
                    self._bindEventHooks(container, componentRef.instance);
                    container.__ngComponent = componentRef.instance;
                    self.openedComponents.push(componentRef.instance);
                    let destroyed = false;
                    const destroyFn = () => {
                        if (!destroyed) {
                            destroyed = true;
                            self.openedComponents = self.openedComponents.filter(i => i !== componentRef.instance);
                            $(componentRef.location.nativeElement).remove();
                            componentRef.destroy();
                        }
                    };
                    // Listen to containerDestroy and window beforeunload, preventing a double-destroy
                    container.on('destroy', destroyFn);
                    self.onUnloaded.promise.then(destroyFn);
                    d.resolve(componentRef);
                });
            });
            return d.promise;
        };
    }
    /**
     * Creates an injector capable of injecting the GoldenLayout object,
     * component container, and initial component state.
     */
    _createComponentInjector(container, componentState, failed) {
        const providers = [
            {
                provide: GoldenLayoutContainer,
                useValue: container,
            },
            {
                provide: GoldenLayoutComponentState,
                useValue: componentState,
            },
            {
                provide: GoldenLayoutEventHub,
                useValue: this.goldenLayout.eventHub,
            },
            {
                provide: GoldenLayoutComponentHost,
                useValue: this,
            }
        ];
        if (!!failed) {
            providers.push({
                provide: FailedComponent,
                useValue: failed,
            });
        }
        return Injector.create(providers, this.injector);
    }
    /**
     * Registers an event handler for each implemented hook.
     * @param container Golden Layout component container.
     * @param component Angular component instance.
     */
    _bindEventHooks(container, component) {
        if (implementsGlOnResize(component)) {
            container.on('resize', () => {
                component.glOnResize();
            });
        }
        if (implementsGlOnShow(component)) {
            container.on('show', () => {
                component.glOnShow();
            });
        }
        if (implementsGlOnHide(component)) {
            container.on('hide', () => {
                component.glOnHide();
            });
        }
        if (implementsGlOnTab(component)) {
            container.on('tab', (tab) => {
                component.glOnTab(tab);
            });
        }
        if (implementsGlOnClose(component)) {
            const containerClose = container.close.bind(container);
            container.close = () => {
                if (!container._config.isClosable) {
                    return false;
                }
                component.glOnClose().then(() => {
                    containerClose();
                }, () => { });
            };
        }
    }
}
GoldenLayoutComponent.decorators = [
    { type: Component, args: [{
                selector: 'golden-layout-root',
                template: `<div class="ng-golden-layout-root" #glroot></div>`,
                styles: [`
    .ng-golden-layout-root {
      width:100%;
      height:100%;
    }`]
            },] }
];
GoldenLayoutComponent.ctorParameters = () => [
    { type: RootWindowService },
    { type: ComponentRegistryService },
    { type: ViewContainerRef },
    { type: ComponentFactoryResolver },
    { type: NgZone },
    { type: Injector },
    { type: WindowSynchronizerService },
    { type: GoldenLayoutComponent, decorators: [{ type: Optional }, { type: SkipSelf }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [FallbackComponent,] }] }
];
GoldenLayoutComponent.propDecorators = {
    layout: [{ type: Input }],
    stateChanged: [{ type: Output }],
    tabActivated: [{ type: Output }],
    el: [{ type: ViewChild, args: ['glroot', { static: true },] }],
    onResize: [{ type: HostListener, args: ['window:resize',] }],
    beforeUnload: [{ type: HostListener, args: ['window:beforeunload',] }],
    pageHide: [{ type: HostListener, args: ['window:pagehide',] }]
};

class GoldenLayoutModule {
    static forRoot(types, fallback, pluginDeps) {
        return {
            ngModule: GoldenLayoutModule,
            providers: [
                ComponentRegistryService,
                RootWindowService,
                PluginRegistryService,
                PluginURLProvider,
                WindowSynchronizerService,
                { provide: GoldenLayoutComponents, useValue: types, },
                { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: [types, fallback, WrapperComponent], multi: true },
                { provide: GoldenLayoutPluginDependency, useValue: pluginDeps },
                { provide: FallbackComponent, useValue: fallback },
            ],
        };
    }
    static forChild(types, fallback) {
        return [
            ComponentRegistryService,
            { provide: PluginRegistryService, useClass: MockPluginRegistryService },
            { provide: WindowSynchronizerService, useClass: MockWindowSynchronizerService },
            { provide: PluginURLProvider, useValue: null },
            { provide: GoldenLayoutComponents, useValue: types, },
            { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: [types, fallback, WrapperComponent], multi: true },
            { provide: FallbackComponent, useValue: fallback },
        ];
    }
}
GoldenLayoutModule.decorators = [
    { type: NgModule, args: [{
                declarations: [GoldenLayoutComponent, WrapperComponent],
                exports: [GoldenLayoutComponent],
                imports: [CommonModule]
            },] }
];

/**
 * Generated bundle index. Do not edit.
 */

export { ComponentRegistryService, FailedComponent, FallbackComponent, GetComponentFromLayoutManager, GoldenLayoutComponent, GoldenLayoutComponentHost, GoldenLayoutComponentState, GoldenLayoutComponents, GoldenLayoutContainer, GoldenLayoutEventHub, GoldenLayoutModule, GoldenLayoutPluginDependency, MockPluginRegistryService, MultiWindowInit, MultiWindowService, PluginRegistryService, PluginURLProvider, RootWindowService, isChildWindow, ɵ0, ɵ1, ɵ2, ɵ3, ɵ4, ɵ5, ɵ6, MockWindowSynchronizerService as ɵa, WindowSynchronizerService as ɵb, WrapperComponent as ɵc };
//# sourceMappingURL=ngx-golden-layout.js.map
