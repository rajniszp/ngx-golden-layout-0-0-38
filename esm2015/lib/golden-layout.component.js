import { isDevMode, ComponentFactoryResolver, HostListener, ViewContainerRef, ElementRef, Component, Optional, Inject, NgZone, Injector, ViewChild, Input, Output, EventEmitter, SkipSelf, } from '@angular/core';
import * as GoldenLayout from 'golden-layout';
import { ComponentRegistryService } from './component-registry.service';
import { FallbackComponent, FailedComponent } from './fallback';
import { RootWindowService } from './root-window.service';
import { Observable, BehaviorSubject, of, Subject } from 'rxjs';
import { switchMap, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { implementsGlOnResize, implementsGlOnShow, implementsGlOnHide, implementsGlOnTab, implementsGlOnClose, implementsGlOnPopin, implementsGlOnUnload, implementsGlOnPopout, uuid, } from './type-guards';
import { Deferred } from './deferred';
import { WindowSynchronizerService } from './window-sync.service';
import { GoldenLayoutContainer, GoldenLayoutComponentState, GoldenLayoutEventHub, GoldenLayoutComponentHost } from './tokens';
// We need to wrap some golden layout internals, so we can intercept close and 'close stack'
// For close, the tab is wrapped and the close element to change the event handler to close the correct container.
const lm = GoldenLayout;
const isCloned = (contentItem) => contentItem.isComponent &&
    contentItem.config &&
    contentItem.config.componentState &&
    contentItem.config.componentState.originalId;
const ɵ0 = isCloned;
export const GetComponentFromLayoutManager = (lm, id) => {
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
export class GoldenLayoutComponent {
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
export { ɵ0, ɵ1, ɵ2, ɵ3, ɵ4, ɵ5, ɵ6 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLWxheW91dC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvbmd4LWdvbGRlbi1sYXlvdXQvc3JjLyIsInNvdXJjZXMiOlsibGliL2dvbGRlbi1sYXlvdXQuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1Qsd0JBQXdCLEVBQ3hCLFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsVUFBVSxFQUNWLFNBQVMsRUFJVCxRQUFRLEVBQ1IsTUFBTSxFQUNOLE1BQU0sRUFDTixRQUFRLEVBQ1IsU0FBUyxFQUNULEtBQUssRUFDTCxNQUFNLEVBQ04sWUFBWSxFQUlaLFFBQVEsR0FDVCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEtBQUssWUFBWSxNQUFNLGVBQWUsQ0FBQztBQUM5QyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUN4RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2hFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBRSxVQUFVLEVBQWdCLGVBQWUsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlFLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUUsT0FBTyxFQUNMLG9CQUFvQixFQUNwQixrQkFBa0IsRUFDbEIsa0JBQWtCLEVBQ2xCLGlCQUFpQixFQUNqQixtQkFBbUIsRUFDbkIsbUJBQW1CLEVBQ25CLG9CQUFvQixFQUNwQixvQkFBb0IsRUFDcEIsSUFBSSxHQUNMLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDdEMsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sdUJBQXVC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ckIsSUFBSSxDQUFFLFNBQWlCLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRTtvQkFDMUMsT0FBTyxLQUFLLENBQUM7aUJBQ2Q7Z0JBQ0QsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQzlCLGNBQWMsRUFBRSxDQUFDO2dCQUNuQixDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQW9ELENBQUMsQ0FBQyxDQUFDO1lBQ2pFLENBQUMsQ0FBQztTQUNIO0lBQ0gsQ0FBQzs7O1lBanBCRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLG9CQUFvQjtnQkFPOUIsUUFBUSxFQUFFLG1EQUFtRDt5QkFOcEQ7Ozs7TUFJTDthQUdMOzs7WUF2U1EsaUJBQWlCO1lBRmpCLHdCQUF3QjtZQXBCL0IsZ0JBQWdCO1lBRmhCLHdCQUF3QjtZQVV4QixNQUFNO1lBQ04sUUFBUTtZQTRCRCx5QkFBeUI7WUE4VXNCLHFCQUFxQix1QkFBeEUsUUFBUSxZQUFJLFFBQVE7NENBQ3BCLFFBQVEsWUFBSSxNQUFNLFNBQUMsaUJBQWlCOzs7cUJBcER0QyxLQUFLOzJCQUNMLE1BQU07MkJBQ04sTUFBTTtpQkFFTixTQUFTLFNBQUMsUUFBUSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTt1QkFnQ3BDLFlBQVksU0FBQyxlQUFlOzJCQW1DNUIsWUFBWSxTQUFDLHFCQUFxQjt1QkFVbEMsWUFBWSxTQUFDLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgaXNEZXZNb2RlLFxyXG4gIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcclxuICBIb3N0TGlzdGVuZXIsXHJcbiAgVmlld0NvbnRhaW5lclJlZixcclxuICBFbGVtZW50UmVmLFxyXG4gIENvbXBvbmVudCxcclxuICBPbkluaXQsXHJcbiAgT25EZXN0cm95LFxyXG4gIEFwcGxpY2F0aW9uUmVmLFxyXG4gIE9wdGlvbmFsLFxyXG4gIEluamVjdCxcclxuICBOZ1pvbmUsXHJcbiAgSW5qZWN0b3IsXHJcbiAgVmlld0NoaWxkLFxyXG4gIElucHV0LFxyXG4gIE91dHB1dCxcclxuICBFdmVudEVtaXR0ZXIsXHJcbiAgU3RhdGljUHJvdmlkZXIsXHJcbiAgVHlwZSxcclxuICBDb21wb25lbnRSZWYsXHJcbiAgU2tpcFNlbGYsXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCAqIGFzIEdvbGRlbkxheW91dCBmcm9tICdnb2xkZW4tbGF5b3V0JztcclxuaW1wb3J0IHsgQ29tcG9uZW50UmVnaXN0cnlTZXJ2aWNlIH0gZnJvbSAnLi9jb21wb25lbnQtcmVnaXN0cnkuc2VydmljZSc7XHJcbmltcG9ydCB7IEZhbGxiYWNrQ29tcG9uZW50LCBGYWlsZWRDb21wb25lbnQgfSBmcm9tICcuL2ZhbGxiYWNrJztcclxuaW1wb3J0IHsgUm9vdFdpbmRvd1NlcnZpY2UgfSBmcm9tICcuL3Jvb3Qtd2luZG93LnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJzY3JpcHRpb24sIEJlaGF2aW9yU3ViamVjdCwgb2YsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgc3dpdGNoTWFwLCB0YWtlVW50aWwsIGRpc3RpbmN0VW50aWxDaGFuZ2VkIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQge1xyXG4gIGltcGxlbWVudHNHbE9uUmVzaXplLFxyXG4gIGltcGxlbWVudHNHbE9uU2hvdyxcclxuICBpbXBsZW1lbnRzR2xPbkhpZGUsXHJcbiAgaW1wbGVtZW50c0dsT25UYWIsXHJcbiAgaW1wbGVtZW50c0dsT25DbG9zZSxcclxuICBpbXBsZW1lbnRzR2xPblBvcGluLFxyXG4gIGltcGxlbWVudHNHbE9uVW5sb2FkLFxyXG4gIGltcGxlbWVudHNHbE9uUG9wb3V0LFxyXG4gIHV1aWQsXHJcbn0gZnJvbSAnLi90eXBlLWd1YXJkcyc7XHJcbmltcG9ydCB7IERlZmVycmVkIH0gZnJvbSAnLi9kZWZlcnJlZCc7XHJcbmltcG9ydCB7IFdpbmRvd1N5bmNocm9uaXplclNlcnZpY2UgfSBmcm9tICcuL3dpbmRvdy1zeW5jLnNlcnZpY2UnO1xyXG5pbXBvcnQge1xyXG4gIEdvbGRlbkxheW91dENvbnRhaW5lcixcclxuICBHb2xkZW5MYXlvdXRDb21wb25lbnRTdGF0ZSxcclxuICBHb2xkZW5MYXlvdXRFdmVudEh1YixcclxuICBHb2xkZW5MYXlvdXRDb21wb25lbnRIb3N0XHJcbn0gZnJvbSAnLi90b2tlbnMnO1xyXG5pbXBvcnQgeyBJRXh0ZW5kZWRHb2xkZW5MYXlvdXRDb25maWcgfSBmcm9tICcuL2NvbmZpZyc7XHJcblxyXG5pbnRlcmZhY2UgQ29tcG9uZW50SW5pdENhbGxiYWNrIGV4dGVuZHMgRnVuY3Rpb24ge1xyXG4gIChjb250YWluZXI6IEdvbGRlbkxheW91dC5Db250YWluZXIsIGNvbXBvbmVudFN0YXRlOiBhbnkpOiB2b2lkO1xyXG59XHJcblxyXG4vLyBXZSBuZWVkIHRvIHdyYXAgc29tZSBnb2xkZW4gbGF5b3V0IGludGVybmFscywgc28gd2UgY2FuIGludGVyY2VwdCBjbG9zZSBhbmQgJ2Nsb3NlIHN0YWNrJ1xyXG4vLyBGb3IgY2xvc2UsIHRoZSB0YWIgaXMgd3JhcHBlZCBhbmQgdGhlIGNsb3NlIGVsZW1lbnQgdG8gY2hhbmdlIHRoZSBldmVudCBoYW5kbGVyIHRvIGNsb3NlIHRoZSBjb3JyZWN0IGNvbnRhaW5lci5cclxuY29uc3QgbG0gPSBHb2xkZW5MYXlvdXQgYXMgYW55O1xyXG5jb25zdCBpc0Nsb25lZCA9IChjb250ZW50SXRlbTogR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtKSA9PiBjb250ZW50SXRlbS5pc0NvbXBvbmVudCAmJlxyXG5jb250ZW50SXRlbS5jb25maWcgJiZcclxuKGNvbnRlbnRJdGVtLmNvbmZpZyBhcyBHb2xkZW5MYXlvdXQuQ29tcG9uZW50Q29uZmlnKS5jb21wb25lbnRTdGF0ZSAmJlxyXG4oY29udGVudEl0ZW0uY29uZmlnIGFzIEdvbGRlbkxheW91dC5Db21wb25lbnRDb25maWcpLmNvbXBvbmVudFN0YXRlLm9yaWdpbmFsSWQ7XHJcblxyXG5leHBvcnQgY29uc3QgR2V0Q29tcG9uZW50RnJvbUxheW91dE1hbmFnZXIgPSAobG06IEdvbGRlbkxheW91dCwgaWQ6IHN0cmluZyk6IEdvbGRlbkxheW91dC5Db250ZW50SXRlbSA9PiB7XHJcbiAgY29uc3QgaXRlbUxpc3QgPSBsbS5yb290LmdldEl0ZW1zQnlJZChpZCk7XHJcbiAgaWYgKGl0ZW1MaXN0Lmxlbmd0aCAhPT0gMSkge1xyXG4gICAgY29uc29sZS53YXJuKCdub24gdW5pcXVlIElEIGZvdW5kOiAnICsgaWQpO1xyXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICB9XHJcbiAgcmV0dXJuIGl0ZW1MaXN0WzBdO1xyXG59O1xyXG5jb25zdCBvcmlnaW5hbENvbXBvbmVudCA9IChjb250ZW50SXRlbTogR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtKTogYW55ID0+IHtcclxuICBjb25zdCBjb21wID0gR2V0Q29tcG9uZW50RnJvbUxheW91dE1hbmFnZXIoXHJcbiAgICBjb250ZW50SXRlbS5sYXlvdXRNYW5hZ2VyLFxyXG4gICAgKGNvbnRlbnRJdGVtLmNvbmZpZyBhcyBHb2xkZW5MYXlvdXQuQ29tcG9uZW50Q29uZmlnKS5jb21wb25lbnRTdGF0ZS5vcmlnaW5hbElkLFxyXG4gICk7XHJcbiAgaWYgKCFjb21wLmlzQ29tcG9uZW50KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIGNvbXBvbmVudCcpO1xyXG4gIH1cclxuICByZXR1cm4gY29tcDtcclxufTtcclxuY29uc3QgdGFiRnJvbUlkID0gKGNvbnRlbnRJdGVtOiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW0pID0+IHtcclxuICBjb25zdCBjaSA9IG9yaWdpbmFsQ29tcG9uZW50KGNvbnRlbnRJdGVtKTtcclxuICByZXR1cm4gY2kgPyBjaS50YWIgOiB1bmRlZmluZWQ7XHJcbn07XHJcbi8vIFRoaXMgY29kZSB3cmFwcyB0aGUgb3JpZ2luYWwgZ29sZGVuLWxheW91dCBUYWJcclxuLy8gQSB0YWIgaXMgaW5zdGFudGlhdGVkIGJ5IHRoZSBnb2xkZW4tbGF5b3V0IEhlYWRlclxyXG4vLyBXZSByZWJpbmQgdGhlIGNsb3NlIGV2ZW50IGxpc3RlbmVyIHRvIHByb3Blcmx5IGRpc3Bvc2UgdGhlIGFuZ3VsYXIgaXRlbSBjb250YWluZXJcclxuLy8gSW4gb3JkZXIgdG8gZGVzdHJveSB0aGUgYW5ndWxhciBjb21wb25lbnQgcmVmIGFuZCBiZSBhYmxlIHRvIGRlZmVyIHRoZSBjbG9zZS5cclxuY29uc3Qgb3JpZ2luYWxUYWIgPSBsbS5fX2xtLmNvbnRyb2xzLlRhYjtcclxuY29uc3QgbmV3VGFiID0gZnVuY3Rpb24oaGVhZGVyLCB0YWJDb250ZW50SXRlbSkge1xyXG4gIGNvbnN0IHRhYiA9IG5ldyBvcmlnaW5hbFRhYihoZWFkZXIsIHRhYkNvbnRlbnRJdGVtKTtcclxuXHJcbiAgLyoqXHJcbiAgICogVGhpcyBwaWVjZSBvZiBjb2RlIGltcGxlbWVudHMgY2xvc2UgZnVuY3Rpb25hbGl0eSBmb3IgdGhlIHRhYiBjbG9zZS5cclxuICAgKiBJZiB3ZSBoYXZlIGEgY2xvbmVkIHRhYiwgaS5lLiBvbmUgd2hpY2ggaXMgY29udGFpbmVkIGluIGEgbWF4aW1pc2VkIGR1bW15IHN0YWNrXHJcbiAgICogd2UgY2xvc2UgdGhlIGNvbnRhaW5lciBiYWNraW5nIHRoZSB0YWIuXHJcbiAgICovXHJcbiAgdGFiLmNsb3NlRWxlbWVudC5vZmYoJ2NsaWNrIHRvdWNoc3RhcnQnKTtcclxuICB0YWIuY2xvc2VFbGVtZW50Lm9uKCdjbGljayB0b3VjaHN0YXJ0JywgKGV2KSA9PiB7XHJcbiAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIGlmIChpc0Nsb25lZCh0YWIuY29udGVudEl0ZW0pKSB7XHJcbiAgICAgIGNvbnN0IGMgPSBvcmlnaW5hbENvbXBvbmVudCh0YWIuY29udGVudEl0ZW0pO1xyXG4gICAgICBpZiAoYyAmJiBjLmlzQ29tcG9uZW50KSB7XHJcbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBhIGR1bW15IHRhYiwgY2xvc2UgdGhlIGFjdHVhbCB0YWIgYmVoaW5kIGl0LlxyXG4gICAgICAgIGMuY29udGFpbmVyLmNsb3NlKCk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIE90aGVyd2lzZSBjbG9zZSBvdXIgb3duIHRhYi5cclxuICAgICAgdGFiLmNvbnRlbnRJdGVtLmNvbnRhaW5lci5jbG9zZSgpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICAvKipcclxuICAgKiBUaGlzIHNjcmlwdCBlbWl0cyBhIHRhYkFjdGl2YXRlZCBldmVudCBmb3IgdGhlIGNvcnJlY3QgY29udGVudCBpdGVtXHJcbiAgICogd2hlbiBydW5uaW5nIGluIGEgbWF4aW1pc2VkIGR1bW15IHN0YWNrLlxyXG4gICAqL1xyXG4gIHRhYi5lbGVtZW50Lm9uKCdtb3VzZWRvd24gdG91Y2hzdGFydCcsIGV2ID0+IHtcclxuICAgIGxldCBjb250ZW50SXRlbSA9IHRhYi5jb250ZW50SXRlbTtcclxuICAgIGlmIChpc0Nsb25lZChjb250ZW50SXRlbSkpIHtcclxuICAgICAgY29udGVudEl0ZW0gPSBvcmlnaW5hbENvbXBvbmVudCh0YWIuY29udGVudEl0ZW0pO1xyXG4gICAgfVxyXG4gICAgY29udGVudEl0ZW0ubGF5b3V0TWFuYWdlci5lbWl0KCd0YWJBY3RpdmF0ZWQnLCBjb250ZW50SXRlbSk7XHJcbiAgfSk7XHJcblxyXG4gIGlmIChpc0Nsb25lZCh0YWIuY29udGVudEl0ZW0pICYmIHRhYi5fbGF5b3V0TWFuYWdlci5jb25maWcuc2V0dGluZ3MucmVvcmRlckVuYWJsZWQgPT09IHRydWUpIHtcclxuICAgIC8vIFJlaW1wbGVtZW50IHRhYiBkcmFnIHN0YXJ0IGJ5IHJlZGlyZWN0aW5nIHRoZSB0YWIgc3RhdGUuXHJcbiAgICB0YWIuZWxlbWVudC5vbignbW91c2Vkb3duIHRvdWNoc3RhcnQnLCAoZXYpID0+IHtcclxuICAgICAgY29uc3Qgb3JpZ2luYWxUYWIgPSB0YWJGcm9tSWQodGFiLmNvbnRlbnRJdGVtKTtcclxuICAgICAgaWYgKG9yaWdpbmFsVGFiICYmIG9yaWdpbmFsVGFiLl9kcmFnTGlzdGVuZXIpIHtcclxuICAgICAgICBjb25zdCBkbCA9IG9yaWdpbmFsVGFiLl9kcmFnTGlzdGVuZXI7XHJcbiAgICAgICAgY29uc3QgZGVzdHJveUR1bW15ID0gKCkgPT4ge1xyXG4gICAgICAgICAgZGwub2ZmKCdkcmFnU3RhcnQnLCBkZXN0cm95RHVtbXksIGRsKTtcclxuICAgICAgICAgIGlmIChoZWFkZXIubGF5b3V0TWFuYWdlci5fbWF4aW1pc2VkSXRlbSA9PT0gdGFiLmNvbnRlbnRJdGVtLnBhcmVudCkge1xyXG4gICAgICAgICAgICB0YWIuY29udGVudEl0ZW0ucGFyZW50LnRvZ2dsZU1heGltaXNlKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBkbC5vZmYoJ2RyYWdTdGFydCcsIG9yaWdpbmFsVGFiLl9vbkRyYWdTdGFydCwgb3JpZ2luYWxUYWIpO1xyXG4gICAgICAgIGRsLm9uKCdkcmFnU3RhcnQnLCBkZXN0cm95RHVtbXksIGRsKTtcclxuICAgICAgICBkbC5vbignZHJhZ1N0YXJ0Jywgb3JpZ2luYWxUYWIuX29uRHJhZ1N0YXJ0LCBvcmlnaW5hbFRhYik7XHJcbiAgICAgICAgZGwuX2ZEb3duKGV2KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHJldHVybiB0YWI7XHJcbn07XHJcbm5ld1RhYi5fdGVtcGxhdGUgPSAnPGxpIGNsYXNzPVwibG1fdGFiXCI+PGkgY2xhc3M9XCJsbV9sZWZ0XCI+PC9pPicgK1xyXG4nPHNwYW4gY2xhc3M9XCJsbV90aXRsZVwiPjwvc3Bhbj48ZGl2IGNsYXNzPVwibG1fY2xvc2VfdGFiXCI+PC9kaXY+JyArXHJcbic8aSBjbGFzcz1cImxtX3JpZ2h0XCI+PC9pPjwvbGk+JztcclxubG0uX19sbS5jb250cm9scy5UYWIgPSBuZXdUYWI7XHJcblxyXG5cclxuLy8gSGVhZGVyIGlzIHdyYXBwZWQgdG8gY2F0Y2ggdGhlIG1heGltaXNlIGFuZCBjbG9zZSBidXR0b25zLlxyXG5jb25zdCBvcmlnaW5hbEhlYWRlciA9IGxtLl9fbG0uY29udHJvbHMuSGVhZGVyO1xyXG5jb25zdCBuZXdIZWFkZXIgPSBmdW5jdGlvbihsYXlvdXRNYW5hZ2VyLCBwYXJlbnQpIHtcclxuICBjb25zdCBtYXhpbWlzZSA9IHBhcmVudC5faGVhZGVyWydtYXhpbWlzZSddO1xyXG4gIGNvbnN0IHBvcG91dCA9IHBhcmVudC5faGVhZGVyWydwb3BvdXQnXTtcclxuICBpZiAobWF4aW1pc2UgJiYgbGF5b3V0TWFuYWdlci5jb25maWcuc2V0dGluZ3MubWF4aW1pc2VBbGxJdGVtcyA9PT0gdHJ1ZSkge1xyXG4gICAgLy8gQ2hlY2sgd2hldGhlciB3ZSBzaG91bGQgbWF4aW1pc2UgYWxsIHN0YWNrcyBhbmQgaWYgc28sIGZvcmNlIHRoZSBoZWFkZXIgdG9cclxuICAgIC8vIG5vdCBnZW5lcmF0ZSBhIG1heGltaXNlIGJ1dHRvbi5cclxuICAgIGRlbGV0ZSBwYXJlbnQuX2hlYWRlclsnbWF4aW1pc2UnXTtcclxuICB9XHJcbiAgaWYgKHBvcG91dCAmJiBsYXlvdXRNYW5hZ2VyLmNvbmZpZy5zZXR0aW5ncy5tYXhpbWlzZUFsbEl0ZW1zID09PSB0cnVlKSB7XHJcbiAgICBkZWxldGUgcGFyZW50Ll9oZWFkZXJbJ3BvcG91dCddO1xyXG4gIH1cclxuXHJcbiAgLy8gR2VuZXJhdGUgdGhlIG9yaWdpbmFsIGhlYWRlclxyXG4gIGNvbnN0IGhlYWRlciA9IG5ldyBvcmlnaW5hbEhlYWRlcihsYXlvdXRNYW5hZ2VyLCBwYXJlbnQpO1xyXG5cclxuICAvLyBDaGVjayB3aGV0aGVyIHdlIHNob3VsZCBtYXhpbWlzZSBhbGwgc3RhY2tzLCBhbmQgaWYgc28sIGdlbmVyYXRlIGEgY3VzdG9tIHBvcG91dCBidXR0b25cclxuICAvLyBidXQga2VlcCB0aGUgb3JkZXIgd2l0aCB0aGUgbWF4aW1pc2UgYW5kIGNsb3NlIGJ1dHRvblxyXG4gIGlmIChwb3BvdXQgJiYgbGF5b3V0TWFuYWdlci5jb25maWcuc2V0dGluZ3MubWF4aW1pc2VBbGxJdGVtcyA9PT0gdHJ1ZSkge1xyXG4gICAgaGVhZGVyLnBvcG91dEJ1dHRvbiA9IG5ldyBsbS5fX2xtLmNvbnRyb2xzLkhlYWRlckJ1dHRvbihoZWFkZXIsIHBvcG91dCwgJ2xtX3BvcG91dCcsICgpID0+IHtcclxuICAgICAgbGV0IGNvbnRlbnRJdGVtID0gaGVhZGVyLmFjdGl2ZUNvbnRlbnRJdGVtO1xyXG4gICAgICBpZiAoaXNDbG9uZWQoY29udGVudEl0ZW0pKSB7XHJcbiAgICAgICAgLy8gV2UgYXJlIHdpdGhpbiB0aGUgZHVtbXkgc3RhY2ssIG91ciBjb21wb25lbnQgaXMgYSB3cmFwcGVyIGNvbXBvbmVudFxyXG4gICAgICAgIC8vIGFuZCBoYXMgYSByZWZlcmVuY2UgdG8gdGhlIG9yaWdpbmFsICg9IHdyYXBwZWQpIGNvbXBvbmVudC5cclxuICAgICAgICAvLyBUaGVyZWZvcmUsIHBvcHBpbmcgb3V0IHRoZSB3aG9sZSBzdGFjayB3b3VsZCBiZSBzdHVwaWQsIGJlY2F1c2UgaXQgd291bGRuJ3QgbGVhdmVcclxuICAgICAgICAvLyBhbnkgaXRlbSBpbiB0aGlzIHdpbmRvdy5cclxuICAgICAgICBjb250ZW50SXRlbSA9IG9yaWdpbmFsQ29tcG9uZW50KGNvbnRlbnRJdGVtKTtcclxuICAgICAgICBjb250ZW50SXRlbS5wb3BvdXQoKTtcclxuICAgICAgfSBlbHNlIGlmIChsYXlvdXRNYW5hZ2VyLmNvbmZpZy5zZXR0aW5ncy5wb3BvdXRXaG9sZVN0YWNrID09PSB0cnVlKSB7XHJcbiAgICAgICAgLy8gV2UgaGF2ZSBhIHJlZ3VsYXIgc3RhY2ssIHNvIGhvbm9yIHRoZSBwb3BvdXRXaG9sZVN0YWNrIHNldHRpbmcuXHJcbiAgICAgICAgaGVhZGVyLnBhcmVudC5wb3BvdXQoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb250ZW50SXRlbS5wb3BvdXQoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyBDaGVjayB3aGV0aGVyIHdlIHNob3VsZCBtYXhpbWlzZSBhbGwgc3RhY2tzLCBhbmQgaWYgc28sIGdlbmVyYXRlIGEgY3VzdG9tIG1heGltaXNlIGJ1dHRvblxyXG4gIC8vIGJ1dCBrZWVwIHRoZSBvcmRlciB3aXRoIHRoZSBjbG9zZSBidXR0b24uXHJcbiAgaWYgKG1heGltaXNlICYmIGxheW91dE1hbmFnZXIuY29uZmlnLnNldHRpbmdzLm1heGltaXNlQWxsSXRlbXMgPT09IHRydWUpIHtcclxuICAgIGhlYWRlci5tYXhpbWlzZUJ1dHRvbiA9IG5ldyBsbS5fX2xtLmNvbnRyb2xzLkhlYWRlckJ1dHRvbihoZWFkZXIsIG1heGltaXNlLCAnbG1fbWF4aW1pc2UnLCAoKSA9PiB7XHJcbiAgICAgIC8vIFRoZSBtYXhpbWlzZSBidXR0b24gd2FzIGNsaWNrZWQsIHNvIGNyZWF0ZSBhIGR1bW15IHN0YWNrLCBjb250YWluaW5nIGEgd3JhcHBlciBjb21wb25lbnQgZm9yIGVhY2ggb3BlbmVkIGNvbXBvbmVudC5cclxuICAgICAgaWYgKGxheW91dE1hbmFnZXIuX21heGltaXNlZEl0ZW0gPT09IHBhcmVudCkge1xyXG4gICAgICAgIHBhcmVudC50b2dnbGVNYXhpbWlzZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxheW91dE1hbmFnZXIuZ2VuZXJhdGVBbmRNYXhpbWlzZUR1bW15U3RhY2socGFyZW50KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGlmIChoZWFkZXIuY2xvc2VCdXR0b24pIHtcclxuICAgIGhlYWRlci5jbG9zZUJ1dHRvbi5fJGRlc3Ryb3koKTtcclxuICAgIGNvbnN0IGxhYmVsID0gaGVhZGVyLl9nZXRIZWFkZXJTZXR0aW5nKCdjbG9zZScpO1xyXG4gICAgaGVhZGVyLmNsb3NlQnV0dG9uID0gbmV3IGxtLl9fbG0uY29udHJvbHMuSGVhZGVyQnV0dG9uKGhlYWRlciwgbGFiZWwsICdsbV9jbG9zZScsICgpID0+IHtcclxuICAgICAgaGVhZGVyLnBhcmVudC5jb250ZW50SXRlbXMuZm9yRWFjaChjaSA9PiB7XHJcbiAgICAgICAgY2kuY29udGFpbmVyLmNsb3NlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHJldHVybiBoZWFkZXI7XHJcbn07XHJcbm5ld0hlYWRlci5fdGVtcGxhdGUgPSBbXHJcblx0JzxkaXYgY2xhc3M9XCJsbV9oZWFkZXJcIj4nLFxyXG5cdCc8dWwgY2xhc3M9XCJsbV90YWJzXCI+PC91bD4nLFxyXG5cdCc8dWwgY2xhc3M9XCJsbV9jb250cm9sc1wiPjwvdWw+JyxcclxuXHQnPHVsIGNsYXNzPVwibG1fdGFiZHJvcGRvd25fbGlzdFwiPjwvdWw+JyxcclxuXHQnPC9kaXY+J1xyXG5dLmpvaW4oICcnICk7XHJcbmxtLl9fbG0uY29udHJvbHMuSGVhZGVyID0gbmV3SGVhZGVyO1xyXG5cclxuXHJcbi8vIFBhdGNoIHRoZSBkcmFnIHByb3h5IGluIG9yZGVyIHRvIGhhdmUgYW4gaXRlbURyYWdnZWQgZXZlbnQuXHJcbmNvbnN0IG9yaWdEcmFnUHJveHkgPSBsbS5fX2xtLmNvbnRyb2xzLkRyYWdQcm94eTtcclxuY29uc3QgZHJhZ1Byb3h5ID0gZnVuY3Rpb24oeCwgeSwgZHJhZ0xpc3RlbmVyLCBsYXlvdXRNYW5hZ2VyLCBjb250ZW50SXRlbSwgb3JpZ2luYWxQYXJlbnQpIHtcclxuICBsYXlvdXRNYW5hZ2VyLmVtaXQoJ2l0ZW1EcmFnZ2VkJywgY29udGVudEl0ZW0pO1xyXG4gIHJldHVybiBuZXcgb3JpZ0RyYWdQcm94eSh4LCB5LCBkcmFnTGlzdGVuZXIsIGxheW91dE1hbmFnZXIsIGNvbnRlbnRJdGVtLCBvcmlnaW5hbFBhcmVudCk7XHJcbn1cclxuZHJhZ1Byb3h5Ll90ZW1wbGF0ZSA9IG9yaWdEcmFnUHJveHkuX3RlbXBsYXRlO1xyXG5sbS5fX2xtLmNvbnRyb2xzLkRyYWdQcm94eSA9IGRyYWdQcm94eTtcclxuXHJcbi8vIFBhdGNoIHRoZSBzdGFjayBpbiBvcmRlciB0byBoYXZlIGFuIGFjdGl2ZUNvbnRlbnRJdGVtQ2hhbmdlZCQgb2JzZXJ2YWJsZVxyXG5jb25zdCBvcmlnU3RhY2sgPSBsbS5fX2xtLml0ZW1zLlN0YWNrO1xyXG5mdW5jdGlvbiBNeVN0YWNrKGxtLCBjb25maWcsIHBhcmVudCkge1xyXG4gIG9yaWdTdGFjay5jYWxsKHRoaXMsIGxtLCBjb25maWcsIHBhcmVudCk7XHJcbiAgdGhpcy5hY3RpdmVDb250ZW50SXRlbSQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PGFueT4obnVsbCk7XHJcbiAgY29uc3QgY2FsbGJhY2sgPSAoY2kpID0+IHtcclxuICAgIGlmICh0aGlzLmFjdGl2ZUNvbnRlbnRJdGVtJCkge1xyXG4gICAgICB0aGlzLmFjdGl2ZUNvbnRlbnRJdGVtJC5uZXh0KGNpKVxyXG4gICAgfTtcclxuICB9O1xyXG4gIHRoaXMub24oJ2FjdGl2ZUNvbnRlbnRJdGVtQ2hhbmdlZCcsIGNhbGxiYWNrKTtcclxuICBjb25zdCBvcmlnRGVzdHJveSA9IHRoaXMuXyRkZXN0cm95O1xyXG4gIHRoaXMuX19fZGVzdHJveWVkID0gZmFsc2U7XHJcbiAgdGhpcy5fJGRlc3Ryb3kgPSAoKSA9PiB7XHJcbiAgICBpZiAodGhpcy5fX19kZXN0cm95ZWQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fX19kZXN0cm95ZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5vZmYoJ2FjdGl2ZUNvbnRlbnRJdGVtQ2hhbmdlZCcsIGNhbGxiYWNrKTtcclxuICAgIHRoaXMuYWN0aXZlQ29udGVudEl0ZW0kLmNvbXBsZXRlKCk7XHJcbiAgICB0aGlzLmFjdGl2ZUNvbnRlbnRJdGVtJCA9IG51bGw7XHJcbiAgICBvcmlnRGVzdHJveS5jYWxsKHRoaXMpO1xyXG4gIH07XHJcbiAgcmV0dXJuIHRoaXM7XHJcbn1cclxuTXlTdGFjay5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKG9yaWdTdGFjay5wcm90b3R5cGUpO1xyXG5cclxuLy8gRm9yY2Ugc3RhY2tzIHRvIGJlIGZsYXR0ZW5lZC5cclxuTXlTdGFjay5wcm90b3R5cGVbJ2FkZENoaWxkJ10gPSBmdW5jdGlvbihjb250ZW50SXRlbTogR29sZGVuTGF5b3V0Lkl0ZW1Db25maWcsIGluZGV4OiBudW1iZXIpIHtcclxuICBpZiAoY29udGVudEl0ZW0udHlwZSA9PT0gJ3N0YWNrJykge1xyXG4gICAgLy8gV2UgdHJ5IHRvIHBvcCBpbiBhIHN0YWNrIGludG8gYW5vdGhlciBzdGFjayAoaS5lLiBuZXN0ZWQgdGFiIGNvbnRyb2xzLilcclxuICAgIC8vIFRoaXMgYnJlYWtzIHRoZSBvdGhlciBzdHVmZiBpbiBjdXN0b20gaGVhZGVyIGNvbXBvbmVudHMsIHRoZXJlZm9yZSBpdCdzIG5vdCByZWNvbW1lbmRlZC5cclxuICAgIC8vIFNvIHdlIGFkZCB0aGUgaXRlbXMgZGlyZWN0bHkgaW50byB0aGlzIHN0YWNrLlxyXG4gICAgKGNvbnRlbnRJdGVtLmNvbnRlbnQgfHwgW10pLmZvckVhY2goKGNpLCBpZHgpID0+IG9yaWdTdGFjay5wcm90b3R5cGUuYWRkQ2hpbGQuY2FsbCh0aGlzLCBjaSwgaW5kZXggKyBpZHgpKTtcclxuICAgIGlmIChjb250ZW50SXRlbS5jb250ZW50Lmxlbmd0aCkge1xyXG4gICAgICB0aGlzLnNldEFjdGl2ZUNvbnRlbnRJdGVtKHRoaXMuY29udGVudEl0ZW1zW2luZGV4ICsgKGNvbnRlbnRJdGVtIGFzIGFueSkuYWN0aXZlSXRlbUluZGV4XSk7XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIG9yaWdTdGFjay5wcm90b3R5cGUuYWRkQ2hpbGQuY2FsbCh0aGlzLCBjb250ZW50SXRlbSwgaW5kZXgpO1xyXG4gIH1cclxufTtcclxuTXlTdGFjay5wcm90b3R5cGVbJ3NldFNpemUnXSA9IGZ1bmN0aW9uKCkge1xyXG4gIGlmICh0aGlzLmxheW91dE1hbmFnZXIuX21heGltaXNlZEl0ZW0gPT09IHRoaXMgJiYgdGhpcy5sYXlvdXRNYW5hZ2VyLmNvbmZpZy5zZXR0aW5ncy5tYXhpbWlzZUFsbEl0ZW1zID09PSB0cnVlKSB7XHJcbiAgICAvLyBBY3R1YWxseSBlbmZvcmNlIHRoYXQgdGhpcyBpdGVtIHdpbGwgYmUgdGhlIGNvcnJlY3Qgc2l6ZVxyXG4gICAgdGhpcy5lbGVtZW50LndpZHRoKHRoaXMubGF5b3V0TWFuYWdlci5jb250YWluZXIud2lkdGgoKSk7XHJcbiAgICB0aGlzLmVsZW1lbnQuaGVpZ2h0KHRoaXMubGF5b3V0TWFuYWdlci5jb250YWluZXIuaGVpZ2h0KCkpO1xyXG4gIH1cclxuICBvcmlnU3RhY2sucHJvdG90eXBlLnNldFNpemUuY2FsbCh0aGlzKTtcclxufTtcclxubG0uX19sbS5pdGVtcy5TdGFjayA9IE15U3RhY2s7XHJcblxyXG5jb25zdCBvcmlnUG9wb3V0ID0gbG0uX19sbS5jb250cm9scy5Ccm93c2VyUG9wb3V0O1xyXG5jb25zdCBwb3BvdXQgPSBmdW5jdGlvbihjb25maWc6IEdvbGRlbkxheW91dC5JdGVtQ29uZmlnW10sIGRpbWVuc2lvbnMsIHBhcmVudCwgaW5kZXgsIGxtKSB7XHJcbiAgaWYgKGNvbmZpZy5sZW5ndGggIT09IDEpIHtcclxuICAgIGNvbnNvbGUud2FybignVGhpcyBzaG91bGQgbm90IGhhcHBlbiwgcGVybWl0dGluZycsIGNvbmZpZyk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGlmIChjb25maWdbMF0udHlwZSA9PT0gJ2NvbXBvbmVudCcpIHtcclxuICAgICAgY29uZmlnID0gW3tcclxuICAgICAgICB0eXBlOiAnc3RhY2snLFxyXG4gICAgICAgIHRpdGxlOiBjb25maWdbMF0udGl0bGUsIC8vIFJlcXVpcmVkIGZvciBhZGp1c3RUb1dpbmRvd01vZGUgdG8gd29yay4gKExpbmUgMTI4MiBpbiAxLjUuOSlcclxuICAgICAgICBjb250ZW50OiBbY29uZmlnWzBdXSxcclxuICAgICAgfV07XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBuZXcgb3JpZ1BvcG91dChjb25maWcsIGRpbWVuc2lvbnMsIHBhcmVudCwgaW5kZXgsIGxtKTtcclxufTtcclxubG0uX19sbS5jb250cm9scy5Ccm93c2VyUG9wb3V0ID0gcG9wb3V0O1xyXG5cclxuXHJcbi8vIEZpeHVwIGZvciBuZXN0ZWQgZ29sZGVuLWxheW91dCBpbnN0YW5jZXMuXHJcbi8vIG5lc3RlZCBpbnN0YW5jZXMgc2hvdWxkIGJlIGFibGUgdG8gYmUgZG9ja2VkIG91dCBjb21wbGV0ZWx5XHJcbi8vIGJ1dCB0aGUgZ29sZGVuIGxheW91dCB3aWxsIHJlY29nbml6ZSBpdHMgcXVlcnkgc3RyaW5nIGFuZCBiZSBpbmNvcnJlY3RseSBuZXN0ZWQuXHJcbmNvbnN0IGdldFF1ZXJ5U3RyaW5nUGFyYW0gPSBsbS5fX2xtLnV0aWxzLmdldFF1ZXJ5U3RyaW5nUGFyYW07XHJcbmxldCBmaXJzdFF1ZXJ5U3RyaW5nID0gdHJ1ZTtcclxubG0uX19sbS51dGlscy5nZXRRdWVyeVN0cmluZ1BhcmFtID0gKHBhcmFtOiBzdHJpbmcpID0+IHtcclxuICBpZiAoZmlyc3RRdWVyeVN0cmluZykge1xyXG4gICAgZmlyc3RRdWVyeVN0cmluZyA9IGZhbHNlO1xyXG4gICAgcmV0dXJuIGdldFF1ZXJ5U3RyaW5nUGFyYW0ocGFyYW0pO1xyXG4gIH1cclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ2dvbGRlbi1sYXlvdXQtcm9vdCcsXHJcbiAgc3R5bGVzOiBbYFxyXG4gICAgLm5nLWdvbGRlbi1sYXlvdXQtcm9vdCB7XHJcbiAgICAgIHdpZHRoOjEwMCU7XHJcbiAgICAgIGhlaWdodDoxMDAlO1xyXG4gICAgfWBcclxuICBdLFxyXG4gIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cIm5nLWdvbGRlbi1sYXlvdXQtcm9vdFwiICNnbHJvb3Q+PC9kaXY+YFxyXG59KVxyXG5leHBvcnQgY2xhc3MgR29sZGVuTGF5b3V0Q29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG5cclxuICBASW5wdXQoKSBsYXlvdXQ6IE9ic2VydmFibGU8SUV4dGVuZGVkR29sZGVuTGF5b3V0Q29uZmlnPjtcclxuICBAT3V0cHV0KCkgc3RhdGVDaGFuZ2VkID0gbmV3IEV2ZW50RW1pdHRlcjxuZXZlcj4oKTtcclxuICBAT3V0cHV0KCkgdGFiQWN0aXZhdGVkID0gbmV3IEV2ZW50RW1pdHRlcjxHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW0+KCk7XHJcblxyXG4gIEBWaWV3Q2hpbGQoJ2dscm9vdCcsIHsgc3RhdGljOiB0cnVlIH0pIHByaXZhdGUgZWw6IEVsZW1lbnRSZWY7XHJcblxyXG4gIHByaXZhdGUgZ29sZGVuTGF5b3V0OiBHb2xkZW5MYXlvdXQgPSBudWxsO1xyXG4gIHByaXZhdGUgb25VbmxvYWRlZCA9IG5ldyBEZWZlcnJlZDx2b2lkPigpO1xyXG4gIHByaXZhdGUgc3RhdGVDaGFuZ2VQYXVzZWQgPSBmYWxzZTtcclxuICBwcml2YXRlIHN0YXRlQ2hhbmdlU2NoZWR1bGVkID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSB0YWJzTGlzdCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8eyBbdGFiSWQ6IHN0cmluZ106IEdvbGRlbkxheW91dC5Db250ZW50SXRlbSB9Pih7fSk7XHJcbiAgcHVzaFN0YXRlQ2hhbmdlID0gKCkgPT4ge1xyXG4gICAgLy8gRm9yIGVhY2ggc3RhdGUgY2hhbmdlLCB3ZSB3YW50IHRvIHJlZnJlc2ggdGhlIGxpc3Qgb2YgdGhlIG9wZW5lZCBjb21wb25lbnRzLiBBdCB0aGUgbW9tZW50LCB3ZSBvbmx5IGNhcmUgYWJvdXQgdGhlIGtleXMuXHJcbiAgICB0aGlzLnRhYnNMaXN0Lm5leHQoKHRoaXMuZ29sZGVuTGF5b3V0IGFzIGFueSkuX2dldEFsbENvbXBvbmVudHMoKSk7XHJcbiAgICBpZiAodGhpcy5zdGF0ZUNoYW5nZVBhdXNlZCB8fCB0aGlzLnN0YXRlQ2hhbmdlU2NoZWR1bGVkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMuc3RhdGVDaGFuZ2VTY2hlZHVsZWQgPSB0cnVlO1xyXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XHJcbiAgICAgIHRoaXMuc3RhdGVDaGFuZ2VTY2hlZHVsZWQgPSBmYWxzZTtcclxuICAgICAgdGhpcy5zdGF0ZUNoYW5nZWQuZW1pdCgpXHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICByZXN1bWVTdGF0ZUNoYW5nZSA9ICgpID0+IHRoaXMuc3RhdGVDaGFuZ2VQYXVzZWQgPSBmYWxzZTtcclxuICBwYXVzZVN0YXRlQ2hhbmdlID0gKCkgPT4gdGhpcy5zdGF0ZUNoYW5nZVBhdXNlZCA9IHRydWU7XHJcbiAgcHVzaFRhYkFjdGl2YXRlZCA9IChjaTogR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtKSA9PiB7XHJcbiAgICB0aGlzLnRhYkFjdGl2YXRlZC5lbWl0KGNpKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZmFsbGJhY2tUeXBlOiBDb21wb25lbnRJbml0Q2FsbGJhY2sgPSBudWxsO1xyXG4gIHByaXZhdGUgbGF5b3V0U3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XHJcbiAgcHJpdmF0ZSBvcGVuZWRDb21wb25lbnRzID0gW107XHJcbiAgcHJpdmF0ZSBwb3BwZWRJbiA9IGZhbHNlO1xyXG4gIHByaXZhdGUgX2V2ZW50RW1pdHRlciA9IG5ldyBsbS5fX2xtLnV0aWxzLkV2ZW50RW1pdHRlcigpO1xyXG5cclxuICBASG9zdExpc3RlbmVyKCd3aW5kb3c6cmVzaXplJylcclxuICBwdWJsaWMgb25SZXNpemUoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5nb2xkZW5MYXlvdXQpIHtcclxuICAgICAgdGhpcy5nb2xkZW5MYXlvdXQudXBkYXRlU2l6ZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIHJvb3RTZXJ2aWNlOiBSb290V2luZG93U2VydmljZSxcclxuICAgIHByaXZhdGUgY29tcG9uZW50UmVnaXN0cnk6IENvbXBvbmVudFJlZ2lzdHJ5U2VydmljZSxcclxuICAgIHByaXZhdGUgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZixcclxuICAgIHByaXZhdGUgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXHJcbiAgICBwcml2YXRlIG5nWm9uZTogTmdab25lLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBpbmplY3RvcjogSW5qZWN0b3IsXHJcbiAgICBwcml2YXRlIHdpbmRvd1N5bmM6IFdpbmRvd1N5bmNocm9uaXplclNlcnZpY2UsXHJcbiAgICBAT3B0aW9uYWwoKSBAU2tpcFNlbGYoKSBwcml2YXRlIHBhcmVudEdvbGRlbkxheW91dDogR29sZGVuTGF5b3V0Q29tcG9uZW50LFxyXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChGYWxsYmFja0NvbXBvbmVudCkgcHJpdmF0ZSByZWFkb25seSBmYWxsYmFja0NvbXBvbmVudDogYW55XHJcbiAgKSB7XHJcbiAgICBjb25zb2xlLmxvZyhwYXJlbnRHb2xkZW5MYXlvdXQpO1xyXG4gICAgaWYgKCEhdGhpcy5mYWxsYmFja0NvbXBvbmVudCkge1xyXG4gICAgICB0aGlzLmZhbGxiYWNrVHlwZSA9IHRoaXMuYnVpbGRDb25zdHJ1Y3Rvcih0aGlzLmZhbGxiYWNrQ29tcG9uZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaXNEZXZNb2RlKCkpIGNvbnNvbGUubG9nKGBDcmVhdGVAJHt0aGlzLnJvb3RTZXJ2aWNlLmlzQ2hpbGRXaW5kb3cgPyAnY2hpbGQnIDogJ3Jvb3QnfSFgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBuZ09uSW5pdCgpOiB2b2lkIHtcclxuICAgIGlmIChpc0Rldk1vZGUoKSkgY29uc29sZS5sb2coYEluaXRAJHt0aGlzLnJvb3RTZXJ2aWNlLmlzQ2hpbGRXaW5kb3cgPyAnY2hpbGQnIDogJ3Jvb3QnfSFgKTtcclxuXHJcbiAgICB0aGlzLmxheW91dFN1YnNjcmlwdGlvbiA9IHRoaXMubGF5b3V0LnN1YnNjcmliZShsYXlvdXQgPT4ge1xyXG4gICAgICB0aGlzLmRlc3Ryb3lHb2xkZW5MYXlvdXQoKTtcclxuICAgICAgdGhpcy5pbml0aWFsaXplR29sZGVuTGF5b3V0KGxheW91dCk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgLy8gTWFwIGJlZm9yZXVubG9hZCB0byBvbkRlc3Ryb3kgdG8gc2ltcGxpZnkgdGhlIGhhbmRsaW5nXHJcbiAgQEhvc3RMaXN0ZW5lcignd2luZG93OmJlZm9yZXVubG9hZCcpXHJcbiAgcHVibGljIGJlZm9yZVVubG9hZCgpIHtcclxuICAgIGlmICh0aGlzLnBvcHBlZEluKSB7XHJcbiAgICAgIHRoaXMub25VbmxvYWRlZC5wcm9taXNlLnRoZW4oKCkgPT4gdGhpcy5uZ09uRGVzdHJveSgpKTtcclxuICAgICAgdGhpcy5vblVubG9hZGVkLnJlc29sdmUoKTtcclxuICAgICAgdGhpcy53aW5kb3dTeW5jLm9uVW5sb2FkKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBNYXAgYmVmb3JldW5sb2FkIHRvIG9uRGVzdHJveSB0byBzaW1wbGlmeSB0aGUgaGFuZGxpbmdcclxuICBASG9zdExpc3RlbmVyKCd3aW5kb3c6cGFnZWhpZGUnKVxyXG4gIHB1YmxpYyBwYWdlSGlkZSgpIHtcclxuICAgIGlmICghdGhpcy5wb3BwZWRJbikge1xyXG4gICAgICB0aGlzLm9wZW5lZENvbXBvbmVudHMuZm9yRWFjaChjID0+IHtcclxuICAgICAgICBpZiAoaW1wbGVtZW50c0dsT25VbmxvYWQoYykpIHtcclxuICAgICAgICAgIGMuZ2xPblVubG9hZCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLm9uVW5sb2FkZWQucHJvbWlzZS50aGVuKCgpID0+IHRoaXMubmdPbkRlc3Ryb3koKSk7XHJcbiAgICB0aGlzLm9uVW5sb2FkZWQucmVzb2x2ZSgpO1xyXG4gICAgdGhpcy53aW5kb3dTeW5jLm9uVW5sb2FkKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbmdPbkRlc3Ryb3koKTogdm9pZCB7XHJcbiAgICBpZiAoaXNEZXZNb2RlKCkpIHtcclxuICAgICAgY29uc29sZS5sb2coYERlc3Ryb3lAJHt0aGlzLnJvb3RTZXJ2aWNlLmlzQ2hpbGRXaW5kb3cgPyAnY2hpbGQnIDogJ3Jvb3QnfSFgKTtcclxuICAgIH1cclxuICAgIHRoaXMubGF5b3V0U3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcblxyXG4gICAgLy8gcmVzdG9yZSB0aGUgb3JpZ2luYWwgdGljayBtZXRob2QuXHJcbiAgICAvLyB0aGlzIGFwcGVucyBpbiB0d28gY2FzZXM6XHJcbiAgICAvLyBlaXRoZXIgdGhlIHdpbmRvdyBpcyBjbG9zZWQsIGFmdGVyIHRoYXQgaXQncyBub3QgaW1wb3J0YW50IHRvIHJlc3RvcmUgdGhlIHRpY2sgbWV0aG9kXHJcbiAgICAvLyBvciB3aXRoaW4gdGhlIHJvb3Qgd2luZG93LCB3aGVyZSB3ZSBIQVZFIHRvIHJlc3RvcmUgdGhlIG9yaWdpbmFsIHRpY2sgbWV0aG9kXHJcbiAgICB0aGlzLndpbmRvd1N5bmMucmVzdG9yZUFwcFJlZlRpY2soKTtcclxuICAgIHRoaXMuZGVzdHJveUdvbGRlbkxheW91dCgpO1xyXG4gICAgLy8gRGlzY2FyZCBhbGwgcHJldmlvdXNseSBtYWRlIHN1YnNjcmlwdGlvbnMuXHJcbiAgICB0aGlzLl9ldmVudEVtaXR0ZXIuX21TdWJzY3JpcHRpb25zID0geyBbbG0uX19sbS51dGlscy5FdmVudEVtaXR0ZXIuQUxMX0VWRU5UXTogW10gfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRHb2xkZW5MYXlvdXRJbnN0YW5jZSgpOiBHb2xkZW5MYXlvdXQge1xyXG4gICAgaWYgKCF0aGlzLmdvbGRlbkxheW91dCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBvbmVudCBpcyBub3QgaW5pdGlhbGl6ZWQgeWV0Jyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5nb2xkZW5MYXlvdXQ7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYWRkRXZlbnQoa2luZDogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24sIGNvbnRleHQ/OiBhbnkpIHtcclxuICAgIHRoaXMuX2V2ZW50RW1pdHRlci5vbihraW5kLCBjYWxsYmFjaywgY29udGV4dCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0U2VyaWFsaXphYmxlU3RhdGUoKTogYW55IHtcclxuICAgIGlmICh0aGlzLmdvbGRlbkxheW91dCkge1xyXG4gICAgICBjb25zdCBjb25maWdPYmogPSB0aGlzLmdvbGRlbkxheW91dC50b0NvbmZpZygpO1xyXG4gICAgICBjb25zdCB3cmFwcGVyTWF4ID0gKHRoaXMuZ29sZGVuTGF5b3V0IGFzIGFueSkuX193cmFwcGVyTWF4aW1pc2VkSXRlbUlkO1xyXG4gICAgICBpZiAod3JhcHBlck1heCkge1xyXG4gICAgICAgIGNvbmZpZ09iai5tYXhpbWlzZWRJdGVtSWQgPSB3cmFwcGVyTWF4O1xyXG4gICAgICAgIGNvbnN0IGZpbHRlckNvbnRlbnQgPSAoY2kpID0+IHtcclxuICAgICAgICAgIGlmIChjaS50eXBlID09PSAnc3RhY2snICYmIGNpLmlzRHVtbXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGNpLnR5cGUgIT09ICdjb21wb25lbnQnKSB7XHJcbiAgICAgICAgICAgIGNpLmNvbnRlbnQgPSBjaS5jb250ZW50LmZpbHRlcihmaWx0ZXJDb250ZW50KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25maWdPYmouY29udGVudCA9IGNvbmZpZ09iai5jb250ZW50LmZpbHRlcihmaWx0ZXJDb250ZW50KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY29uZmlnT2JqO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0Q29tcG9uZW50cygpOiB7IFtpZDogc3RyaW5nXTogR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtIH0ge1xyXG4gICAgcmV0dXJuICh0aGlzLmdvbGRlbkxheW91dCBhcyBhbnkpLl9nZXRBbGxDb21wb25lbnRzKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY2xvc2VDb21wb25lbnQoY29tcG9uZW50OiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IGMgPSBHZXRDb21wb25lbnRGcm9tTGF5b3V0TWFuYWdlcih0aGlzLmdvbGRlbkxheW91dCwgY29tcG9uZW50KTtcclxuICAgIGlmICghYykge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjLnJlbW92ZSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGZvY3VzQ29tcG9uZW50KGNvbXBvbmVudDogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBjID0gR2V0Q29tcG9uZW50RnJvbUxheW91dE1hbmFnZXIodGhpcy5nb2xkZW5MYXlvdXQsIGNvbXBvbmVudCk7XHJcbiAgICBpZiAoIWMpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgYy5wYXJlbnQuc2V0QWN0aXZlQ29udGVudEl0ZW0oYyk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgY3JlYXRlTmV3Q29tcG9uZW50KGNvbmZpZzogR29sZGVuTGF5b3V0LkNvbXBvbmVudENvbmZpZywgY29tcG9uZW50VG9Eb2NrPzogc3RyaW5nKTogUHJvbWlzZTxDb21wb25lbnRSZWY8YW55Pj4ge1xyXG4gICAgaWYgKCF0aGlzLmdvbGRlbkxheW91dCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJnb2xkZW4gbGF5b3V0IGlzIG5vdCBpbml0aWFsaXplZFwiKTtcclxuICAgIH1cclxuICAgIGxldCBteUNvbmZpZzogR29sZGVuTGF5b3V0Lkl0ZW1Db25maWcgPSBjb25maWc7XHJcbiAgICBjb25zdCByb290ID0gdGhpcy5nb2xkZW5MYXlvdXQucm9vdDtcclxuICAgIGxldCBlbGVtZW50OiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW0gPSBudWxsO1xyXG4gICAgaWYgKGNvbXBvbmVudFRvRG9jaykge1xyXG4gICAgICBjb25zdCBjID0gR2V0Q29tcG9uZW50RnJvbUxheW91dE1hbmFnZXIodGhpcy5nb2xkZW5MYXlvdXQsIGNvbXBvbmVudFRvRG9jayk7XHJcbiAgICAgIGlmIChjLnBhcmVudC5pc1N0YWNrKSB7XHJcbiAgICAgICAgZWxlbWVudCA9IGMucGFyZW50O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IHN0YWNrID0gdGhpcy5nb2xkZW5MYXlvdXQuY3JlYXRlQ29udGVudEl0ZW0oe1xyXG4gICAgICAgICAgdHlwZTogJ3N0YWNrJyxcclxuICAgICAgICAgIHdpZHRoOiBjLnBhcmVudC5jb25maWcud2lkdGgsXHJcbiAgICAgICAgICBoZWlnaHQ6IGMucGFyZW50LmNvbmZpZy5oZWlnaHQsXHJcbiAgICAgICAgICBjb250ZW50OiBbXSxcclxuICAgICAgICB9KSBhcyBhbnk7XHJcbiAgICAgICAgKGMucGFyZW50LnJlcGxhY2VDaGlsZCBhcyBhbnkpKGMsIHN0YWNrLCBmYWxzZSk7XHJcbiAgICAgICAgc3RhY2suYWRkQ2hpbGQoYyk7XHJcbiAgICAgICAgZWxlbWVudCA9IHN0YWNrO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoIXJvb3QuY29udGVudEl0ZW1zIHx8IHJvb3QuY29udGVudEl0ZW1zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIGVsZW1lbnQgPSByb290O1xyXG4gICAgICAgIC8vIEVuc3VyZSB0aGVyZSBpcyBhIHN0YWNrIHdoZW4gY2xvc2luZyBBTEwgaXRlbXMgYW5kIGNyZWF0aW5nIGEgbmV3IGl0ZW0uXHJcbiAgICAgICAgbXlDb25maWcgPSB7XHJcbiAgICAgICAgICB0eXBlOiAnc3RhY2snLFxyXG4gICAgICAgICAgY29udGVudDogW3tcclxuICAgICAgICAgICAgLi4ubXlDb25maWcsXHJcbiAgICAgICAgICAgIHR5cGU6ICdjb21wb25lbnQnLFxyXG4gICAgICAgICAgfV0sXHJcbiAgICAgICAgfTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBlbGVtZW50ID0gdGhpcy5maW5kU3RhY2socm9vdC5jb250ZW50SXRlbXMpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoZWxlbWVudCA9PT0gbnVsbCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0aGlzIHNob3VsZCBuZXZlciBoYXBwZW4hXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLmdvbGRlbkxheW91dC5jcmVhdGVDb250ZW50SXRlbShteUNvbmZpZykgYXMgYW55O1xyXG4gICAgZWxlbWVudC5hZGRDaGlsZChjb250ZW50KTtcclxuICAgIGlmIChjb250ZW50LmlzQ29tcG9uZW50KSB7XHJcbiAgICAgIC8vIFVzdWFsbHlcclxuICAgICAgcmV0dXJuIGNvbnRlbnQuaW5zdGFuY2U7XHJcbiAgICB9IGVsc2UgaWYgKGNvbnRlbnQuaXNTdGFjayAmJiBjb250ZW50LmNvbnRlbnRJdGVtcy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgcmV0dXJuIGNvbnRlbnQuY29udGVudEl0ZW1zWzBdLmluc3RhbmNlOyAvLyBUaGUgY2FzZSB3aGVuIHRoaXMgaXMgdGhlIGZpcnN0IGNvbXBvbmVudC5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBjb250ZW50O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBmaW5kU3RhY2soY29udGVudEl0ZW1zOiBHb2xkZW5MYXlvdXQuQ29udGVudEl0ZW1bXSk6IEdvbGRlbkxheW91dC5Db250ZW50SXRlbSB7XHJcbiAgICBpZiAoIWNvbnRlbnRJdGVtcykge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIGZvciAoY29uc3QgeCBvZiBjb250ZW50SXRlbXMpIHtcclxuICAgICAgaWYgKHguaXNTdGFjaykge1xyXG4gICAgICAgIGlmICgoeC5jb25maWcgYXMgYW55KS5pc0R1bW15KSB7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgcyA9IHRoaXMuZmluZFN0YWNrKHguY29udGVudEl0ZW1zKTtcclxuICAgICAgaWYgKHMgIT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gcztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBkZXN0cm95R29sZGVuTGF5b3V0KCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLmdvbGRlbkxheW91dCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLmdvbGRlbkxheW91dC5vZmYoJ3N0YXRlQ2hhbmdlZCcsIHRoaXMucHVzaFN0YXRlQ2hhbmdlKTtcclxuICAgIHRoaXMuZ29sZGVuTGF5b3V0Lm9mZignaXRlbURyb3BwZWQnLCB0aGlzLnJlc3VtZVN0YXRlQ2hhbmdlKTtcclxuICAgIHRoaXMuZ29sZGVuTGF5b3V0Lm9mZignaXRlbURyYWdnZWQnLCB0aGlzLnBhdXNlU3RhdGVDaGFuZ2UpO1xyXG4gICAgdGhpcy5nb2xkZW5MYXlvdXQub2ZmKCd0YWJBY3RpdmF0ZWQnLCB0aGlzLnB1c2hUYWJBY3RpdmF0ZWQpO1xyXG4gICAgdGhpcy5nb2xkZW5MYXlvdXQub2ZmKCdpbml0aWFsaXNlZCcpO1xyXG4gICAgdGhpcy5nb2xkZW5MYXlvdXQub2ZmKGxtLl9fbG0udXRpbHMuRXZlbnRFbWl0dGVyLkFMTF9FVkVOVCwgdGhpcy5fZXZlbnRFbWl0dGVyLmVtaXQsIHRoaXMuX2V2ZW50RW1pdHRlcik7XHJcbiAgICB0aGlzLmdvbGRlbkxheW91dC5kZXN0cm95KCk7XHJcbiAgICB0aGlzLmdvbGRlbkxheW91dCA9IG51bGw7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGluaXRpYWxpemVHb2xkZW5MYXlvdXQobGF5b3V0OiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMuZ29sZGVuTGF5b3V0ID0gbmV3IEdvbGRlbkxheW91dChsYXlvdXQsICQodGhpcy5lbC5uYXRpdmVFbGVtZW50KSk7XHJcbiAgICBjb25zdCBvcmlnUG9wb3V0ID0gdGhpcy5nb2xkZW5MYXlvdXQuY3JlYXRlUG9wb3V0LmJpbmQodGhpcy5nb2xkZW5MYXlvdXQpO1xyXG4gICAgdGhpcy5nb2xkZW5MYXlvdXQuY3JlYXRlUG9wb3V0ID0gKGl0ZW06IEdvbGRlbkxheW91dC5Db250ZW50SXRlbSwgZGltLCBwYXJlbnQsIGluZGV4KSA9PiB7XHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBUcmF2ZXJzZSB0aGUgY29tcG9uZW50IHRyZWUgYmVsb3cgdGhlIGl0ZW0gd2UncmUgdHJ5aW5nIHRvIHBvcCBvdXQuXHJcbiAgICAgICAqIFRoaXMgaGFzIGJhc2ljYWxseSB0d28gY2FzZXM6XHJcbiAgICAgICAqIGEpIHdlIGhhdmUgYSBjb21wb25lbnQgdG8gcG9wb3V0IChvciBlbmQgdXAgYXQgYSBjb21wb25lbnQgc29tZXdoZW4pXHJcbiAgICAgICAqICAgIGZvciBjb21wb25lbnRzLCBjb250ZW50SXRlbXMgaXMgZWl0aGVyIHVuZGVmaW5lZCBvciBlbXB0eSwgc28gaWdub3JlIGl0XHJcbiAgICAgICAqICAgIGR1cmluZyB0aGUgY2hpbGRyZW4gcHVzaC5cclxuICAgICAgICogICAgaG93ZXZlciwgZm9yIGNvbXBvbmVudHMsIHdlIG5lZWQgdG8gY2hlY2sgZm9yIGdsT25Qb3BvdXQgYW5kIGNhbGwgaXQuXHJcbiAgICAgICAqIGIpIGV2ZXJ5dGhpbmcgZWxzZSwgd2hlcmUgY29udGVudEl0ZW1zIGlzIGEgbm9uLWVtcHR5IGFycmF5LlxyXG4gICAgICAgKiAgICBGb3IgdGhlc2UgcGFydHMsIHdlIG5lZWQgdG8gY29uc2lkZXIgYWxsIGNoaWxkcmVuIHJlY3Vyc2l2ZWx5LlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBIZXJlLCBhbiBpdGVyYXRpdmUgYWxnb3JpdGhtIHdhcyBjaG9zZW4uXHJcbiAgICAgICAqL1xyXG4gICAgICBjb25zdCByZWMgPSBbaXRlbV07XHJcbiAgICAgIHdoaWxlKHJlYy5sZW5ndGgpIHtcclxuICAgICAgICBjb25zdCBpdGVtVG9Qcm9jZXNzID0gcmVjLnNoaWZ0KCk7XHJcbiAgICAgICAgaWYgKGl0ZW1Ub1Byb2Nlc3MuY29udGVudEl0ZW1zICYmIGl0ZW1Ub1Byb2Nlc3MuY29udGVudEl0ZW1zLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIHJlYy5wdXNoKC4uLml0ZW1Ub1Byb2Nlc3MuY29udGVudEl0ZW1zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGl0ZW1Ub1Byb2Nlc3MuaXNDb21wb25lbnQpIHtcclxuICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IChpdGVtVG9Qcm9jZXNzIGFzIGFueSkuY29udGFpbmVyLl9fbmdDb21wb25lbnQ7XHJcbiAgICAgICAgICBpZiAoY29tcG9uZW50ICYmIGltcGxlbWVudHNHbE9uUG9wb3V0KGNvbXBvbmVudCkpIHtcclxuICAgICAgICAgICAgY29tcG9uZW50LmdsT25Qb3BvdXQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG9yaWdQb3BvdXQoaXRlbSwgZGltLCBwYXJlbnQsIGluZGV4KTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogYnVpbGRDb21wb25lbnRNYXAgY3JlYXRlcyBhbiBvYmplY3Qgb2YgYWxsIG9wZW5lZCBjb21wb25lbnRzIGJlbG93IHRoZSBnaXZlbiBpdGVtLlxyXG4gICAgICogb2JqZWN0IGtleXMgYXJlIGNvbXBvbmVudCBJRHMsIG9iamVjdCB2YWx1ZXMgdGhlIGNvbXBvbmVudCB3aXRoIHRoZSBJRC5cclxuICAgICAqL1xyXG4gICAgY29uc3QgYnVpbGRDb21wb25lbnRNYXAgPSAoaXRlbTogR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtKSA9PiB7XHJcbiAgICAgIGxldCByZXQgPSB7fTtcclxuICAgICAgZm9yIChjb25zdCBjaSBvZiBpdGVtLmNvbnRlbnRJdGVtcykge1xyXG4gICAgICAgIGlmIChjaS5pc0NvbXBvbmVudCkge1xyXG4gICAgICAgICAgaWYgKGNpLmNvbmZpZyAmJiAoY2kuY29uZmlnIGFzIGFueSkuY29tcG9uZW50U3RhdGUgJiYgKGNpLmNvbmZpZyBhcyBhbnkpLmNvbXBvbmVudFN0YXRlLm9yaWdpbmFsSWQpIHtcclxuICAgICAgICAgICAgLy8gU2tpcCB0aGUgZHVtbXkgY29tcG9uZW50c1xyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldFtjaS5pZF0gPSBjaTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0ID0geyAuLi5yZXQsIC4uLmJ1aWxkQ29tcG9uZW50TWFwKGNpKSB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmV0O1xyXG4gICAgfTtcclxuICAgICh0aGlzLmdvbGRlbkxheW91dCBhcyBhbnkpLl9nZXRBbGxDb21wb25lbnRzID0gKCkgPT4gYnVpbGRDb21wb25lbnRNYXAodGhpcy5nb2xkZW5MYXlvdXQucm9vdCk7XHJcbiAgICAodGhpcy5nb2xkZW5MYXlvdXQgYXMgYW55KS5nZW5lcmF0ZUFuZE1heGltaXNlRHVtbXlTdGFjayA9IChwYXJlbnQsIGl0ZW0pID0+IHtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIFRoaXMgZnVuY3Rpb24gY3JlYXRlcyBhIGR1bW15IHN0YWNrLCB3aGljaCBpcyBiZWluZyB1c2VkIGlmICdtYXhpbWlzZUFsbEl0ZW1zJyBpcyB0cnVlLlxyXG4gICAgICAgKiBUaGUgZHVtbXkgc3RhY2sgY29udGFpbnMgYSBkdW1teSBjb21wb25lbnQgZm9yIGVhY2ggY29tcG9uZW50IG9wZW5lZCBpbiB0aGUgcmVhbCBsYXlvdXQuXHJcbiAgICAgICAqIEl0IHdpbGwgZnVydGhlcm1vcmUgdHJhY2sgY29tcG9uZW50IGNsb3Nlcy9zcGF3bnMgYW5kIGNyZWF0ZS9jbG9zZSB0aGUgZHVtbXkgY29tcG9uZW50cyBhY2NvcmRpbmdseS5cclxuICAgICAgICogcGFyZW50IGlzIHRoZSBwYXJlbnQgb2YgdGhlIGl0ZW0gd2Ugd2FudCB0byBtYXhpbWlzZVxyXG4gICAgICAgKiBpdGVtIGlzIHRoZSBpdGVtIHdoaWNoIHdhcyBhY3RpdmUgd2hlbiB3ZSB3YW50ZWQgdG8gbWF4aW1pc2UgaXQuXHJcbiAgICAgICAqIHJlcXVpcmVkIHRvIHNldCB0aGUgYWN0aXZlIGl0ZW0gaW5kZXguXHJcbiAgICAgICAqL1xyXG4gICAgICBjb25zdCBvcGVuZWRDb21wb25lbnRzID0gYnVpbGRDb21wb25lbnRNYXAodGhpcy5nb2xkZW5MYXlvdXQucm9vdCk7XHJcbiAgICAgIGNvbnN0IGNvbXBvbmVudElkTGlzdCA9IE9iamVjdC5rZXlzKG9wZW5lZENvbXBvbmVudHMpO1xyXG4gICAgICBpZiAoY29tcG9uZW50SWRMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybjsgLy8gSG93IGRpZCB3ZSBnZXQgaGVyZT8hXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFdlIG9ubHkgaGF2ZSBhIHNpbmdsZSBjaGlsZCwgc28gd2UgcmVzdG9yZSB0aGUgb3JpZ2luYWwgYmVoYXZpb3JcclxuICAgICAgY29uc3Qgcm9vdENvbnRlbnRJdGVtID0gdGhpcy5nb2xkZW5MYXlvdXQucm9vdC5jb250ZW50SXRlbXNbMF07XHJcbiAgICAgIGlmIChyb290Q29udGVudEl0ZW0uaXNTdGFjaykge1xyXG4gICAgICAgIHJvb3RDb250ZW50SXRlbS50b2dnbGVNYXhpbWlzZSgpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEF0IHRoaXMgcG9pbnQsIHRoZXJlIGFyZSBhdCBsZWFzdCB0d28gY2hpbGRyZW4sIHNvIHVzZSB0aGUgZHVtbXkgY29tcG9uZW50LlxyXG4gICAgICAgKi9cclxuICAgICAgY29uc3QgY29uZmlnID0ge1xyXG4gICAgICAgIHR5cGU6ICdzdGFjaycsXHJcbiAgICAgICAgY29udGVudDogY29tcG9uZW50SWRMaXN0Lm1hcChrID0+ICh7XHJcbiAgICAgICAgICB0eXBlOiAnY29tcG9uZW50JyxcclxuICAgICAgICAgIGNvbXBvbmVudE5hbWU6ICdnbC13cmFwcGVyJyxcclxuICAgICAgICAgIHRpdGxlOiBvcGVuZWRDb21wb25lbnRzW2tdLmNvbmZpZy50aXRsZSxcclxuICAgICAgICAgIHJlb3JkZXJFbmFibGVkOiBmYWxzZSxcclxuICAgICAgICAgIGNvbXBvbmVudFN0YXRlOiB7XHJcbiAgICAgICAgICAgIG9yaWdpbmFsSWQ6IGssIC8vIHBhc3MgaW4gdGhlIElEIG9mIHRoZSBvcmlnaW5hbCBjb21wb25lbnQgYXMgcGFyYW1ldGVyLlxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9KSksXHJcbiAgICAgICAgaXNDbG9zYWJsZTogZmFsc2UsXHJcbiAgICAgICAgaXNEdW1teTogdHJ1ZSxcclxuICAgICAgICBzdGF0ZTogJ2R1bW15JyxcclxuICAgICAgICBhY3RpdmVJdGVtSW5kZXg6IGNvbXBvbmVudElkTGlzdC5maW5kSW5kZXgoaiA9PiBqID09PSAoaXRlbSB8fCBwYXJlbnQuX2FjdGl2ZUNvbnRlbnRJdGVtLmlkKSksXHJcbiAgICAgIH1cclxuICAgICAgLy8gYWRkIHRoaXMgaXRlbSBhcyBmaXJzdCBjaGlsZCBldmVyLCBjYXVzaW5nIGdvbGRlbi1sYXlvdXQgdG8gY3JlYXRlIGEgc3RhY2sgb2JqZWN0XHJcbiAgICAgIHJvb3RDb250ZW50SXRlbS5hZGRDaGlsZChjb25maWcsIDApO1xyXG5cclxuICAgICAgLy8gRmV0Y2ggdGhlIHN0YWNrXHJcbiAgICAgIGNvbnN0IG15U3RhY2sgPSByb290Q29udGVudEl0ZW0uY29udGVudEl0ZW1zWzBdIGFzIEdvbGRlbkxheW91dC5Db250ZW50SXRlbTtcclxuICAgICAgLy8gU2V0dXAgYW4gX193cmFwcGVyTWF4aW1pc2VkSXRlbUlkIGluIG9yZGVyIHRvIHNldEFjdGl2ZUNvbnRlbnRJdGVtIG9uIHRoZSB1bmRlcmx5aW5nIHN0YWNrIGxhdGVyLlxyXG4gICAgICAodGhpcy5nb2xkZW5MYXlvdXQgYXMgYW55KS5fX3dyYXBwZXJNYXhpbWlzZWRJdGVtSWQgPSBwYXJlbnQuX2FjdGl2ZUNvbnRlbnRJdGVtLmlkO1xyXG4gICAgICAobXlTdGFjayBhcyBhbnkpLmFjdGl2ZUNvbnRlbnRJdGVtJC5zdWJzY3JpYmUoKGNpKSA9PiB7XHJcbiAgICAgICAgLy8gU2V0dXAgdGhlIF9fd3JhcHBlck1heGltaXNlZEl0ZW1JZCBsYXRlcm9uLlxyXG4gICAgICAgICh0aGlzLmdvbGRlbkxheW91dCBhcyBhbnkpLl9fd3JhcHBlck1heGltaXNlZEl0ZW1JZCA9IGNpLmNvbmZpZy5jb21wb25lbnRTdGF0ZS5vcmlnaW5hbElkO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnN0IHRlYXJkb3duJCA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgICAgIG15U3RhY2sub24oJ21pbmltaXNlZCcsICgpID0+IHtcclxuICAgICAgICAvLyBEdW1teSBzdGFjayB3YXMgbWluaW1pc2VkLCBzbyBlbmZvcmNlIGFsbCBkdW1teSBjb21wb25lbnRzIHRvIGJlIGRpc3Bvc2VkXHJcbiAgICAgICAgLy8gYW5kIGRpc3Bvc2UgdGhlIGR1bW15IHN0YWNrIGFzIHdlbGwuXHJcbiAgICAgICAgKHRoaXMuZ29sZGVuTGF5b3V0IGFzIGFueSkuX193cmFwcGVyTWF4aW1pc2VkSXRlbUlkID0gbnVsbDtcclxuICAgICAgICB0ZWFyZG93biQubmV4dCgpO1xyXG4gICAgICAgIHRlYXJkb3duJC5jb21wbGV0ZSgpO1xyXG4gICAgICAgIG15U3RhY2sucmVtb3ZlKClcclxuICAgICAgfSk7XHJcbiAgICAgIC8vIE1heGltaXNlIHRoZSBkdW1teSBzdGFjay5cclxuICAgICAgbXlTdGFjay50b2dnbGVNYXhpbWlzZSgpO1xyXG5cclxuICAgICAgLy8gV2hlbmV2ZXIgYSB0YWIgaXMgYmVpbmcgY3JlYXRlZCBvciBjbG9zZWQsIHBlcmZvcm0gYSBkaWZmIGFsZ29yaXRobVxyXG4gICAgICAvLyBvbiB0aGUgYWN0aXZlIHRhYnMgbGlzdCBhbmQgY3JlYXRlIG9yIGRlbGV0ZSB0aGUgZHVtbXkgdGFicy5cclxuICAgICAgdGhpcy50YWJzTGlzdC5waXBlKFxyXG4gICAgICAgIHRha2VVbnRpbCh0ZWFyZG93biQpLFxyXG4gICAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKChhLCBiKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBrZXlzQSA9IE9iamVjdC5rZXlzKGEpO1xyXG4gICAgICAgICAgY29uc3Qga2V5c0IgPSBuZXcgU2V0KE9iamVjdC5rZXlzKGIpKTtcclxuICAgICAgICAgIHJldHVybiBrZXlzQS5sZW5ndGggPT09IGtleXNCLnNpemUgJiYga2V5c0EuZXZlcnkoa2V5ID0+IGtleXNCLmhhcyhrZXkpKTtcclxuICAgICAgICB9KSxcclxuICAgICAgKS5zdWJzY3JpYmUodGFyZ2V0U3RhdGUgPT4ge1xyXG4gICAgICAgIGNvbnN0IHdvcmtpbmdDb3B5ID0geyAuLi50YXJnZXRTdGF0ZSB9O1xyXG4gICAgICAgIGNvbnN0IHRhYnMgPSBuZXcgU2V0KE9iamVjdC5rZXlzKHdvcmtpbmdDb3B5KSk7XHJcbiAgICAgICAgLy8gY3VycmVudGx5IG9wZW5lZCB0YWJzXHJcbiAgICAgICAgY29uc3Qgb3BlbmVkVGFicyA9IG5ldyBTZXQobXlTdGFjay5jb250ZW50SXRlbXMubWFwKGNpID0+IHtcclxuICAgICAgICAgIHJldHVybiAoY2kuY29uZmlnIGFzIGFueSkuY29tcG9uZW50U3RhdGUub3JpZ2luYWxJZDtcclxuICAgICAgICB9KSk7XHJcbiAgICAgICAgZm9yIChjb25zdCBrZXkgb2YgdGFicykge1xyXG4gICAgICAgICAgaWYgKG9wZW5lZFRhYnMuaGFzKGtleSkpIHtcclxuICAgICAgICAgICAgLy8gaXRlbSBpcyBib3RoIGN1cnJlbnRseSBvcGVuZWQgaW4gZHVtbXkgYW5kIGJhY2tncm91bmQsIG5vdGhpbmcgdG8gZG9cclxuICAgICAgICAgICAgb3BlbmVkVGFicy5kZWxldGUoa2V5KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGl0ZW0gaXMgbm90IG9wZW5lZCBpbiBkdW1teSwgY3JlYXRlIGEgY29tcG9uZW50XHJcbiAgICAgICAgICAgIG15U3RhY2suYWRkQ2hpbGQoe1xyXG4gICAgICAgICAgICAgIHR5cGU6ICdjb21wb25lbnQnLFxyXG4gICAgICAgICAgICAgIGNvbXBvbmVudE5hbWU6ICdnbC13cmFwcGVyJyxcclxuICAgICAgICAgICAgICB0aXRsZTogdGFyZ2V0U3RhdGVba2V5XS5jb25maWcudGl0bGUsXHJcbiAgICAgICAgICAgICAgcmVvcmRlckVuYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgIGNvbXBvbmVudFN0YXRlOiB7XHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbElkOiBrZXksXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSBhcyBhbnkpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFRoZSByZW1haW5pbmcgdGFicyBhcmUgb3BlbmVkIGluIHRoZSBkdW1teSBidXQgbm90IGluIHRoZSBiYWNrZ3JvdW5kLCBzbyBjbG9zZSB0aGUgZHVtbXkuXHJcbiAgICAgICAgZm9yIChjb25zdCB0YWIgb2Ygb3BlbmVkVGFicykge1xyXG4gICAgICAgICAgY29uc3QgdGFiT2JqID0gbXlTdGFjay5jb250ZW50SXRlbXMuZmluZChqID0+IChqLmNvbmZpZyBhcyBhbnkpLmNvbXBvbmVudFN0YXRlLm9yaWdpbmFsSWQgPT09IHRhYik7XHJcbiAgICAgICAgICB0YWJPYmoucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5nb2xkZW5MYXlvdXQub24oJ3BvcEluJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLnBvcHBlZEluID0gdHJ1ZTtcclxuICAgICAgdGhpcy5vcGVuZWRDb21wb25lbnRzLmZvckVhY2goYyA9PiB7XHJcbiAgICAgICAgaWYgKGltcGxlbWVudHNHbE9uUG9waW4oYykpIHtcclxuICAgICAgICAgIGMuZ2xPblBvcGluKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE92ZXJ3cml0ZSB0aGUgJ2dldENvbXBvbmVudCcgbWV0aG9kIHRvIGR5bmFtaWNhbGx5IHJlc29sdmUgSlMgY29tcG9uZW50cy5cclxuICAgIC8vIFdlIG5lZWQgdG8gZG8gdGhpcywgYmVjYXVzZSB0aGUgY29tcG9uZW50IG1hcCBpcyBub3QgZmxleGlibGUgZW5vdWdoIGZvciB1cyBzaW5jZSB3ZSBjYW4gZHluYW1pY2FsbHkgY2hhaW5sb2FkIHBsdWdpbnMuXHJcbiAgICB0aGlzLmdvbGRlbkxheW91dC5nZXRDb21wb25lbnQgPSAodHlwZSkgPT4ge1xyXG4gICAgICBpZiAoaXNEZXZNb2RlKCkpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhgUmVzb2x2aW5nIGNvbXBvbmVudCAke3R5cGV9YCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXMuYnVpbGRDb25zdHJ1Y3Rvcih0eXBlKTtcclxuICAgIH07XHJcbiAgICB0aGlzLmdvbGRlbkxheW91dC5vbignc3RhY2tDcmVhdGVkJywgKHN0YWNrKSA9PiB7XHJcbiAgICAgIGNvbnN0IGN1c3RvbUhlYWRlckVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xyXG4gICAgICBjdXN0b21IZWFkZXJFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2N1c3RvbS1oZWFkZXInKTtcclxuICAgICAgY3VzdG9tSGVhZGVyRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICBjb25zdCBjdHIgPSBzdGFjay5oZWFkZXIuY29udHJvbHNDb250YWluZXJbMF0gYXMgSFRNTFVMaXN0RWxlbWVudDtcclxuICAgICAgbGV0IGVsZW1lbnQ6IENvbXBvbmVudFJlZjxhbnk+ID0gbnVsbDtcclxuXHJcbiAgICAgIGN0ci5wcmVwZW5kKGN1c3RvbUhlYWRlckVsZW1lbnQpO1xyXG5cclxuICAgICAgY29uc3QgZGlzcG9zZUNvbnRyb2wgPSAoKSA9PiB7XHJcbiAgICAgICAgY3VzdG9tSGVhZGVyRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIGlmIChlbGVtZW50KSB7XHJcbiAgICAgICAgICBjdXN0b21IZWFkZXJFbGVtZW50LmNoaWxkTm9kZXMuZm9yRWFjaChlID0+IGN1c3RvbUhlYWRlckVsZW1lbnQucmVtb3ZlQ2hpbGQoZSkpO1xyXG4gICAgICAgICAgZWxlbWVudC5kZXN0cm95KCk7XHJcbiAgICAgICAgICBlbGVtZW50ID0gbnVsbDtcclxuICAgICAgICAgIHN0YWNrLmhlYWRlci5fdXBkYXRlVGFiU2l6ZXMoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIGNvbnN0IGJvb3RzdHJhcENvbXBvbmVudCA9IChjdDogVHlwZTxhbnk+LCB0b2tlbnM6IFN0YXRpY1Byb3ZpZGVyW10sIGluamVjdG9yOiBJbmplY3RvcikgPT4ge1xyXG4gICAgICAgIGlmIChlbGVtZW50KSB7XHJcbiAgICAgICAgICBkaXNwb3NlQ29udHJvbCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjdXN0b21IZWFkZXJFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnJztcclxuICAgICAgICBjb25zdCBmYWN0b3J5ID0gdGhpcy5jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkoY3QpO1xyXG4gICAgICAgIGNvbnN0IGhlYWRlckluamVjdG9yID0gSW5qZWN0b3IuY3JlYXRlKHRva2VucywgaW5qZWN0b3IpO1xyXG4gICAgICAgIGVsZW1lbnQgPSB0aGlzLnZpZXdDb250YWluZXIuY3JlYXRlQ29tcG9uZW50KGZhY3RvcnksIHVuZGVmaW5lZCwgaGVhZGVySW5qZWN0b3IpO1xyXG4gICAgICAgIGN1c3RvbUhlYWRlckVsZW1lbnQucHJlcGVuZChlbGVtZW50LmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQpO1xyXG4gICAgICAgIHN0YWNrLmhlYWRlci5fdXBkYXRlVGFiU2l6ZXMoKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIFdhaXQgdW50aWwgdGhlIGNvbnRlbnQgaXRlbSBpcyBsb2FkZWQgYW5kIGRvbmVcclxuICAgICAgc3RhY2suYWN0aXZlQ29udGVudEl0ZW0kLnBpcGUoXHJcbiAgICAgICAgc3dpdGNoTWFwKChjb250ZW50SXRlbTogR29sZGVuTGF5b3V0LkNvbnRlbnRJdGVtKSA9PiB7XHJcbiAgICAgICAgICBpZiAoIWNvbnRlbnRJdGVtIHx8ICFjb250ZW50SXRlbS5pc0NvbXBvbmVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gb2YobnVsbCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gKGNvbnRlbnRJdGVtIGFzIGFueSkuaW5zdGFuY2UgfHwgb2YobnVsbCk7XHJcbiAgICAgICAgfSksIHN3aXRjaE1hcCgoY3I6IENvbXBvbmVudFJlZjxhbnk+IHwgbnVsbCkgPT4ge1xyXG4gICAgICAgICAgaWYgKCFjcikge1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoW251bGwsIG51bGwsIG51bGxdKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnN0IGluc3QgPSBjci5pbnN0YW5jZS5oZWFkZXJDb21wb25lbnQ7XHJcbiAgICAgICAgICBjb25zdCB0b2tlbnMgPSBjci5pbnN0YW5jZS5hZGRpdGlvbmFsVG9rZW5zO1xyXG4gICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFtcclxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKGluc3QpLFxyXG4gICAgICAgICAgICBQcm9taXNlLnJlc29sdmUodG9rZW5zKSxcclxuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKGNyKVxyXG4gICAgICAgICAgXSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgKS5zdWJzY3JpYmUoKFtoZWFkZXIsIHRva2VucywgY29tcG9uZW50UmVmXSkgPT4ge1xyXG4gICAgICAgIC8vIFRoaXMgaXMgdGhlIGN1cnJlbnRseSB2aXNpYmxlIGNvbnRlbnQgaXRlbSwgYWZ0ZXIgaXQncyBsb2FkZWQuXHJcbiAgICAgICAgLy8gVGhlcmVmb3JlLCB3ZSBjYW4gY2hlY2sgd2hldGhlciAoYW5kIHdoYXQpIHRvIHJlbmRlciBhcyBoZWFkZXIgY29tcG9uZW50IGhlcmUuXHJcbiAgICAgICAgaWYgKCFoZWFkZXIgfHwgIWNvbXBvbmVudFJlZikge1xyXG4gICAgICAgICAgZGlzcG9zZUNvbnRyb2woKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYm9vdHN0cmFwQ29tcG9uZW50KFxyXG4gICAgICAgICAgICBoZWFkZXIsXHJcbiAgICAgICAgICAgIHRva2VucyB8fCBbXSxcclxuICAgICAgICAgICAgY29tcG9uZW50UmVmLmluamVjdG9yXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSwgZGlzcG9zZUNvbnRyb2wsIGRpc3Bvc2VDb250cm9sKTtcclxuICAgIH0pO1xyXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgbGF5b3V0LlxyXG4gICAgdGhpcy5nb2xkZW5MYXlvdXQub24oJ2luaXRpYWxpc2VkJywgKCkgPT4ge1xyXG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcclxuICAgICAgICBpZiAobGF5b3V0Lm1heGltaXNlZEl0ZW1JZCkge1xyXG4gICAgICAgICAgY29uc3QgYyA9IEdldENvbXBvbmVudEZyb21MYXlvdXRNYW5hZ2VyKHRoaXMuZ29sZGVuTGF5b3V0LCBsYXlvdXQubWF4aW1pc2VkSXRlbUlkKTtcclxuICAgICAgICAgIGlmIChjKSB7XHJcbiAgICAgICAgICAgICh0aGlzLmdvbGRlbkxheW91dCBhcyBhbnkpLmdlbmVyYXRlQW5kTWF4aW1pc2VEdW1teVN0YWNrKGMucGFyZW50LCBsYXlvdXQubWF4aW1pc2VkSXRlbUlkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgICB0aGlzLmdvbGRlbkxheW91dC5pbml0KCk7XHJcbiAgICB0aGlzLmdvbGRlbkxheW91dC5vbignc3RhdGVDaGFuZ2VkJywgdGhpcy5wdXNoU3RhdGVDaGFuZ2UpO1xyXG4gICAgdGhpcy5nb2xkZW5MYXlvdXQub24oJ2l0ZW1EcmFnZ2VkJywgdGhpcy5wYXVzZVN0YXRlQ2hhbmdlKTtcclxuICAgIHRoaXMuZ29sZGVuTGF5b3V0Lm9uKCdpdGVtRHJvcHBlZCcsIHRoaXMucmVzdW1lU3RhdGVDaGFuZ2UpO1xyXG4gICAgdGhpcy5nb2xkZW5MYXlvdXQub24oJ3RhYkFjdGl2YXRlZCcsIHRoaXMucHVzaFRhYkFjdGl2YXRlZCk7XHJcbiAgICB0aGlzLmdvbGRlbkxheW91dC5vbihsbS5fX2xtLnV0aWxzLkV2ZW50RW1pdHRlci5BTExfRVZFTlQsIHRoaXMuX2V2ZW50RW1pdHRlci5lbWl0LCB0aGlzLl9ldmVudEVtaXR0ZXIpO1xyXG4gICAgdGhpcy5fZXZlbnRFbWl0dGVyLmVtaXQoJ2luaXRpYWxpc2VkJyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBCdWlsZCBhICd2aXJ0dWFsJyBjb25zdHJ1Y3RvciB3aGljaCBpcyB1c2VkIHRvIHBhc3MgdGhlIGNvbXBvbmVudHMgdG8gZ29sZGVuTGF5b3V0XHJcbiAgICogQHBhcmFtIGNvbXBvbmVudFR5cGVcclxuICAgKi9cclxuICBwcml2YXRlIGJ1aWxkQ29uc3RydWN0b3IoY29tcG9uZW50TmFtZTogc3RyaW5nKTogQ29tcG9uZW50SW5pdENhbGxiYWNrIHtcclxuICAgIC8vIENhbid0IHVzZSBhbiBFUzYgbGFtYmRhIGhlcmUsIHNpbmNlIGl0IGlzIG5vdCBhIGNvbnN0cnVjdG9yXHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHJldHVybiBmdW5jdGlvbiAoY29udGFpbmVyOiBHb2xkZW5MYXlvdXQuQ29udGFpbmVyLCBjb21wb25lbnRTdGF0ZTogYW55KSB7XHJcbiAgICAgIGNvbnN0IGdsQ29tcG9uZW50ID0gY29udGFpbmVyLnBhcmVudDtcclxuICAgICAgaWYgKGdsQ29tcG9uZW50LmNvbmZpZy5pZCkge1xyXG4gICAgICAgIGdsQ29tcG9uZW50LmlkID0gZ2xDb21wb25lbnQuY29uZmlnLmlkIGFzIHN0cmluZztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBnbENvbXBvbmVudC5pZCA9IHV1aWQoKTtcclxuICAgICAgICBnbENvbXBvbmVudC5jb25maWcuaWQgPSBnbENvbXBvbmVudC5pZDtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZCA9IG5ldyBEZWZlcnJlZDxhbnk+KCk7XHJcbiAgICAgIHNlbGYubmdab25lLnJ1bigoKSA9PiB7XHJcbiAgICAgICAgLy8gV2FpdCB1bnRpbCB0aGUgY29tcG9uZW50IHJlZ2lzdHJ5IGNhbiBwcm92aWRlIGEgdHlwZSBmb3IgdGhlIGNvbXBvbmVudFxyXG4gICAgICAgIC8vIFRCRDogTWF5YmUgYWRkIGEgdGltZW91dCBoZXJlP1xyXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudFByb21pc2UgPSBzZWxmLmNvbXBvbmVudFJlZ2lzdHJ5LndhaXRGb3JDb21wb25lbnQoY29tcG9uZW50TmFtZSk7XHJcbiAgICAgICAgY29tcG9uZW50UHJvbWlzZS50aGVuKChjb21wb25lbnRUeXBlKSA9PiB7XHJcbiAgICAgICAgICAvLyBXZSBnb3Qgb3VyIGNvbXBvbmVudCB0eXBlXHJcbiAgICAgICAgICBpZiAoaXNEZXZNb2RlKCkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYENvbXBvbmVudCAke2NvbXBvbmVudE5hbWV9IHJldHVybmVkIGZyb20gY29tcG9uZW50UmVnaXN0cnlgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgYW5ndWxhciBjb21wb25lbnQuXHJcbiAgICAgICAgICBjb25zdCBmYWN0b3J5ID0gc2VsZi5jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkoY29tcG9uZW50VHlwZSk7XHJcbiAgICAgICAgICBsZXQgZmFpbGVkQ29tcG9uZW50OiBzdHJpbmcgPSBudWxsO1xyXG4gICAgICAgICAgaWYgKGNvbXBvbmVudFR5cGUgPT09IHNlbGYuZmFsbGJhY2tDb21wb25lbnQpIHtcclxuICAgICAgICAgICAgLy8gRmFpbGVkIHRvIGZpbmQgdGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciAqKkFORCoqIHdlIGhhdmUgYSBmYWxsYmFjayBjb21wb25lbnQgZGVmaW5lZCxcclxuICAgICAgICAgICAgLy8gc28gbG9va3VwIHRoZSBmYWlsZWQgY29tcG9uZW50J3MgbmFtZSBhbmQgaW5qZWN0IGl0IGludG8gdGhlIGZhbGxiYWNrIGNvbXBvbmVudC5cclxuICAgICAgICAgICAgZmFpbGVkQ29tcG9uZW50ID0gKGNvbnRhaW5lciBhcyBhbnkpLl9jb25maWcuY29tcG9uZW50TmFtZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnN0IGluamVjdG9yID0gc2VsZi5fY3JlYXRlQ29tcG9uZW50SW5qZWN0b3IoY29udGFpbmVyLCBjb21wb25lbnRTdGF0ZSwgZmFpbGVkQ29tcG9uZW50KTtcclxuICAgICAgICAgIGNvbnN0IGNvbXBvbmVudFJlZiA9IHNlbGYudmlld0NvbnRhaW5lci5jcmVhdGVDb21wb25lbnQoZmFjdG9yeSwgdW5kZWZpbmVkLCBpbmplY3Rvcik7XHJcblxyXG4gICAgICAgICAgLy8gQmluZCB0aGUgbmV3IGNvbXBvbmVudCB0byBjb250YWluZXIncyBjbGllbnQgRE9NIGVsZW1lbnQuXHJcbiAgICAgICAgICBjb250YWluZXIuZ2V0RWxlbWVudCgpLmFwcGVuZCgkKGNvbXBvbmVudFJlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50KSk7XHJcbiAgICAgICAgICBzZWxmLl9iaW5kRXZlbnRIb29rcyhjb250YWluZXIsIGNvbXBvbmVudFJlZi5pbnN0YW5jZSk7XHJcbiAgICAgICAgICAoY29udGFpbmVyIGFzIGFueSkuX19uZ0NvbXBvbmVudCA9IGNvbXBvbmVudFJlZi5pbnN0YW5jZTtcclxuICAgICAgICAgIHNlbGYub3BlbmVkQ29tcG9uZW50cy5wdXNoKGNvbXBvbmVudFJlZi5pbnN0YW5jZSk7XHJcbiAgICAgICAgICBsZXQgZGVzdHJveWVkID0gZmFsc2U7XHJcbiAgICAgICAgICBjb25zdCBkZXN0cm95Rm4gPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghZGVzdHJveWVkKSB7XHJcbiAgICAgICAgICAgICAgZGVzdHJveWVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICBzZWxmLm9wZW5lZENvbXBvbmVudHMgPSBzZWxmLm9wZW5lZENvbXBvbmVudHMuZmlsdGVyKGkgPT4gaSAhPT0gY29tcG9uZW50UmVmLmluc3RhbmNlKTtcclxuICAgICAgICAgICAgICAkKGNvbXBvbmVudFJlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50KS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICBjb21wb25lbnRSZWYuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIC8vIExpc3RlbiB0byBjb250YWluZXJEZXN0cm95IGFuZCB3aW5kb3cgYmVmb3JldW5sb2FkLCBwcmV2ZW50aW5nIGEgZG91YmxlLWRlc3Ryb3lcclxuICAgICAgICAgIGNvbnRhaW5lci5vbignZGVzdHJveScsIGRlc3Ryb3lGbik7XHJcbiAgICAgICAgICBzZWxmLm9uVW5sb2FkZWQucHJvbWlzZS50aGVuKGRlc3Ryb3lGbik7XHJcbiAgICAgICAgICBkLnJlc29sdmUoY29tcG9uZW50UmVmKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBkLnByb21pc2U7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbiBpbmplY3RvciBjYXBhYmxlIG9mIGluamVjdGluZyB0aGUgR29sZGVuTGF5b3V0IG9iamVjdCxcclxuICAgKiBjb21wb25lbnQgY29udGFpbmVyLCBhbmQgaW5pdGlhbCBjb21wb25lbnQgc3RhdGUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfY3JlYXRlQ29tcG9uZW50SW5qZWN0b3IoXHJcbiAgICBjb250YWluZXI6IEdvbGRlbkxheW91dC5Db250YWluZXIsXHJcbiAgICBjb21wb25lbnRTdGF0ZTogYW55LFxyXG4gICAgZmFpbGVkOiBzdHJpbmcgfCBudWxsLFxyXG4gICk6IEluamVjdG9yIHtcclxuICAgIGNvbnN0IHByb3ZpZGVycyA9IFtcclxuICAgICAge1xyXG4gICAgICAgIHByb3ZpZGU6IEdvbGRlbkxheW91dENvbnRhaW5lcixcclxuICAgICAgICB1c2VWYWx1ZTogY29udGFpbmVyLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgcHJvdmlkZTogR29sZGVuTGF5b3V0Q29tcG9uZW50U3RhdGUsXHJcbiAgICAgICAgdXNlVmFsdWU6IGNvbXBvbmVudFN0YXRlLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgcHJvdmlkZTogR29sZGVuTGF5b3V0RXZlbnRIdWIsXHJcbiAgICAgICAgdXNlVmFsdWU6IHRoaXMuZ29sZGVuTGF5b3V0LmV2ZW50SHViLFxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgcHJvdmlkZTogR29sZGVuTGF5b3V0Q29tcG9uZW50SG9zdCxcclxuICAgICAgICB1c2VWYWx1ZTogdGhpcyxcclxuICAgICAgfVxyXG4gICAgXTtcclxuICAgIGlmICghIWZhaWxlZCkge1xyXG4gICAgICBwcm92aWRlcnMucHVzaCh7XHJcbiAgICAgICAgcHJvdmlkZTogRmFpbGVkQ29tcG9uZW50LFxyXG4gICAgICAgIHVzZVZhbHVlOiBmYWlsZWQsXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIEluamVjdG9yLmNyZWF0ZShwcm92aWRlcnMsIHRoaXMuaW5qZWN0b3IpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVnaXN0ZXJzIGFuIGV2ZW50IGhhbmRsZXIgZm9yIGVhY2ggaW1wbGVtZW50ZWQgaG9vay5cclxuICAgKiBAcGFyYW0gY29udGFpbmVyIEdvbGRlbiBMYXlvdXQgY29tcG9uZW50IGNvbnRhaW5lci5cclxuICAgKiBAcGFyYW0gY29tcG9uZW50IEFuZ3VsYXIgY29tcG9uZW50IGluc3RhbmNlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX2JpbmRFdmVudEhvb2tzKGNvbnRhaW5lcjogR29sZGVuTGF5b3V0LkNvbnRhaW5lciwgY29tcG9uZW50OiBhbnkpOiB2b2lkIHtcclxuICAgIGlmIChpbXBsZW1lbnRzR2xPblJlc2l6ZShjb21wb25lbnQpKSB7XHJcbiAgICAgIGNvbnRhaW5lci5vbigncmVzaXplJywgKCkgPT4ge1xyXG4gICAgICAgIGNvbXBvbmVudC5nbE9uUmVzaXplKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpbXBsZW1lbnRzR2xPblNob3coY29tcG9uZW50KSkge1xyXG4gICAgICBjb250YWluZXIub24oJ3Nob3cnLCAoKSA9PiB7XHJcbiAgICAgICAgY29tcG9uZW50LmdsT25TaG93KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpbXBsZW1lbnRzR2xPbkhpZGUoY29tcG9uZW50KSkge1xyXG4gICAgICBjb250YWluZXIub24oJ2hpZGUnLCAoKSA9PiB7XHJcbiAgICAgICAgY29tcG9uZW50LmdsT25IaWRlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpbXBsZW1lbnRzR2xPblRhYihjb21wb25lbnQpKSB7XHJcbiAgICAgIGNvbnRhaW5lci5vbigndGFiJywgKHRhYikgPT4ge1xyXG4gICAgICAgIGNvbXBvbmVudC5nbE9uVGFiKHRhYik7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpbXBsZW1lbnRzR2xPbkNsb3NlKGNvbXBvbmVudCkpIHtcclxuICAgICAgY29uc3QgY29udGFpbmVyQ2xvc2UgPSBjb250YWluZXIuY2xvc2UuYmluZChjb250YWluZXIpO1xyXG4gICAgICBjb250YWluZXIuY2xvc2UgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCEoY29udGFpbmVyIGFzIGFueSkuX2NvbmZpZy5pc0Nsb3NhYmxlKSB7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbXBvbmVudC5nbE9uQ2xvc2UoKS50aGVuKCgpID0+IHtcclxuICAgICAgICAgIGNvbnRhaW5lckNsb3NlKCk7XHJcbiAgICAgICAgfSwgKCkgPT4geyAvKiBQcmV2ZW50IGNsb3NlLCBkb24ndCBjYXJlIGFib3V0IHJlamVjdGlvbnMgKi8gfSk7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==