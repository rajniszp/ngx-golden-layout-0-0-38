import { Injectable, Inject, Optional, Injector, ɵNgModuleFactory } from '@angular/core';
import { GoldenLayoutPluginDependency } from './config';
import { Deferred } from './deferred';
import { Subject } from 'rxjs';
import { PluginURLProvider } from './plugin-url.service';
;
export class MockPluginRegistryService {
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
export class PluginRegistryService {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luLXJlZ2lzdHJ5LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvbmd4LWdvbGRlbi1sYXlvdXQvc3JjLyIsInNvdXJjZXMiOlsibGliL3BsdWdpbi1yZWdpc3RyeS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQWUsZ0JBQWdCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdEcsT0FBTyxFQUFFLDRCQUE0QixFQUF3QixNQUFNLFVBQVUsQ0FBQztBQUM5RSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDL0IsT0FBTyxFQUFFLGlCQUFpQixFQUFjLE1BQU0sc0JBQXNCLENBQUM7QUFRcEUsQ0FBQztBQUdGLE1BQU0sT0FBTyx5QkFBeUI7SUFEdEM7UUFFUyxrQkFBYSxHQUFHLElBQUksT0FBTyxFQUE0QyxDQUFDO1FBQ3hFLG9CQUFlLEdBQUcsSUFBSSxPQUFPLEVBQVUsQ0FBQztJQU9qRCxDQUFDO0lBTkMsZUFBZTtRQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsdURBQXVELENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBQ0QsaUJBQWlCO1FBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyx1REFBdUQsQ0FBQyxDQUFDO0lBQzNFLENBQUM7OztZQVRGLFVBQVU7O0FBWVg7Ozs7O0dBS0c7QUFFSCxNQUFNLE9BQU8scUJBQXFCO0lBT2hDLFlBQ29ELE9BQStCLEVBQUUsRUFDM0UsV0FBOEIsRUFDOUIsUUFBa0I7UUFEbEIsZ0JBQVcsR0FBWCxXQUFXLENBQW1CO1FBQzlCLGFBQVEsR0FBUixRQUFRLENBQVU7UUFUcEIsMEJBQXFCLEdBQUcsSUFBSSxHQUFHLEVBQWUsQ0FBQztRQUMvQyxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUF3QixD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LENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFRLENBQUMsQ0FBQztRQUNsRCxNQUFNLENBQUMsSUFBSSxHQUFHLGlCQUFpQixDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2pCLENBQUMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRWxCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFTyxNQUFNLENBQUMsRUFBVTtRQUN2QixNQUFNO0lBQ1IsQ0FBQzs7O1lBbklGLFVBQVU7Ozt3Q0FTTixNQUFNLFNBQUMsNEJBQTRCLGNBQUcsUUFBUTtZQXJDMUMsaUJBQWlCO1lBSmEsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIEluamVjdCwgT3B0aW9uYWwsIEluamVjdG9yLCBOZ01vZHVsZVJlZiwgybVOZ01vZHVsZUZhY3RvcnkgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgR29sZGVuTGF5b3V0UGx1Z2luRGVwZW5kZW5jeSwgUGx1Z2luRGVwZW5kZW5jeVR5cGUgfSBmcm9tICcuL2NvbmZpZyc7XHJcbmltcG9ydCB7IERlZmVycmVkIH0gZnJvbSAnLi9kZWZlcnJlZCc7XHJcbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgUGx1Z2luVVJMUHJvdmlkZXIsIElQbHVnaW5VUkwgfSBmcm9tICcuL3BsdWdpbi11cmwuc2VydmljZSc7XHJcblxyXG5pbnRlcmZhY2UgSVBsdWdpblN0YXRlIHtcclxuICBpZDogc3RyaW5nLFxyXG4gIHVybDogc3RyaW5nLFxyXG4gIG1vZHVsZTogRGVmZXJyZWQ8YW55PixcclxuICBtb2R1bGVSZWY6IE5nTW9kdWxlUmVmPGFueT4sXHJcbiAgc2NyaXB0OiBIVE1MU2NyaXB0RWxlbWVudCxcclxufTtcclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIE1vY2tQbHVnaW5SZWdpc3RyeVNlcnZpY2Uge1xyXG4gIHB1YmxpYyBwbHVnaW5Mb2FkZWQkID0gbmV3IFN1YmplY3Q8eyBpZDogc3RyaW5nLCBtb2R1bGU6IE5nTW9kdWxlUmVmPGFueT4gfT4oKTtcclxuICBwdWJsaWMgcGx1Z2luVW5sb2FkZWQkID0gbmV3IFN1YmplY3Q8c3RyaW5nPigpO1xyXG4gIHN0YXJ0TG9hZFBsdWdpbigpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignTW9ja1BsdWdpblJlZ2lzdHJ5IGRvZXMgbm90IHN1cHBvcnQgbG9hZGluZy91bmxvYWRpbmcnKTtcclxuICB9XHJcbiAgc3RhcnRVbmxvYWRQbHVnaW4oKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ01vY2tQbHVnaW5SZWdpc3RyeSBkb2VzIG5vdCBzdXBwb3J0IGxvYWRpbmcvdW5sb2FkaW5nJyk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogVGhpcyBjbGFzcyBhdXRvbWF0ZXMgdGhlIGxvYWRpbmcgb2YgYnVuZGxlcyBidWlsdCB3aXRoIG5nLXBhY2thZ3IsXHJcbiAqIHJlZ2lzdGVyaW5nIHRoZSBjb21wb25lbnRzIHdpdGggR29sZGVuTGF5b3V0XHJcbiAqIFRoaXMgc2VydmljZSBNVVNUIGJlIGluc3RhbnRpYXRlZCBvbmNlIHBlciB3aW5kb3cgYW5kIGRlZmluZXMgdGhlICdwdWJsaWMnXHJcbiAqIEFQSSBmb3IgbG9hZGluZyBhbmQgdW5sb2FkaW5nIHBsdWdpbnMuXHJcbiAqL1xyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBQbHVnaW5SZWdpc3RyeVNlcnZpY2Uge1xyXG4gIHByaXZhdGUgYXZhaWxhYmxlRGVwZW5kZW5jaWVzID0gbmV3IE1hcDxzdHJpbmcsIGFueT4oKTtcclxuICBwcml2YXRlIGxvYWRlZFBsdWdpbnMgPSBuZXcgTWFwPHN0cmluZywgSVBsdWdpblN0YXRlPigpO1xyXG5cclxuICBwdWJsaWMgcGx1Z2luTG9hZGVkJCA9IG5ldyBTdWJqZWN0PHsgaWQ6IHN0cmluZywgbW9kdWxlOiBOZ01vZHVsZVJlZjxhbnk+IH0+KCk7XHJcbiAgcHVibGljIHBsdWdpblVubG9hZGVkJCA9IG5ldyBTdWJqZWN0PHN0cmluZz4oKTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBASW5qZWN0KEdvbGRlbkxheW91dFBsdWdpbkRlcGVuZGVuY3kpIEBPcHRpb25hbCgpIGRlcHM6IFBsdWdpbkRlcGVuZGVuY3lUeXBlW10gPSBbXSxcclxuICAgIHByaXZhdGUgdXJsUHJvdmlkZXI6IFBsdWdpblVSTFByb3ZpZGVyLFxyXG4gICAgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IsXHJcbiAgKSB7XHJcbiAgICBjb25zb2xlLmxvZygnQ3JlYXRpbmcgUGx1Z2luUmVnaXN0cnksIGdvdCcsIGRlcHMubGVuZ3RoLCAnYWRkaXRpb25hbCBkZXBlbmRlbmN5IG1vZHVsZXMnKTtcclxuICAgIGRlcHMuZm9yRWFjaCh4ID0+IHRoaXMuYXZhaWxhYmxlRGVwZW5kZW5jaWVzLnNldCh4Lm5hbWUsIHgubG9hZGVyKSk7XHJcblxyXG4gICAgdGhpcy5wYXRjaFdpbmRvdygpO1xyXG5cclxuICAgIHRoaXMudXJsUHJvdmlkZXIubG9hZFJlcXVlc3RzJCgpLnN1YnNjcmliZShwID0+IHRoaXMubG9hZChwKSk7XHJcbiAgICAvLyBMb2FkIGFsbCBwcmV2aW91c2x5IGxvYWRlZCBwbHVnaW5zXHJcbiAgICB0aGlzLnVybFByb3ZpZGVyLmFsbFBsdWdpbnMoKS5mb3JFYWNoKHAgPT4gdGhpcy5sb2FkKHApKTtcclxuICB9XHJcblxyXG4gIHN0YXJ0TG9hZFBsdWdpbihpZDogc3RyaW5nLCB1cmw6IHN0cmluZykge1xyXG4gICAgdGhpcy51cmxQcm92aWRlci5yZXF1ZXN0TG9hZChpZCwgdXJsKTtcclxuICB9XHJcbiAgc3RhcnRVbmxvYWRQbHVnaW4oaWQ6IHN0cmluZykge1xyXG4gICAgdGhpcy51cmxQcm92aWRlci5yZXF1ZXN0VW5sb2FkKGlkKTtcclxuICB9XHJcblxyXG4gIHdhaXRGb3JQbHVnaW4oaWQ6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XHJcbiAgICBjb25zdCBwID0gdGhpcy5sb2FkZWRQbHVnaW5zLmdldChpZCk7XHJcbiAgICBpZiAocCkge1xyXG4gICAgICByZXR1cm4gcC5tb2R1bGUucHJvbWlzZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBuZXdQbHVnaW46IElQbHVnaW5TdGF0ZSA9IHtcclxuICAgICAgaWQ6IGlkLFxyXG4gICAgICBtb2R1bGU6IG5ldyBEZWZlcnJlZDxhbnk+KCksXHJcbiAgICAgIHVybDogbnVsbCxcclxuICAgICAgc2NyaXB0OiBudWxsLFxyXG4gICAgICBtb2R1bGVSZWY6IG51bGwsXHJcbiAgICB9O1xyXG4gICAgdGhpcy5sb2FkZWRQbHVnaW5zLnNldChpZCwgbmV3UGx1Z2luKTtcclxuICAgIHJldHVybiBuZXdQbHVnaW4ubW9kdWxlLnByb21pc2U7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHBhdGNoV2luZG93KCkge1xyXG4gICAgKHdpbmRvdyBhcyBhbnkpLmRlZmluZSA9IChtb2R1bGVJZDogc3RyaW5nLCBkZXBzOiBzdHJpbmdbXSwgZmFjdG9yeTogKGV4cG9ydHM6IGFueSwgLi4uZGVwczogYW55W10pID0+IHZvaWQpID0+IHtcclxuICAgICAgY29uc3QgeCA9IHRoaXMubG9hZGVkUGx1Z2lucy5nZXQobW9kdWxlSWQpO1xyXG4gICAgICBpZiAoIXgpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oJ1Vua25vd24gcGx1Z2luIGNhbGxlZCBkZWZpbmUoKTonLCBtb2R1bGVJZCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBmaXJzdCBwYXJhbSBpcyBleHBvcnRzXHJcbiAgICAgIGRlcHMgPSBkZXBzLnNsaWNlKDEpO1xyXG5cclxuICAgICAgY29uc3QgZGVwc0V4cG9ydHMgPSBkZXBzLm1hcChkID0+IHtcclxuICAgICAgICBjb25zdCBwID0gdGhpcy5hdmFpbGFibGVEZXBlbmRlbmNpZXMuZ2V0KGQpO1xyXG4gICAgICAgIGlmICghcCkge1xyXG4gICAgICAgICAgY29uc29sZS53YXJuKCdQbHVnaW4nLCBtb2R1bGVJZCwgJ3JlcXVlc3RlZCB1bmtub3duIGRlcGVuZGVuY3knLCBkKTtcclxuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcHJvbWlzaWZpZWRQID0gUHJvbWlzZS5yZXNvbHZlKHApO1xyXG4gICAgICAgIHJldHVybiBwcm9taXNpZmllZFAuY2F0Y2goZXJyID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUud2FybignUGx1Z2luJywgbW9kdWxlSWQsICdkZXBlbmRlbmN5JywgZCwgJ2J1dCBsb2FkIGZhaWxlZCcsIGVycik7XHJcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgICAgUHJvbWlzZS5hbGwoZGVwc0V4cG9ydHMpLnRoZW4oZGVwcyA9PiB7XHJcbiAgICAgICAgY29uc3QgZXhwb3J0czogYW55ID0ge307XHJcbiAgICAgICAgZmFjdG9yeShleHBvcnRzLCAuLi5kZXBzKTtcclxuICAgICAgICBjb25zb2xlLmxvZygnUGx1Z2luJywgbW9kdWxlSWQsICdsb2FkZWQuJyk7XHJcbiAgICAgICAgY29uc3QgbW9kdWxlS2xhc3MgPSBleHBvcnRzLk1PRFVMRTtcclxuICAgICAgICBpZiAoIW1vZHVsZUtsYXNzKSB7XHJcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoXCJObyBNT0RVTEUgZXhwb3J0IGZvdW5kXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBtb2R1bGVGYWN0b3J5ID0gbmV3IMm1TmdNb2R1bGVGYWN0b3J5KG1vZHVsZUtsYXNzKTtcclxuICAgICAgICB4Lm1vZHVsZVJlZiA9IG1vZHVsZUZhY3RvcnkuY3JlYXRlKHRoaXMuaW5qZWN0b3IpO1xyXG4gICAgICAgIHgubW9kdWxlLnJlc29sdmUoZXhwb3J0cyBhcyBhbnkpO1xyXG4gICAgICAgIHRoaXMucGx1Z2luTG9hZGVkJC5uZXh0KHsgaWQ6IHguaWQsIG1vZHVsZTogeC5tb2R1bGVSZWYgfSk7XHJcbiAgICAgIH0pLmNhdGNoKGVyciA9PiB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdGYWlsZWQgdG8gbG9hZCBwbHVnaW4nLCBtb2R1bGVJZCwgJ2Vycm9yJywgZXJyKTtcclxuICAgICAgICB4Lm1vZHVsZS5yZWplY3QoZXJyKTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgKHdpbmRvdyBhcyBhbnkpLmRlZmluZS5hbWQgPSB0cnVlO1xyXG4gICAgY29uc29sZS5sb2coJ1dpbmRvdyBBTUQgc2hpbSBlc3RhYmxpc2hlZC4nKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbG9hZCh7IGlkLCB1cmwgfTogSVBsdWdpblVSTCkge1xyXG4gICAgbGV0IHAgPSB0aGlzLmxvYWRlZFBsdWdpbnMuZ2V0KGlkKTtcclxuXHJcbiAgICAvLyBwbHVnaW4gaXMgYWxyZWFkeSBsb2FkZWQgb3IgaW4gcHJvZ3Jlc3MuXHJcbiAgICBpZiAocCAmJiBwLnVybCkge1xyXG4gICAgICBpZiAocC51cmwgIT09IHVybCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBsdWdpbiBpcyBhbHJlYWR5IGxvYWRlZCB3aXRoIGFub3RoZXIgVVJMXCIpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyAhcCBtZWFucyB0aGF0IHAgaXMgbm90IGFjaXR2ZWx5IGJlaW5nIHdhaXRlZCBvbiwgc28gY3JlYXRlIGl0LlxyXG4gICAgLy8gaWYgcCBpcyBkZWZpbmVkIGhlcmUgaXQgbWVhbnMgdGhhdCBjb21wb25lbnQgY29uc3RydWN0aW9uIGFjdGl2ZWx5XHJcbiAgICAvLyB3YWl0cyBvbiB0aGUgbG9hZGluZyBvZiB0aGlzIHBsdWdpbiwgc28gd2UgZG9uJ3QgbmVlZCB0byByZWNyZWF0ZVxyXG4gICAgLy8gdGhlIHN0cnVjdHVyZSBoZXJlLlxyXG4gICAgaWYgKCFwKSB7XHJcbiAgICAgIHAgPSB7XHJcbiAgICAgICAgaWQ6IGlkLFxyXG4gICAgICAgIG1vZHVsZTogbmV3IERlZmVycmVkPGFueT4oKSxcclxuICAgICAgICB1cmw6IG51bGwsXHJcbiAgICAgICAgbW9kdWxlUmVmOiBudWxsLFxyXG4gICAgICAgIHNjcmlwdDogbnVsbCxcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTdGFydCB0aGUgYWN0dWFsIGxvYWRpbmcgcHJvY2Vzc1xyXG4gICAgcC51cmwgPSB1cmw7XHJcbiAgICB0aGlzLmxvYWRlZFBsdWdpbnMuc2V0KGlkLCBwKTtcclxuXHJcbiAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuICAgIHNjcmlwdC5vbmVycm9yID0gKGUpID0+IHAubW9kdWxlLnJlamVjdChlIGFzIGFueSk7XHJcbiAgICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xyXG4gICAgc2NyaXB0LnNyYyA9IHVybDtcclxuICAgIHAuc2NyaXB0ID0gc2NyaXB0O1xyXG5cclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdW5sb2FkKGlkOiBzdHJpbmcpIHtcclxuICAgIC8vIFRCRFxyXG4gIH1cclxufVxyXG4iXX0=