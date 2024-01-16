import { NgModule, ANALYZE_FOR_ENTRY_COMPONENTS } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoldenLayoutComponent } from './golden-layout.component';
import { RootWindowService } from './root-window.service';
import * as config from './config';
import { ComponentRegistryService } from './component-registry.service';
import { FallbackComponent } from './fallback';
import { PluginRegistryService, MockPluginRegistryService } from './plugin-registry.service';
import { WindowSynchronizerService, MockWindowSynchronizerService } from './window-sync.service';
import { PluginURLProvider } from './plugin-url.service';
import { WrapperComponent } from './wrapper.component';
export class GoldenLayoutModule {
    static forRoot(types, fallback, pluginDeps) {
        return {
            ngModule: GoldenLayoutModule,
            providers: [
                ComponentRegistryService,
                RootWindowService,
                PluginRegistryService,
                PluginURLProvider,
                WindowSynchronizerService,
                { provide: config.GoldenLayoutComponents, useValue: types, },
                { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: [types, fallback, WrapperComponent], multi: true },
                { provide: config.GoldenLayoutPluginDependency, useValue: pluginDeps },
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
            { provide: config.GoldenLayoutComponents, useValue: types, },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL25neC1nb2xkZW4tbGF5b3V0L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBdUIsNEJBQTRCLEVBQWtCLE1BQU0sZUFBZSxDQUFDO0FBQzVHLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRCxPQUFPLEtBQUssTUFBTSxNQUFNLFVBQVUsQ0FBQztBQUNuQyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUN4RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDL0MsT0FBTyxFQUFFLHFCQUFxQixFQUFFLHlCQUF5QixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDN0YsT0FBTyxFQUFFLHlCQUF5QixFQUFFLDZCQUE2QixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDakcsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDekQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFPdkQsTUFBTSxPQUFPLGtCQUFrQjtJQUN0QixNQUFNLENBQUMsT0FBTyxDQUFDLEtBQTZCLEVBQUUsUUFBb0IsRUFBRSxVQUEwQztRQUNuSCxPQUFPO1lBQ0wsUUFBUSxFQUFFLGtCQUFrQjtZQUM1QixTQUFTLEVBQUU7Z0JBQ1Qsd0JBQXdCO2dCQUN4QixpQkFBaUI7Z0JBQ2pCLHFCQUFxQjtnQkFDckIsaUJBQWlCO2dCQUNqQix5QkFBeUI7Z0JBQ3pCLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxzQkFBc0IsRUFBRSxRQUFRLEVBQUUsS0FBSyxHQUFHO2dCQUM1RCxFQUFFLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtnQkFDckcsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLDRCQUE0QixFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUU7Z0JBQ3RFLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUU7YUFDbkQ7U0FDRixDQUFDO0lBQ0osQ0FBQztJQUVNLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBNkIsRUFBRSxRQUFvQjtRQUN4RSxPQUFPO1lBQ0wsd0JBQXdCO1lBQ3hCLEVBQUUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLFFBQVEsRUFBRSx5QkFBeUIsRUFBRTtZQUN2RSxFQUFFLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxRQUFRLEVBQUUsNkJBQTZCLEVBQUU7WUFDL0UsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtZQUM5QyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsc0JBQXNCLEVBQUUsUUFBUSxFQUFFLEtBQUssR0FBRztZQUM1RCxFQUFFLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtZQUNyRyxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFO1NBQ25ELENBQUM7SUFDSixDQUFDOzs7WUFqQ0YsUUFBUSxTQUFDO2dCQUNSLFlBQVksRUFBRSxDQUFDLHFCQUFxQixFQUFFLGdCQUFnQixDQUFDO2dCQUN2RCxPQUFPLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztnQkFDaEMsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO2FBQ3hCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUsIE1vZHVsZVdpdGhQcm92aWRlcnMsIEFOQUxZWkVfRk9SX0VOVFJZX0NPTVBPTkVOVFMsIFR5cGUsIFByb3ZpZGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IEdvbGRlbkxheW91dENvbXBvbmVudCB9IGZyb20gJy4vZ29sZGVuLWxheW91dC5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBSb290V2luZG93U2VydmljZSB9IGZyb20gJy4vcm9vdC13aW5kb3cuc2VydmljZSc7XHJcbmltcG9ydCAqIGFzIGNvbmZpZyBmcm9tICcuL2NvbmZpZyc7XHJcbmltcG9ydCB7IENvbXBvbmVudFJlZ2lzdHJ5U2VydmljZSB9IGZyb20gJy4vY29tcG9uZW50LXJlZ2lzdHJ5LnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBGYWxsYmFja0NvbXBvbmVudCB9IGZyb20gJy4vZmFsbGJhY2snO1xyXG5pbXBvcnQgeyBQbHVnaW5SZWdpc3RyeVNlcnZpY2UsIE1vY2tQbHVnaW5SZWdpc3RyeVNlcnZpY2UgfSBmcm9tICcuL3BsdWdpbi1yZWdpc3RyeS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgV2luZG93U3luY2hyb25pemVyU2VydmljZSwgTW9ja1dpbmRvd1N5bmNocm9uaXplclNlcnZpY2UgfSBmcm9tICcuL3dpbmRvdy1zeW5jLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBQbHVnaW5VUkxQcm92aWRlciB9IGZyb20gJy4vcGx1Z2luLXVybC5zZXJ2aWNlJztcclxuaW1wb3J0IHsgV3JhcHBlckNvbXBvbmVudCB9IGZyb20gJy4vd3JhcHBlci5jb21wb25lbnQnO1xyXG5cclxuQE5nTW9kdWxlKHtcclxuICBkZWNsYXJhdGlvbnM6IFtHb2xkZW5MYXlvdXRDb21wb25lbnQsIFdyYXBwZXJDb21wb25lbnRdLFxyXG4gIGV4cG9ydHM6IFtHb2xkZW5MYXlvdXRDb21wb25lbnRdLFxyXG4gIGltcG9ydHM6IFtDb21tb25Nb2R1bGVdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBHb2xkZW5MYXlvdXRNb2R1bGUge1xyXG4gIHB1YmxpYyBzdGF0aWMgZm9yUm9vdCh0eXBlczogY29uZmlnLkNvbXBvbmVudFR5cGVbXSwgZmFsbGJhY2s/OiBUeXBlPGFueT4sIHBsdWdpbkRlcHM/OiBjb25maWcuUGx1Z2luRGVwZW5kZW5jeVR5cGVbXSk6IE1vZHVsZVdpdGhQcm92aWRlcnM8R29sZGVuTGF5b3V0TW9kdWxlPiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBuZ01vZHVsZTogR29sZGVuTGF5b3V0TW9kdWxlLFxyXG4gICAgICBwcm92aWRlcnM6IFtcclxuICAgICAgICBDb21wb25lbnRSZWdpc3RyeVNlcnZpY2UsXHJcbiAgICAgICAgUm9vdFdpbmRvd1NlcnZpY2UsXHJcbiAgICAgICAgUGx1Z2luUmVnaXN0cnlTZXJ2aWNlLFxyXG4gICAgICAgIFBsdWdpblVSTFByb3ZpZGVyLFxyXG4gICAgICAgIFdpbmRvd1N5bmNocm9uaXplclNlcnZpY2UsXHJcbiAgICAgICAgeyBwcm92aWRlOiBjb25maWcuR29sZGVuTGF5b3V0Q29tcG9uZW50cywgdXNlVmFsdWU6IHR5cGVzLCB9LFxyXG4gICAgICAgIHsgcHJvdmlkZTogQU5BTFlaRV9GT1JfRU5UUllfQ09NUE9ORU5UUywgdXNlVmFsdWU6IFt0eXBlcywgZmFsbGJhY2ssIFdyYXBwZXJDb21wb25lbnRdLCBtdWx0aTogdHJ1ZSB9LFxyXG4gICAgICAgIHsgcHJvdmlkZTogY29uZmlnLkdvbGRlbkxheW91dFBsdWdpbkRlcGVuZGVuY3ksIHVzZVZhbHVlOiBwbHVnaW5EZXBzIH0sXHJcbiAgICAgICAgeyBwcm92aWRlOiBGYWxsYmFja0NvbXBvbmVudCwgdXNlVmFsdWU6IGZhbGxiYWNrIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBmb3JDaGlsZCh0eXBlczogY29uZmlnLkNvbXBvbmVudFR5cGVbXSwgZmFsbGJhY2s/OiBUeXBlPGFueT4pOiBQcm92aWRlcltdIHtcclxuICAgIHJldHVybiBbXHJcbiAgICAgIENvbXBvbmVudFJlZ2lzdHJ5U2VydmljZSxcclxuICAgICAgeyBwcm92aWRlOiBQbHVnaW5SZWdpc3RyeVNlcnZpY2UsIHVzZUNsYXNzOiBNb2NrUGx1Z2luUmVnaXN0cnlTZXJ2aWNlIH0sXHJcbiAgICAgIHsgcHJvdmlkZTogV2luZG93U3luY2hyb25pemVyU2VydmljZSwgdXNlQ2xhc3M6IE1vY2tXaW5kb3dTeW5jaHJvbml6ZXJTZXJ2aWNlIH0sXHJcbiAgICAgIHsgcHJvdmlkZTogUGx1Z2luVVJMUHJvdmlkZXIsIHVzZVZhbHVlOiBudWxsIH0sXHJcbiAgICAgIHsgcHJvdmlkZTogY29uZmlnLkdvbGRlbkxheW91dENvbXBvbmVudHMsIHVzZVZhbHVlOiB0eXBlcywgfSxcclxuICAgICAgeyBwcm92aWRlOiBBTkFMWVpFX0ZPUl9FTlRSWV9DT01QT05FTlRTLCB1c2VWYWx1ZTogW3R5cGVzLCBmYWxsYmFjaywgV3JhcHBlckNvbXBvbmVudF0sIG11bHRpOiB0cnVlIH0sXHJcbiAgICAgIHsgcHJvdmlkZTogRmFsbGJhY2tDb21wb25lbnQsIHVzZVZhbHVlOiBmYWxsYmFjayB9LFxyXG4gICAgXTtcclxuICB9XHJcbn1cclxuXHJcbiJdfQ==