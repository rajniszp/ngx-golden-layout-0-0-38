(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('golden-layout'), require('rxjs/operators'), require('@angular/common')) :
    typeof define === 'function' && define.amd ? define('ngx-golden-layout', ['exports', '@angular/core', 'rxjs', 'golden-layout', 'rxjs/operators', '@angular/common'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['ngx-golden-layout'] = {}, global.ng.core, global.rxjs, global.GoldenLayout, global.rxjs.operators, global.ng.common));
}(this, (function (exports, core, rxjs, GoldenLayout, operators, common) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () {
                            return e[k];
                        }
                    });
                }
            });
        }
        n['default'] = e;
        return Object.freeze(n);
    }

    var GoldenLayout__namespace = /*#__PURE__*/_interopNamespace(GoldenLayout);

    /**
     * Inject an array of ComponentType into this token to
     * register those by default with the ComponentRegistry
     */
    var GoldenLayoutComponents = new core.InjectionToken('ComponentTypes');
    /**
     * Inject dependency modules to be used with the PluginRegistry
     * This token can use multi: true
     */
    var GoldenLayoutPluginDependency = new core.InjectionToken('Dependencies');

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    ;
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }
    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    var Deferred = /** @class */ (function () {
        function Deferred() {
            var _this = this;
            this.promise = new Promise(function (resolve, reject) {
                _this.resolve = resolve;
                _this.reject = reject;
            });
        }
        return Deferred;
    }());

    function MultiWindowInit() {
        if (!isChildWindow()) {
            if (!window.__services && !window.__serviceConstructors) {
                window.__services = new window.Map();
                window.__serviceConstructors = new window.Map();
                // Electron compatibility, when we have a global 'require' in our window, we throw it into the new window context
                if (window.require) {
                    var originalWindowOpen_1 = window.open.bind(window);
                    window.open = function (url, target, features, replace) {
                        var newWindow = originalWindowOpen_1(url, target, features, replace);
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
            var constr = constructor;
            var rootWindow = (isChildWindow() ? window.opener : window);
            var rootWindowIsMyWindow = rootWindow === window;
            if (rootWindowIsMyWindow) {
                var constrGot = rootWindow.__serviceConstructors.get(uniqueName);
                if (constrGot && constrGot !== constr) {
                    throw new Error("MultiWindowService(): uniqueName " + uniqueName + " already taken by " + constrGot + ", wanted by " + constr);
                }
                rootWindow.__serviceConstructors.set(uniqueName, constr);
            }
            var newConstructor = (function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var hasInstance = rootWindow.__services.has(uniqueName);
                if (!hasInstance) {
                    var storedConstr = rootWindow.__serviceConstructors.get(uniqueName) || constr;
                    rootWindow.__services.set(uniqueName, new (storedConstr.bind.apply(storedConstr, __spread([void 0], args)))());
                }
                return rootWindow.__services.get(uniqueName);
            });
            if (rootWindowIsMyWindow) {
                // https://github.com/angular/angular/issues/36120
                // ɵfac is created before this decorator runs.
                // so copy over the static properties.
                for (var prop in constr) {
                    if (constr.hasOwnProperty(prop)) {
                        newConstructor[prop] = constr[prop];
                    }
                }
            }
            try {
                if (rootWindowIsMyWindow) {
                    var metadata = Reflect.getMetadata('design:paramtypes', constr);
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
    exports.PluginURLProvider = /** @class */ (function () {
        function PluginURLProvider() {
            this.loadedURLs = new Map();
            this.loads = new rxjs.Subject();
            this.unloads = new rxjs.Subject();
        }
        PluginURLProvider.prototype.loadRequests$ = function () {
            return this.loads;
        };
        PluginURLProvider.prototype.unloadRequests$ = function () {
            return this.unloads;
        };
        PluginURLProvider.prototype.allPlugins = function () {
            return __spread(this.loadedURLs.entries()).map(function (p) { return ({ id: p[0], url: p[1] }); });
        };
        PluginURLProvider.prototype.requestLoad = function (id, url) {
            var p = this.loadedURLs.get(id);
            if (p) {
                if (p !== url) {
                    throw new Error("Plugin " + id + " is already loaded with another URL");
                }
                return;
            }
            this.loadedURLs.set(id, url);
            this.loads.next({ id: id, url: url });
        };
        PluginURLProvider.prototype.requestUnload = function (id) {
            var p = this.loadedURLs.get(id);
            if (!p) {
                throw new Error("Plugin " + id + " is not loaded");
            }
            this.loadedURLs.delete(id);
            this.unloads.next(id);
        };
        return PluginURLProvider;
    }());
    exports.PluginURLProvider.decorators = [
        { type: core.Injectable }
    ];
    exports.PluginURLProvider = __decorate([
        MultiWindowService('_gl__PluginURLProvider')
    ], exports.PluginURLProvider);

    ;
    var MockPluginRegistryService = /** @class */ (function () {
        function MockPluginRegistryService() {
            this.pluginLoaded$ = new rxjs.Subject();
            this.pluginUnloaded$ = new rxjs.Subject();
        }
        MockPluginRegistryService.prototype.startLoadPlugin = function () {
            throw new Error('MockPluginRegistry does not support loading/unloading');
        };
        MockPluginRegistryService.prototype.startUnloadPlugin = function () {
            throw new Error('MockPluginRegistry does not support loading/unloading');
        };
        return MockPluginRegistryService;
    }());
    MockPluginRegistryService.decorators = [
        { type: core.Injectable }
    ];
    /**
     * This class automates the loading of bundles built with ng-packagr,
     * registering the components with GoldenLayout
     * This service MUST be instantiated once per window and defines the 'public'
     * API for loading and unloading plugins.
     */
    var PluginRegistryService = /** @class */ (function () {
        function PluginRegistryService(deps, urlProvider, injector) {
            var _this = this;
            if (deps === void 0) { deps = []; }
            this.urlProvider = urlProvider;
            this.injector = injector;
            this.availableDependencies = new Map();
            this.loadedPlugins = new Map();
            this.pluginLoaded$ = new rxjs.Subject();
            this.pluginUnloaded$ = new rxjs.Subject();
            console.log('Creating PluginRegistry, got', deps.length, 'additional dependency modules');
            deps.forEach(function (x) { return _this.availableDependencies.set(x.name, x.loader); });
            this.patchWindow();
            this.urlProvider.loadRequests$().subscribe(function (p) { return _this.load(p); });
            // Load all previously loaded plugins
            this.urlProvider.allPlugins().forEach(function (p) { return _this.load(p); });
        }
        PluginRegistryService.prototype.startLoadPlugin = function (id, url) {
            this.urlProvider.requestLoad(id, url);
        };
        PluginRegistryService.prototype.startUnloadPlugin = function (id) {
            this.urlProvider.requestUnload(id);
        };
        PluginRegistryService.prototype.waitForPlugin = function (id) {
            var p = this.loadedPlugins.get(id);
            if (p) {
                return p.module.promise;
            }
            var newPlugin = {
                id: id,
                module: new Deferred(),
                url: null,
                script: null,
                moduleRef: null,
            };
            this.loadedPlugins.set(id, newPlugin);
            return newPlugin.module.promise;
        };
        PluginRegistryService.prototype.patchWindow = function () {
            var _this = this;
            window.define = function (moduleId, deps, factory) {
                var x = _this.loadedPlugins.get(moduleId);
                if (!x) {
                    console.warn('Unknown plugin called define():', moduleId);
                    return;
                }
                // first param is exports
                deps = deps.slice(1);
                var depsExports = deps.map(function (d) {
                    var p = _this.availableDependencies.get(d);
                    if (!p) {
                        console.warn('Plugin', moduleId, 'requested unknown dependency', d);
                        return Promise.resolve(undefined);
                    }
                    var promisifiedP = Promise.resolve(p);
                    return promisifiedP.catch(function (err) {
                        console.warn('Plugin', moduleId, 'dependency', d, 'but load failed', err);
                        return undefined;
                    });
                });
                Promise.all(depsExports).then(function (deps) {
                    var exports = {};
                    factory.apply(void 0, __spread([exports], deps));
                    console.log('Plugin', moduleId, 'loaded.');
                    var moduleKlass = exports.MODULE;
                    if (!moduleKlass) {
                        return Promise.reject("No MODULE export found");
                    }
                    var moduleFactory = new core.ɵNgModuleFactory(moduleKlass);
                    x.moduleRef = moduleFactory.create(_this.injector);
                    x.module.resolve(exports);
                    _this.pluginLoaded$.next({ id: x.id, module: x.moduleRef });
                }).catch(function (err) {
                    console.warn('Failed to load plugin', moduleId, 'error', err);
                    x.module.reject(err);
                });
            };
            window.define.amd = true;
            console.log('Window AMD shim established.');
        };
        PluginRegistryService.prototype.load = function (_a) {
            var id = _a.id, url = _a.url;
            var p = this.loadedPlugins.get(id);
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
            var script = document.createElement('script');
            script.onerror = function (e) { return p.module.reject(e); };
            script.type = 'text/javascript';
            script.src = url;
            p.script = script;
            document.body.appendChild(script);
        };
        PluginRegistryService.prototype.unload = function (id) {
            // TBD
        };
        return PluginRegistryService;
    }());
    PluginRegistryService.decorators = [
        { type: core.Injectable }
    ];
    PluginRegistryService.ctorParameters = function () { return [
        { type: Array, decorators: [{ type: core.Inject, args: [GoldenLayoutPluginDependency,] }, { type: core.Optional }] },
        { type: exports.PluginURLProvider },
        { type: core.Injector }
    ]; };

    var GoldenLayoutContainer = new core.InjectionToken('GoldenLayoutContainer');
    var GoldenLayoutComponentState = new core.InjectionToken('GoldenLayoutComponentState');
    var GoldenLayoutEventHub = new core.InjectionToken('GoldenLayoutEventHub');
    var GoldenLayoutComponentHost = new core.InjectionToken('GoldenLayoutComponentHost');

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
    var uuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    var WrapperComponent = /** @class */ (function () {
        function WrapperComponent(host, container, state) {
            this.host = host;
            this.container = container;
            this.state = state;
            this.destroyed = false;
            this.initialized = false;
            this.originalComponent = this.host.getGoldenLayoutInstance()._getAllComponents()[this.state.originalId];
        }
        Object.defineProperty(WrapperComponent.prototype, "headerComponent", {
            get: function () {
                if (!this.originalComponent || !this.originalComponent.instance) {
                    return undefined;
                }
                return this.originalComponent.instance.then(function (x) { return x.instance.headerComponent; });
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(WrapperComponent.prototype, "additionalTokens", {
            get: function () {
                if (!this.originalComponent || !this.originalComponent.instance) {
                    return undefined;
                }
                return this.originalComponent.instance.then(function (x) { return x.instance.additionalTokens; });
            },
            enumerable: false,
            configurable: true
        });
        WrapperComponent.prototype.ngOnInit = function () {
            var _this = this;
            this.originalComponent.instance.then(function (componentRef) {
                if (_this.destroyed || _this.initialized) {
                    return;
                }
                _this.redock(componentRef, _this.container.getElement());
                _this.initialized = true;
            });
        };
        WrapperComponent.prototype.ngOnDestroy = function () {
            var _this = this;
            this.originalComponent.instance.then(function (cr) {
                if (!_this.initialized || _this.destroyed) {
                    return;
                }
                _this.redock(cr, _this.originalComponent.container.getElement());
                _this.destroyed = true;
            });
        };
        WrapperComponent.prototype.redock = function (componentRef, to) {
            var el = $(componentRef.location.nativeElement);
            el.remove();
            to.append(el);
            if (implementsGlOnResize(componentRef.instance)) {
                componentRef.instance.glOnResize();
            }
        };
        WrapperComponent.prototype.glOnHide = function () {
            this.originalComponent.instance.then(function (cr) {
                if (implementsGlOnHide(cr.instance)) {
                    cr.instance.glOnHide();
                }
            });
        };
        WrapperComponent.prototype.glOnShow = function () {
            this.originalComponent.instance.then(function (cr) {
                if (implementsGlOnShow(cr.instance)) {
                    cr.instance.glOnShow();
                }
            });
        };
        WrapperComponent.prototype.glOnResize = function () {
            this.originalComponent.instance.then(function (cr) {
                if (implementsGlOnResize(cr.instance)) {
                    cr.instance.glOnResize();
                }
            });
        };
        WrapperComponent.prototype.glOnTab = function (tab) {
            var _this = this;
            this.originalComponent.instance.then(function (cr) {
                if (implementsGlOnTab(cr.instance)) {
                    debugger;
                    cr.instance.glOnTab(_this.originalComponent.tab);
                }
            });
        };
        return WrapperComponent;
    }());
    WrapperComponent.decorators = [
        { type: core.Component, args: [{
                    selector: 'gl-wrapper',
                    encapsulation: core.ViewEncapsulation.None,
                    template: "<div class=\"wrapper\"></div>"
                },] }
    ];
    WrapperComponent.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: core.Inject, args: [GoldenLayoutComponentHost,] }] },
        { type: undefined, decorators: [{ type: core.Inject, args: [GoldenLayoutContainer,] }] },
        { type: undefined, decorators: [{ type: core.Inject, args: [GoldenLayoutComponentState,] }] }
    ]; };

    var ComponentRegistryService = /** @class */ (function () {
        function ComponentRegistryService(initialComponents, pluginRegistry) {
            var _this = this;
            var _a;
            this.pluginRegistry = pluginRegistry;
            this.components = new Map();
            this.awaitedComponents = new Map();
            (initialComponents || []).forEach(function (c) { return _this.registerComponent(c); });
            this.registerComponent({
                name: 'gl-wrapper',
                type: WrapperComponent,
            });
            (_a = this.pluginRegistry) === null || _a === void 0 ? void 0 : _a.pluginLoaded$.subscribe(function (_b) {
                var id = _b.id, module = _b.module;
                var registeredTokens = module.injector.get(GoldenLayoutComponents, []);
                console.log('Plugin', id, 'wants to register', registeredTokens.length, 'components');
                registeredTokens.forEach(function (c) { return _this.registerComponent(Object.assign(Object.assign({}, c), { plugin: id })); });
            });
        }
        ComponentRegistryService.prototype.registeredComponents = function () {
            return __spread(this.components.entries()).map(function (e) { return ({ name: e[0], type: e[1] }); });
        };
        // This is only for use by the GoldenLayoutComponent
        ComponentRegistryService.prototype.componentMap = function () {
            return this.components;
        };
        ComponentRegistryService.prototype.registerComponent = function (component) {
            var otherComponent = this.components.get(component.name);
            if (!!otherComponent && otherComponent !== component.type) {
                var err = new Error("Failed to register component, " + component.name + " is already taken by another component: " + otherComponent);
                throw err;
            }
            this.components.set(component.name, component.type);
            var d = this.awaitedComponents.get(component.name);
            if (d) {
                this.awaitedComponents.delete(component.name);
                d.resolve(component.type);
            }
        };
        ComponentRegistryService.prototype.waitForComponent = function (component) {
            var c = this.components.get(component);
            if (c) {
                return Promise.resolve(c);
            }
            var d = this.awaitedComponents.get(component);
            if (!d) {
                d = new Deferred();
                this.awaitedComponents.set(component, d);
            }
            return d.promise;
        };
        return ComponentRegistryService;
    }());
    ComponentRegistryService.decorators = [
        { type: core.Injectable }
    ];
    ComponentRegistryService.ctorParameters = function () { return [
        { type: Array, decorators: [{ type: core.Inject, args: [GoldenLayoutComponents,] }, { type: core.Optional }] },
        { type: PluginRegistryService, decorators: [{ type: core.Optional }] }
    ]; };

    /**
     * Inject an angular component using this token to indicate
     * that the component should be rendered when there is an error rendering
     * the actual component.
     * Errors could be exceptions thrown at construction time or a not-registered component.
     */
    var FallbackComponent = new core.InjectionToken("fallback component");
    /**
     * This token is injected into the FallbackComponent when it is instantiated and contains
     * the name of the component that failed to initialize.
     */
    var FailedComponent = new core.InjectionToken("failed component");

    var RootWindowService = /** @class */ (function () {
        function RootWindowService() {
        }
        RootWindowService.prototype.isChildWindow = function () {
            try {
                return !!window.opener && !!window.opener.location.href;
            }
            catch (e) {
                return false;
            }
        };
        RootWindowService.prototype.getRootWindow = function () {
            return this.isChildWindow() ? window.opener : window;
        };
        return RootWindowService;
    }());
    RootWindowService.decorators = [
        { type: core.Injectable }
    ];
    RootWindowService.ctorParameters = function () { return []; };

    var MockWindowSynchronizerService = /** @class */ (function () {
        function MockWindowSynchronizerService() {
        }
        MockWindowSynchronizerService.prototype.restoreAppRefTick = function () { };
        MockWindowSynchronizerService.prototype.onUnload = function () { };
        return MockWindowSynchronizerService;
    }());
    MockWindowSynchronizerService.decorators = [
        { type: core.Injectable }
    ];
    var WindowSynchronizerService = /** @class */ (function () {
        function WindowSynchronizerService(appref, rootService, injector) {
            var _this = this;
            this.appref = appref;
            this.rootService = rootService;
            this.injector = injector;
            this.unloaded = false;
            this.topWindow = this.rootService.getRootWindow();
            this.isChildWindow = this.rootService.isChildWindow();
            if (this.isChildWindow) {
                window.document.title = window.document.URL;
                console.__log = console.log;
                console.log = function () {
                    var _a;
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return (_a = _this.topWindow.console).log.apply(_a, __spread(['[CHILD] =>'], args));
                };
            }
            // Multi-Window compatibility.
            // We need to synchronize all appRefs that could tick
            // Store them in a global array and also overwrite the injector using the injector from the main window.
            var anyWin = this.topWindow;
            if (!this.isChildWindow) {
                anyWin.__apprefs = [];
                anyWin.__injector = this.injector;
            }
            // attach the application reference to the root window, save the original 'tick' method
            anyWin.__apprefs.push(this.appref);
            this.appref.__tick = this.appref.tick;
            // Overwrite the tick method running all apprefs in their zones.
            this.appref.tick = function () {
                var e_1, _a;
                var _loop_1 = function (ar) {
                    ar._zone.run(function () { return ar.__tick(); });
                };
                try {
                    for (var _b = __values(_this.topWindow.__apprefs), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var ar = _c.value;
                        _loop_1(ar);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            };
        }
        WindowSynchronizerService.prototype.restoreAppRefTick = function () {
            this.appref.tick = this.appref.__tick;
        };
        WindowSynchronizerService.prototype.onUnload = function () {
            if (this.unloaded) {
                return;
            }
            this.unloaded = true;
            if (this.isChildWindow) {
                var index = this.topWindow.__apprefs.indexOf(this.appref);
                if (index >= 0) {
                    this.topWindow.__apprefs.splice(index, 1);
                }
            }
        };
        return WindowSynchronizerService;
    }());
    WindowSynchronizerService.decorators = [
        { type: core.Injectable }
    ];
    WindowSynchronizerService.ctorParameters = function () { return [
        { type: core.ApplicationRef },
        { type: RootWindowService },
        { type: core.Injector }
    ]; };

    // We need to wrap some golden layout internals, so we can intercept close and 'close stack'
    // For close, the tab is wrapped and the close element to change the event handler to close the correct container.
    var lm = GoldenLayout__namespace;
    var isCloned = function (contentItem) { return contentItem.isComponent &&
        contentItem.config &&
        contentItem.config.componentState &&
        contentItem.config.componentState.originalId; };
    var ɵ0 = isCloned;
    var GetComponentFromLayoutManager = function (lm, id) {
        var itemList = lm.root.getItemsById(id);
        if (itemList.length !== 1) {
            console.warn('non unique ID found: ' + id);
            return undefined;
        }
        return itemList[0];
    };
    var originalComponent = function (contentItem) {
        var comp = GetComponentFromLayoutManager(contentItem.layoutManager, contentItem.config.componentState.originalId);
        if (!comp.isComponent) {
            throw new Error('Expected component');
        }
        return comp;
    };
    var ɵ1 = originalComponent;
    var tabFromId = function (contentItem) {
        var ci = originalComponent(contentItem);
        return ci ? ci.tab : undefined;
    };
    var ɵ2 = tabFromId;
    // This code wraps the original golden-layout Tab
    // A tab is instantiated by the golden-layout Header
    // We rebind the close event listener to properly dispose the angular item container
    // In order to destroy the angular component ref and be able to defer the close.
    var originalTab = lm.__lm.controls.Tab;
    var newTab = function (header, tabContentItem) {
        var tab = new originalTab(header, tabContentItem);
        /**
         * This piece of code implements close functionality for the tab close.
         * If we have a cloned tab, i.e. one which is contained in a maximised dummy stack
         * we close the container backing the tab.
         */
        tab.closeElement.off('click touchstart');
        tab.closeElement.on('click touchstart', function (ev) {
            ev.stopPropagation();
            if (isCloned(tab.contentItem)) {
                var c = originalComponent(tab.contentItem);
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
        tab.element.on('mousedown touchstart', function (ev) {
            var contentItem = tab.contentItem;
            if (isCloned(contentItem)) {
                contentItem = originalComponent(tab.contentItem);
            }
            contentItem.layoutManager.emit('tabActivated', contentItem);
        });
        if (isCloned(tab.contentItem) && tab._layoutManager.config.settings.reorderEnabled === true) {
            // Reimplement tab drag start by redirecting the tab state.
            tab.element.on('mousedown touchstart', function (ev) {
                var originalTab = tabFromId(tab.contentItem);
                if (originalTab && originalTab._dragListener) {
                    var dl_1 = originalTab._dragListener;
                    var destroyDummy_1 = function () {
                        dl_1.off('dragStart', destroyDummy_1, dl_1);
                        if (header.layoutManager._maximisedItem === tab.contentItem.parent) {
                            tab.contentItem.parent.toggleMaximise();
                        }
                    };
                    dl_1.off('dragStart', originalTab._onDragStart, originalTab);
                    dl_1.on('dragStart', destroyDummy_1, dl_1);
                    dl_1.on('dragStart', originalTab._onDragStart, originalTab);
                    dl_1._fDown(ev);
                }
            });
        }
        return tab;
    };
    var ɵ3 = newTab;
    newTab._template = '<li class="lm_tab"><i class="lm_left"></i>' +
        '<span class="lm_title"></span><div class="lm_close_tab"></div>' +
        '<i class="lm_right"></i></li>';
    lm.__lm.controls.Tab = newTab;
    // Header is wrapped to catch the maximise and close buttons.
    var originalHeader = lm.__lm.controls.Header;
    var newHeader = function (layoutManager, parent) {
        var maximise = parent._header['maximise'];
        var popout = parent._header['popout'];
        if (maximise && layoutManager.config.settings.maximiseAllItems === true) {
            // Check whether we should maximise all stacks and if so, force the header to
            // not generate a maximise button.
            delete parent._header['maximise'];
        }
        if (popout && layoutManager.config.settings.maximiseAllItems === true) {
            delete parent._header['popout'];
        }
        // Generate the original header
        var header = new originalHeader(layoutManager, parent);
        // Check whether we should maximise all stacks, and if so, generate a custom popout button
        // but keep the order with the maximise and close button
        if (popout && layoutManager.config.settings.maximiseAllItems === true) {
            header.popoutButton = new lm.__lm.controls.HeaderButton(header, popout, 'lm_popout', function () {
                var contentItem = header.activeContentItem;
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
            header.maximiseButton = new lm.__lm.controls.HeaderButton(header, maximise, 'lm_maximise', function () {
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
            var label = header._getHeaderSetting('close');
            header.closeButton = new lm.__lm.controls.HeaderButton(header, label, 'lm_close', function () {
                header.parent.contentItems.forEach(function (ci) {
                    ci.container.close();
                });
            });
        }
        return header;
    };
    var ɵ4 = newHeader;
    newHeader._template = [
        '<div class="lm_header">',
        '<ul class="lm_tabs"></ul>',
        '<ul class="lm_controls"></ul>',
        '<ul class="lm_tabdropdown_list"></ul>',
        '</div>'
    ].join('');
    lm.__lm.controls.Header = newHeader;
    // Patch the drag proxy in order to have an itemDragged event.
    var origDragProxy = lm.__lm.controls.DragProxy;
    var dragProxy = function (x, y, dragListener, layoutManager, contentItem, originalParent) {
        layoutManager.emit('itemDragged', contentItem);
        return new origDragProxy(x, y, dragListener, layoutManager, contentItem, originalParent);
    };
    var ɵ5 = dragProxy;
    dragProxy._template = origDragProxy._template;
    lm.__lm.controls.DragProxy = dragProxy;
    // Patch the stack in order to have an activeContentItemChanged$ observable
    var origStack = lm.__lm.items.Stack;
    function MyStack(lm, config, parent) {
        var _this = this;
        origStack.call(this, lm, config, parent);
        this.activeContentItem$ = new rxjs.BehaviorSubject(null);
        var callback = function (ci) {
            if (_this.activeContentItem$) {
                _this.activeContentItem$.next(ci);
            }
            ;
        };
        this.on('activeContentItemChanged', callback);
        var origDestroy = this._$destroy;
        this.___destroyed = false;
        this._$destroy = function () {
            if (_this.___destroyed) {
                return;
            }
            _this.___destroyed = true;
            _this.off('activeContentItemChanged', callback);
            _this.activeContentItem$.complete();
            _this.activeContentItem$ = null;
            origDestroy.call(_this);
        };
        return this;
    }
    MyStack.prototype = Object.create(origStack.prototype);
    // Force stacks to be flattened.
    MyStack.prototype['addChild'] = function (contentItem, index) {
        var _this = this;
        if (contentItem.type === 'stack') {
            // We try to pop in a stack into another stack (i.e. nested tab controls.)
            // This breaks the other stuff in custom header components, therefore it's not recommended.
            // So we add the items directly into this stack.
            (contentItem.content || []).forEach(function (ci, idx) { return origStack.prototype.addChild.call(_this, ci, index + idx); });
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
    var origPopout = lm.__lm.controls.BrowserPopout;
    var popout = function (config, dimensions, parent, index, lm) {
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
    var ɵ6 = popout;
    lm.__lm.controls.BrowserPopout = popout;
    // Fixup for nested golden-layout instances.
    // nested instances should be able to be docked out completely
    // but the golden layout will recognize its query string and be incorrectly nested.
    var getQueryStringParam = lm.__lm.utils.getQueryStringParam;
    var firstQueryString = true;
    lm.__lm.utils.getQueryStringParam = function (param) {
        if (firstQueryString) {
            firstQueryString = false;
            return getQueryStringParam(param);
        }
        return null;
    };
    var GoldenLayoutComponent = /** @class */ (function () {
        function GoldenLayoutComponent(rootService, componentRegistry, viewContainer, componentFactoryResolver, ngZone, injector, windowSync, parentGoldenLayout, fallbackComponent) {
            var _this = this;
            this.rootService = rootService;
            this.componentRegistry = componentRegistry;
            this.viewContainer = viewContainer;
            this.componentFactoryResolver = componentFactoryResolver;
            this.ngZone = ngZone;
            this.injector = injector;
            this.windowSync = windowSync;
            this.parentGoldenLayout = parentGoldenLayout;
            this.fallbackComponent = fallbackComponent;
            this.stateChanged = new core.EventEmitter();
            this.tabActivated = new core.EventEmitter();
            this.goldenLayout = null;
            this.onUnloaded = new Deferred();
            this.stateChangePaused = false;
            this.stateChangeScheduled = false;
            this.tabsList = new rxjs.BehaviorSubject({});
            this.pushStateChange = function () {
                // For each state change, we want to refresh the list of the opened components. At the moment, we only care about the keys.
                _this.tabsList.next(_this.goldenLayout._getAllComponents());
                if (_this.stateChangePaused || _this.stateChangeScheduled) {
                    return;
                }
                _this.stateChangeScheduled = true;
                window.requestAnimationFrame(function () {
                    _this.stateChangeScheduled = false;
                    _this.stateChanged.emit();
                });
            };
            this.resumeStateChange = function () { return _this.stateChangePaused = false; };
            this.pauseStateChange = function () { return _this.stateChangePaused = true; };
            this.pushTabActivated = function (ci) {
                _this.tabActivated.emit(ci);
            };
            this.fallbackType = null;
            this.openedComponents = [];
            this.poppedIn = false;
            this._eventEmitter = new lm.__lm.utils.EventEmitter();
            console.log(parentGoldenLayout);
            if (!!this.fallbackComponent) {
                this.fallbackType = this.buildConstructor(this.fallbackComponent);
            }
            if (core.isDevMode())
                console.log("Create@" + (this.rootService.isChildWindow ? 'child' : 'root') + "!");
        }
        GoldenLayoutComponent.prototype.onResize = function () {
            if (this.goldenLayout) {
                this.goldenLayout.updateSize();
            }
        };
        GoldenLayoutComponent.prototype.ngOnInit = function () {
            var _this = this;
            if (core.isDevMode())
                console.log("Init@" + (this.rootService.isChildWindow ? 'child' : 'root') + "!");
            this.layoutSubscription = this.layout.subscribe(function (layout) {
                _this.destroyGoldenLayout();
                _this.initializeGoldenLayout(layout);
            });
        };
        // Map beforeunload to onDestroy to simplify the handling
        GoldenLayoutComponent.prototype.beforeUnload = function () {
            var _this = this;
            if (this.poppedIn) {
                this.onUnloaded.promise.then(function () { return _this.ngOnDestroy(); });
                this.onUnloaded.resolve();
                this.windowSync.onUnload();
            }
        };
        // Map beforeunload to onDestroy to simplify the handling
        GoldenLayoutComponent.prototype.pageHide = function () {
            var _this = this;
            if (!this.poppedIn) {
                this.openedComponents.forEach(function (c) {
                    if (implementsGlOnUnload(c)) {
                        c.glOnUnload();
                    }
                });
            }
            this.onUnloaded.promise.then(function () { return _this.ngOnDestroy(); });
            this.onUnloaded.resolve();
            this.windowSync.onUnload();
        };
        GoldenLayoutComponent.prototype.ngOnDestroy = function () {
            var _a;
            if (core.isDevMode()) {
                console.log("Destroy@" + (this.rootService.isChildWindow ? 'child' : 'root') + "!");
            }
            this.layoutSubscription.unsubscribe();
            // restore the original tick method.
            // this appens in two cases:
            // either the window is closed, after that it's not important to restore the tick method
            // or within the root window, where we HAVE to restore the original tick method
            this.windowSync.restoreAppRefTick();
            this.destroyGoldenLayout();
            // Discard all previously made subscriptions.
            this._eventEmitter._mSubscriptions = (_a = {}, _a[lm.__lm.utils.EventEmitter.ALL_EVENT] = [], _a);
        };
        GoldenLayoutComponent.prototype.getGoldenLayoutInstance = function () {
            if (!this.goldenLayout) {
                throw new Error('Component is not initialized yet');
            }
            return this.goldenLayout;
        };
        GoldenLayoutComponent.prototype.addEvent = function (kind, callback, context) {
            this._eventEmitter.on(kind, callback, context);
        };
        GoldenLayoutComponent.prototype.getSerializableState = function () {
            if (this.goldenLayout) {
                var configObj = this.goldenLayout.toConfig();
                var wrapperMax = this.goldenLayout.__wrapperMaximisedItemId;
                if (wrapperMax) {
                    configObj.maximisedItemId = wrapperMax;
                    var filterContent_1 = function (ci) {
                        if (ci.type === 'stack' && ci.isDummy) {
                            return false;
                        }
                        if (ci.type !== 'component') {
                            ci.content = ci.content.filter(filterContent_1);
                        }
                        return true;
                    };
                    configObj.content = configObj.content.filter(filterContent_1);
                }
                return configObj;
            }
            return null;
        };
        GoldenLayoutComponent.prototype.getComponents = function () {
            return this.goldenLayout._getAllComponents();
        };
        GoldenLayoutComponent.prototype.closeComponent = function (component) {
            var c = GetComponentFromLayoutManager(this.goldenLayout, component);
            if (!c) {
                return;
            }
            c.remove();
        };
        GoldenLayoutComponent.prototype.focusComponent = function (component) {
            var c = GetComponentFromLayoutManager(this.goldenLayout, component);
            if (!c) {
                return;
            }
            c.parent.setActiveContentItem(c);
        };
        GoldenLayoutComponent.prototype.createNewComponent = function (config, componentToDock) {
            if (!this.goldenLayout) {
                throw new Error("golden layout is not initialized");
            }
            var myConfig = config;
            var root = this.goldenLayout.root;
            var element = null;
            if (componentToDock) {
                var c = GetComponentFromLayoutManager(this.goldenLayout, componentToDock);
                if (c.parent.isStack) {
                    element = c.parent;
                }
                else {
                    var stack = this.goldenLayout.createContentItem({
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
            var content = this.goldenLayout.createContentItem(myConfig);
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
        };
        GoldenLayoutComponent.prototype.findStack = function (contentItems) {
            var e_1, _a;
            if (!contentItems) {
                return null;
            }
            try {
                for (var contentItems_1 = __values(contentItems), contentItems_1_1 = contentItems_1.next(); !contentItems_1_1.done; contentItems_1_1 = contentItems_1.next()) {
                    var x = contentItems_1_1.value;
                    if (x.isStack) {
                        if (x.config.isDummy) {
                            continue;
                        }
                        return x;
                    }
                    var s = this.findStack(x.contentItems);
                    if (s !== null) {
                        return s;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (contentItems_1_1 && !contentItems_1_1.done && (_a = contentItems_1.return)) _a.call(contentItems_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        };
        GoldenLayoutComponent.prototype.destroyGoldenLayout = function () {
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
        };
        GoldenLayoutComponent.prototype.initializeGoldenLayout = function (layout) {
            var _this = this;
            this.goldenLayout = new GoldenLayout__namespace(layout, $(this.el.nativeElement));
            var origPopout = this.goldenLayout.createPopout.bind(this.goldenLayout);
            this.goldenLayout.createPopout = function (item, dim, parent, index) {
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
                var rec = [item];
                while (rec.length) {
                    var itemToProcess = rec.shift();
                    if (itemToProcess.contentItems && itemToProcess.contentItems.length > 0) {
                        rec.push.apply(rec, __spread(itemToProcess.contentItems));
                    }
                    if (itemToProcess.isComponent) {
                        var component = itemToProcess.container.__ngComponent;
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
            var buildComponentMap = function (item) {
                var e_2, _a;
                var ret = {};
                try {
                    for (var _b = __values(item.contentItems), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var ci = _c.value;
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
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                return ret;
            };
            this.goldenLayout._getAllComponents = function () { return buildComponentMap(_this.goldenLayout.root); };
            this.goldenLayout.generateAndMaximiseDummyStack = function (parent, item) {
                /**
                 * This function creates a dummy stack, which is being used if 'maximiseAllItems' is true.
                 * The dummy stack contains a dummy component for each component opened in the real layout.
                 * It will furthermore track component closes/spawns and create/close the dummy components accordingly.
                 * parent is the parent of the item we want to maximise
                 * item is the item which was active when we wanted to maximise it.
                 * required to set the active item index.
                 */
                var openedComponents = buildComponentMap(_this.goldenLayout.root);
                var componentIdList = Object.keys(openedComponents);
                if (componentIdList.length === 0) {
                    return; // How did we get here?!
                }
                // We only have a single child, so we restore the original behavior
                var rootContentItem = _this.goldenLayout.root.contentItems[0];
                if (rootContentItem.isStack) {
                    rootContentItem.toggleMaximise();
                    return;
                }
                /**
                 * At this point, there are at least two children, so use the dummy component.
                 */
                var config = {
                    type: 'stack',
                    content: componentIdList.map(function (k) { return ({
                        type: 'component',
                        componentName: 'gl-wrapper',
                        title: openedComponents[k].config.title,
                        reorderEnabled: false,
                        componentState: {
                            originalId: k,
                        },
                    }); }),
                    isClosable: false,
                    isDummy: true,
                    state: 'dummy',
                    activeItemIndex: componentIdList.findIndex(function (j) { return j === (item || parent._activeContentItem.id); }),
                };
                // add this item as first child ever, causing golden-layout to create a stack object
                rootContentItem.addChild(config, 0);
                // Fetch the stack
                var myStack = rootContentItem.contentItems[0];
                // Setup an __wrapperMaximisedItemId in order to setActiveContentItem on the underlying stack later.
                _this.goldenLayout.__wrapperMaximisedItemId = parent._activeContentItem.id;
                myStack.activeContentItem$.subscribe(function (ci) {
                    // Setup the __wrapperMaximisedItemId lateron.
                    _this.goldenLayout.__wrapperMaximisedItemId = ci.config.componentState.originalId;
                });
                var teardown$ = new rxjs.Subject();
                myStack.on('minimised', function () {
                    // Dummy stack was minimised, so enforce all dummy components to be disposed
                    // and dispose the dummy stack as well.
                    _this.goldenLayout.__wrapperMaximisedItemId = null;
                    teardown$.next();
                    teardown$.complete();
                    myStack.remove();
                });
                // Maximise the dummy stack.
                myStack.toggleMaximise();
                // Whenever a tab is being created or closed, perform a diff algorithm
                // on the active tabs list and create or delete the dummy tabs.
                _this.tabsList.pipe(operators.takeUntil(teardown$), operators.distinctUntilChanged(function (a, b) {
                    var keysA = Object.keys(a);
                    var keysB = new Set(Object.keys(b));
                    return keysA.length === keysB.size && keysA.every(function (key) { return keysB.has(key); });
                })).subscribe(function (targetState) {
                    var e_3, _a, e_4, _b;
                    var workingCopy = Object.assign({}, targetState);
                    var tabs = new Set(Object.keys(workingCopy));
                    // currently opened tabs
                    var openedTabs = new Set(myStack.contentItems.map(function (ci) {
                        return ci.config.componentState.originalId;
                    }));
                    try {
                        for (var tabs_1 = __values(tabs), tabs_1_1 = tabs_1.next(); !tabs_1_1.done; tabs_1_1 = tabs_1.next()) {
                            var key = tabs_1_1.value;
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
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (tabs_1_1 && !tabs_1_1.done && (_a = tabs_1.return)) _a.call(tabs_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                    var _loop_1 = function (tab) {
                        var tabObj = myStack.contentItems.find(function (j) { return j.config.componentState.originalId === tab; });
                        tabObj.remove();
                    };
                    try {
                        // The remaining tabs are opened in the dummy but not in the background, so close the dummy.
                        for (var openedTabs_1 = __values(openedTabs), openedTabs_1_1 = openedTabs_1.next(); !openedTabs_1_1.done; openedTabs_1_1 = openedTabs_1.next()) {
                            var tab = openedTabs_1_1.value;
                            _loop_1(tab);
                        }
                    }
                    catch (e_4_1) { e_4 = { error: e_4_1 }; }
                    finally {
                        try {
                            if (openedTabs_1_1 && !openedTabs_1_1.done && (_b = openedTabs_1.return)) _b.call(openedTabs_1);
                        }
                        finally { if (e_4) throw e_4.error; }
                    }
                });
            };
            this.goldenLayout.on('popIn', function () {
                _this.poppedIn = true;
                _this.openedComponents.forEach(function (c) {
                    if (implementsGlOnPopin(c)) {
                        c.glOnPopin();
                    }
                });
            });
            // Overwrite the 'getComponent' method to dynamically resolve JS components.
            // We need to do this, because the component map is not flexible enough for us since we can dynamically chainload plugins.
            this.goldenLayout.getComponent = function (type) {
                if (core.isDevMode()) {
                    console.log("Resolving component " + type);
                }
                return _this.buildConstructor(type);
            };
            this.goldenLayout.on('stackCreated', function (stack) {
                var customHeaderElement = document.createElement('li');
                customHeaderElement.classList.add('custom-header');
                customHeaderElement.style.display = 'none';
                var ctr = stack.header.controlsContainer[0];
                var element = null;
                ctr.prepend(customHeaderElement);
                var disposeControl = function () {
                    customHeaderElement.style.display = 'none';
                    if (element) {
                        customHeaderElement.childNodes.forEach(function (e) { return customHeaderElement.removeChild(e); });
                        element.destroy();
                        element = null;
                        stack.header._updateTabSizes();
                    }
                };
                var bootstrapComponent = function (ct, tokens, injector) {
                    if (element) {
                        disposeControl();
                    }
                    customHeaderElement.style.display = '';
                    var factory = _this.componentFactoryResolver.resolveComponentFactory(ct);
                    var headerInjector = core.Injector.create(tokens, injector);
                    element = _this.viewContainer.createComponent(factory, undefined, headerInjector);
                    customHeaderElement.prepend(element.location.nativeElement);
                    stack.header._updateTabSizes();
                };
                // Wait until the content item is loaded and done
                stack.activeContentItem$.pipe(operators.switchMap(function (contentItem) {
                    if (!contentItem || !contentItem.isComponent) {
                        return rxjs.of(null);
                    }
                    return contentItem.instance || rxjs.of(null);
                }), operators.switchMap(function (cr) {
                    if (!cr) {
                        return Promise.all([null, null, null]);
                    }
                    var inst = cr.instance.headerComponent;
                    var tokens = cr.instance.additionalTokens;
                    return Promise.all([
                        Promise.resolve(inst),
                        Promise.resolve(tokens),
                        Promise.resolve(cr)
                    ]);
                })).subscribe(function (_a) {
                    var _b = __read(_a, 3), header = _b[0], tokens = _b[1], componentRef = _b[2];
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
            this.goldenLayout.on('initialised', function () {
                window.requestAnimationFrame(function () {
                    if (layout.maximisedItemId) {
                        var c = GetComponentFromLayoutManager(_this.goldenLayout, layout.maximisedItemId);
                        if (c) {
                            _this.goldenLayout.generateAndMaximiseDummyStack(c.parent, layout.maximisedItemId);
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
        };
        /**
         * Build a 'virtual' constructor which is used to pass the components to goldenLayout
         * @param componentType
         */
        GoldenLayoutComponent.prototype.buildConstructor = function (componentName) {
            // Can't use an ES6 lambda here, since it is not a constructor
            var self = this;
            return function (container, componentState) {
                var glComponent = container.parent;
                if (glComponent.config.id) {
                    glComponent.id = glComponent.config.id;
                }
                else {
                    glComponent.id = uuid();
                    glComponent.config.id = glComponent.id;
                }
                var d = new Deferred();
                self.ngZone.run(function () {
                    // Wait until the component registry can provide a type for the component
                    // TBD: Maybe add a timeout here?
                    var componentPromise = self.componentRegistry.waitForComponent(componentName);
                    componentPromise.then(function (componentType) {
                        // We got our component type
                        if (core.isDevMode()) {
                            console.log("Component " + componentName + " returned from componentRegistry");
                        }
                        // Create an instance of the angular component.
                        var factory = self.componentFactoryResolver.resolveComponentFactory(componentType);
                        var failedComponent = null;
                        if (componentType === self.fallbackComponent) {
                            // Failed to find the component constructor **AND** we have a fallback component defined,
                            // so lookup the failed component's name and inject it into the fallback component.
                            failedComponent = container._config.componentName;
                        }
                        var injector = self._createComponentInjector(container, componentState, failedComponent);
                        var componentRef = self.viewContainer.createComponent(factory, undefined, injector);
                        // Bind the new component to container's client DOM element.
                        container.getElement().append($(componentRef.location.nativeElement));
                        self._bindEventHooks(container, componentRef.instance);
                        container.__ngComponent = componentRef.instance;
                        self.openedComponents.push(componentRef.instance);
                        var destroyed = false;
                        var destroyFn = function () {
                            if (!destroyed) {
                                destroyed = true;
                                self.openedComponents = self.openedComponents.filter(function (i) { return i !== componentRef.instance; });
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
        };
        /**
         * Creates an injector capable of injecting the GoldenLayout object,
         * component container, and initial component state.
         */
        GoldenLayoutComponent.prototype._createComponentInjector = function (container, componentState, failed) {
            var providers = [
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
            return core.Injector.create(providers, this.injector);
        };
        /**
         * Registers an event handler for each implemented hook.
         * @param container Golden Layout component container.
         * @param component Angular component instance.
         */
        GoldenLayoutComponent.prototype._bindEventHooks = function (container, component) {
            if (implementsGlOnResize(component)) {
                container.on('resize', function () {
                    component.glOnResize();
                });
            }
            if (implementsGlOnShow(component)) {
                container.on('show', function () {
                    component.glOnShow();
                });
            }
            if (implementsGlOnHide(component)) {
                container.on('hide', function () {
                    component.glOnHide();
                });
            }
            if (implementsGlOnTab(component)) {
                container.on('tab', function (tab) {
                    component.glOnTab(tab);
                });
            }
            if (implementsGlOnClose(component)) {
                var containerClose_1 = container.close.bind(container);
                container.close = function () {
                    if (!container._config.isClosable) {
                        return false;
                    }
                    component.glOnClose().then(function () {
                        containerClose_1();
                    }, function () { });
                };
            }
        };
        return GoldenLayoutComponent;
    }());
    GoldenLayoutComponent.decorators = [
        { type: core.Component, args: [{
                    selector: 'golden-layout-root',
                    template: "<div class=\"ng-golden-layout-root\" #glroot></div>",
                    styles: ["\n    .ng-golden-layout-root {\n      width:100%;\n      height:100%;\n    }"]
                },] }
    ];
    GoldenLayoutComponent.ctorParameters = function () { return [
        { type: RootWindowService },
        { type: ComponentRegistryService },
        { type: core.ViewContainerRef },
        { type: core.ComponentFactoryResolver },
        { type: core.NgZone },
        { type: core.Injector },
        { type: WindowSynchronizerService },
        { type: GoldenLayoutComponent, decorators: [{ type: core.Optional }, { type: core.SkipSelf }] },
        { type: undefined, decorators: [{ type: core.Optional }, { type: core.Inject, args: [FallbackComponent,] }] }
    ]; };
    GoldenLayoutComponent.propDecorators = {
        layout: [{ type: core.Input }],
        stateChanged: [{ type: core.Output }],
        tabActivated: [{ type: core.Output }],
        el: [{ type: core.ViewChild, args: ['glroot', { static: true },] }],
        onResize: [{ type: core.HostListener, args: ['window:resize',] }],
        beforeUnload: [{ type: core.HostListener, args: ['window:beforeunload',] }],
        pageHide: [{ type: core.HostListener, args: ['window:pagehide',] }]
    };

    var GoldenLayoutModule = /** @class */ (function () {
        function GoldenLayoutModule() {
        }
        GoldenLayoutModule.forRoot = function (types, fallback, pluginDeps) {
            return {
                ngModule: GoldenLayoutModule,
                providers: [
                    ComponentRegistryService,
                    RootWindowService,
                    PluginRegistryService,
                    exports.PluginURLProvider,
                    WindowSynchronizerService,
                    { provide: GoldenLayoutComponents, useValue: types, },
                    { provide: core.ANALYZE_FOR_ENTRY_COMPONENTS, useValue: [types, fallback, WrapperComponent], multi: true },
                    { provide: GoldenLayoutPluginDependency, useValue: pluginDeps },
                    { provide: FallbackComponent, useValue: fallback },
                ],
            };
        };
        GoldenLayoutModule.forChild = function (types, fallback) {
            return [
                ComponentRegistryService,
                { provide: PluginRegistryService, useClass: MockPluginRegistryService },
                { provide: WindowSynchronizerService, useClass: MockWindowSynchronizerService },
                { provide: exports.PluginURLProvider, useValue: null },
                { provide: GoldenLayoutComponents, useValue: types, },
                { provide: core.ANALYZE_FOR_ENTRY_COMPONENTS, useValue: [types, fallback, WrapperComponent], multi: true },
                { provide: FallbackComponent, useValue: fallback },
            ];
        };
        return GoldenLayoutModule;
    }());
    GoldenLayoutModule.decorators = [
        { type: core.NgModule, args: [{
                    declarations: [GoldenLayoutComponent, WrapperComponent],
                    exports: [GoldenLayoutComponent],
                    imports: [common.CommonModule]
                },] }
    ];

    /**
     * Generated bundle index. Do not edit.
     */

    exports.ComponentRegistryService = ComponentRegistryService;
    exports.FailedComponent = FailedComponent;
    exports.FallbackComponent = FallbackComponent;
    exports.GetComponentFromLayoutManager = GetComponentFromLayoutManager;
    exports.GoldenLayoutComponent = GoldenLayoutComponent;
    exports.GoldenLayoutComponentHost = GoldenLayoutComponentHost;
    exports.GoldenLayoutComponentState = GoldenLayoutComponentState;
    exports.GoldenLayoutComponents = GoldenLayoutComponents;
    exports.GoldenLayoutContainer = GoldenLayoutContainer;
    exports.GoldenLayoutEventHub = GoldenLayoutEventHub;
    exports.GoldenLayoutModule = GoldenLayoutModule;
    exports.GoldenLayoutPluginDependency = GoldenLayoutPluginDependency;
    exports.MockPluginRegistryService = MockPluginRegistryService;
    exports.MultiWindowInit = MultiWindowInit;
    exports.MultiWindowService = MultiWindowService;
    exports.PluginRegistryService = PluginRegistryService;
    exports.RootWindowService = RootWindowService;
    exports.isChildWindow = isChildWindow;
    exports.ɵ0 = ɵ0;
    exports.ɵ1 = ɵ1;
    exports.ɵ2 = ɵ2;
    exports.ɵ3 = ɵ3;
    exports.ɵ4 = ɵ4;
    exports.ɵ5 = ɵ5;
    exports.ɵ6 = ɵ6;
    exports.ɵa = MockWindowSynchronizerService;
    exports.ɵb = WindowSynchronizerService;
    exports.ɵc = WrapperComponent;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx-golden-layout.umd.js.map
