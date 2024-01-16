import { Inject, Injectable, Optional } from '@angular/core';
import { GoldenLayoutComponents } from './config';
import { PluginRegistryService } from './plugin-registry.service';
import { Deferred } from './deferred';
import { WrapperComponent } from './wrapper.component';
export class ComponentRegistryService {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LXJlZ2lzdHJ5LnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvbmd4LWdvbGRlbi1sYXlvdXQvc3JjLyIsInNvdXJjZXMiOlsibGliL2NvbXBvbmVudC1yZWdpc3RyeS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBUSxNQUFNLGVBQWUsQ0FBQztBQUNuRSxPQUFPLEVBQWlCLHNCQUFzQixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDdEMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFHdkQsTUFBTSxPQUFPLHdCQUF3QjtJQUluQyxZQUM4QyxpQkFBbUMsRUFDM0QsY0FBc0M7O1FBQXRDLG1CQUFjLEdBQWQsY0FBYyxDQUF3QjtRQUxwRCxlQUFVLEdBQUcsSUFBSSxHQUFHLEVBQXFCLENBQUM7UUFDMUMsc0JBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQStCLENBQUM7UUFNakUsQ0FBQyxpQkFBaUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRSxJQUFJLENBQUMsaUJBQWlCLENBQUM7WUFDckIsSUFBSSxFQUFFLFlBQVk7WUFDbEIsSUFBSSxFQUFFLGdCQUFnQjtTQUN2QixDQUFDLENBQUM7UUFFSCxNQUFBLElBQUksQ0FBQyxjQUFjLDBDQUFFLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFO1lBQzlELE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDekUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxFQUFFLG1CQUFtQixFQUFFLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQztZQUN0RixnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLGlDQUFNLENBQUMsS0FBRSxNQUFNLEVBQUUsRUFBRSxJQUFHLENBQUMsQ0FBQztRQUM5RSxDQUFDLEVBQUU7SUFDTCxDQUFDO0lBRU0sb0JBQW9CO1FBQ3pCLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQWlCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2hHLENBQUM7SUFFRCxvREFBb0Q7SUFDN0MsWUFBWTtRQUNmLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQixDQUFDO0lBRU0saUJBQWlCLENBQUMsU0FBd0I7UUFDL0MsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxDQUFDLGNBQWMsSUFBSSxjQUFjLEtBQUssU0FBUyxDQUFDLElBQUksRUFBRTtZQUN6RCxNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsU0FBUyxDQUFDLElBQUksMkNBQTJDLGNBQWMsRUFBRSxDQUFDLENBQUM7WUFDbEksTUFBTSxHQUFHLENBQUM7U0FDWDtRQUNELElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BELE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxFQUFFO1lBQ0wsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDM0I7SUFDSCxDQUFDO0lBRU0sZ0JBQWdCLENBQUMsU0FBaUI7UUFDdkMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLEVBQUU7WUFDTCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDM0I7UUFFRCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxDQUFDLEVBQUU7WUFDTixDQUFDLEdBQUcsSUFBSSxRQUFRLEVBQWEsQ0FBQztZQUM5QixJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUMxQztRQUNELE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUNuQixDQUFDOzs7WUF6REYsVUFBVTs7O3dDQU1OLE1BQU0sU0FBQyxzQkFBc0IsY0FBRyxRQUFRO1lBVnBDLHFCQUFxQix1QkFXekIsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSwgT3B0aW9uYWwsIFR5cGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQ29tcG9uZW50VHlwZSwgR29sZGVuTGF5b3V0Q29tcG9uZW50cyB9IGZyb20gJy4vY29uZmlnJztcclxuaW1wb3J0IHsgUGx1Z2luUmVnaXN0cnlTZXJ2aWNlIH0gZnJvbSAnLi9wbHVnaW4tcmVnaXN0cnkuc2VydmljZSc7XHJcbmltcG9ydCB7IERlZmVycmVkIH0gZnJvbSAnLi9kZWZlcnJlZCc7XHJcbmltcG9ydCB7IFdyYXBwZXJDb21wb25lbnQgfSBmcm9tICcuL3dyYXBwZXIuY29tcG9uZW50JztcclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIENvbXBvbmVudFJlZ2lzdHJ5U2VydmljZSB7XHJcbiAgcHJpdmF0ZSBjb21wb25lbnRzID0gbmV3IE1hcDxzdHJpbmcsIFR5cGU8YW55Pj4oKTtcclxuICBwcml2YXRlIGF3YWl0ZWRDb21wb25lbnRzID0gbmV3IE1hcDxzdHJpbmcsIERlZmVycmVkPFR5cGU8YW55Pj4+KCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgQEluamVjdChHb2xkZW5MYXlvdXRDb21wb25lbnRzKSBAT3B0aW9uYWwoKSBpbml0aWFsQ29tcG9uZW50cz86IENvbXBvbmVudFR5cGVbXSxcclxuICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcGx1Z2luUmVnaXN0cnk/OiBQbHVnaW5SZWdpc3RyeVNlcnZpY2UsXHJcbiAgKSB7XHJcbiAgICAoaW5pdGlhbENvbXBvbmVudHMgfHwgW10pLmZvckVhY2goYyA9PiB0aGlzLnJlZ2lzdGVyQ29tcG9uZW50KGMpKTtcclxuICAgIHRoaXMucmVnaXN0ZXJDb21wb25lbnQoe1xyXG4gICAgICBuYW1lOiAnZ2wtd3JhcHBlcicsXHJcbiAgICAgIHR5cGU6IFdyYXBwZXJDb21wb25lbnQsXHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLnBsdWdpblJlZ2lzdHJ5Py5wbHVnaW5Mb2FkZWQkLnN1YnNjcmliZSgoeyBpZCwgbW9kdWxlIH0pID0+IHtcclxuICAgICAgY29uc3QgcmVnaXN0ZXJlZFRva2VucyA9IG1vZHVsZS5pbmplY3Rvci5nZXQoR29sZGVuTGF5b3V0Q29tcG9uZW50cywgW10pO1xyXG4gICAgICBjb25zb2xlLmxvZygnUGx1Z2luJywgaWQsICd3YW50cyB0byByZWdpc3RlcicsIHJlZ2lzdGVyZWRUb2tlbnMubGVuZ3RoLCAnY29tcG9uZW50cycpO1xyXG4gICAgICByZWdpc3RlcmVkVG9rZW5zLmZvckVhY2goYyA9PiB0aGlzLnJlZ2lzdGVyQ29tcG9uZW50KHsgLi4uYywgcGx1Z2luOiBpZCB9KSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZWdpc3RlcmVkQ29tcG9uZW50cygpOiBDb21wb25lbnRUeXBlW10ge1xyXG4gICAgcmV0dXJuIFsuLi50aGlzLmNvbXBvbmVudHMuZW50cmllcygpXS5tYXAoKGUpOiBDb21wb25lbnRUeXBlID0+ICh7IG5hbWU6IGVbMF0sIHR5cGU6IGVbMV0gfSkpO1xyXG4gIH1cclxuXHJcbiAgLy8gVGhpcyBpcyBvbmx5IGZvciB1c2UgYnkgdGhlIEdvbGRlbkxheW91dENvbXBvbmVudFxyXG4gIHB1YmxpYyBjb21wb25lbnRNYXAoKTogTWFwPHN0cmluZywgVHlwZTxhbnk+PiB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVnaXN0ZXJDb21wb25lbnQoY29tcG9uZW50OiBDb21wb25lbnRUeXBlKSB7XHJcbiAgICBjb25zdCBvdGhlckNvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50cy5nZXQoY29tcG9uZW50Lm5hbWUpO1xyXG4gICAgaWYgKCEhb3RoZXJDb21wb25lbnQgJiYgb3RoZXJDb21wb25lbnQgIT09IGNvbXBvbmVudC50eXBlKSB7XHJcbiAgICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcihgRmFpbGVkIHRvIHJlZ2lzdGVyIGNvbXBvbmVudCwgJHtjb21wb25lbnQubmFtZX0gaXMgYWxyZWFkeSB0YWtlbiBieSBhbm90aGVyIGNvbXBvbmVudDogJHtvdGhlckNvbXBvbmVudH1gKTtcclxuICAgICAgdGhyb3cgZXJyO1xyXG4gICAgfVxyXG4gICAgdGhpcy5jb21wb25lbnRzLnNldChjb21wb25lbnQubmFtZSwgY29tcG9uZW50LnR5cGUpO1xyXG4gICAgY29uc3QgZCA9IHRoaXMuYXdhaXRlZENvbXBvbmVudHMuZ2V0KGNvbXBvbmVudC5uYW1lKTtcclxuICAgIGlmIChkKSB7XHJcbiAgICAgIHRoaXMuYXdhaXRlZENvbXBvbmVudHMuZGVsZXRlKGNvbXBvbmVudC5uYW1lKTtcclxuICAgICAgZC5yZXNvbHZlKGNvbXBvbmVudC50eXBlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyB3YWl0Rm9yQ29tcG9uZW50KGNvbXBvbmVudDogc3RyaW5nKTogUHJvbWlzZTxUeXBlPGFueT4+IHtcclxuICAgIGNvbnN0IGMgPSB0aGlzLmNvbXBvbmVudHMuZ2V0KGNvbXBvbmVudCk7XHJcbiAgICBpZiAoYykge1xyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGMpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBkID0gdGhpcy5hd2FpdGVkQ29tcG9uZW50cy5nZXQoY29tcG9uZW50KTtcclxuICAgIGlmICghZCkge1xyXG4gICAgICBkID0gbmV3IERlZmVycmVkPFR5cGU8YW55Pj4oKTtcclxuICAgICAgdGhpcy5hd2FpdGVkQ29tcG9uZW50cy5zZXQoY29tcG9uZW50LCBkKTtcclxuICAgIH1cclxuICAgIHJldHVybiBkLnByb21pc2U7XHJcbiAgfVxyXG59XHJcbiJdfQ==