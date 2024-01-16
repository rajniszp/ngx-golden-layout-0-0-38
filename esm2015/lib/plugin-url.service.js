import { __decorate } from "tslib";
import { MultiWindowService } from './multiwindow-service';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
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
export { PluginURLProvider };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luLXVybC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL25neC1nb2xkZW4tbGF5b3V0L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9wbHVnaW4tdXJsLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzNELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLE9BQU8sRUFBYyxNQUFNLE1BQU0sQ0FBQztBQU0xQyxDQUFDO0FBRUY7Ozs7R0FJRztJQUdVLGlCQUFpQixTQUFqQixpQkFBaUI7O1FBQ3BCLGVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztRQUN2QyxVQUFLLEdBQUcsSUFBSSxPQUFPLEVBQWMsQ0FBQztRQUNsQyxZQUFPLEdBQUcsSUFBSSxPQUFPLEVBQVUsQ0FBQztJQWdDMUMsQ0FBQztJQTlCUSxhQUFhO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBQ00sZUFBZTtRQUNwQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEIsQ0FBQztJQUNNLFVBQVU7UUFDZixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBRU0sV0FBVyxDQUFDLEVBQVUsRUFBRSxHQUFXO1FBQ3hDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxFQUFFO1lBQ0wsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO2dCQUNiLE1BQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxFQUFFLHFDQUFxQyxDQUFDLENBQUM7YUFDcEU7WUFDRCxPQUFPO1NBQ1I7UUFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU0sYUFBYSxDQUFDLEVBQVU7UUFDN0IsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLENBQUMsRUFBRTtZQUNOLE1BQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDLENBQUM7U0FDL0M7UUFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN4QixDQUFDO0NBQ0YsQ0FBQTs7WUFwQ0EsVUFBVTs7QUFDRSxpQkFBaUI7SUFGN0Isa0JBQWtCLENBQW9CLHdCQUF3QixDQUFDO0dBRW5ELGlCQUFpQixDQW1DN0I7U0FuQ1ksaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTXVsdGlXaW5kb3dTZXJ2aWNlIH0gZnJvbSAnLi9tdWx0aXdpbmRvdy1zZXJ2aWNlJztcclxuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBTdWJqZWN0LCBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XHJcblxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJUGx1Z2luVVJMIHtcclxuICBpZDogc3RyaW5nLFxyXG4gIHVybDogc3RyaW5nLFxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRoaXMgY2xhc3MgbWFuYWdlcyBwbHVnaW4gbG9hZCBhbmQgdW5sb2FkIHJlcXVlc3RzIGFjcm9zcyBhbGwgd2luZG93cy5cclxuICogQmVjYXVzZSB3ZSBjYW4ndCBoYXZlIHByb2dyZXNzIHJlcG9ydGluZyBhYm91dCBhbGwgd2luZG93cywgd2UgYWxzbyBkb24ndFxyXG4gKiByZXR1cm4gYW55IHByb2dyZXNzL3N1Y2Nlc3MgaW5kaWNhdG9yIGhlcmUuXHJcbiAqL1xyXG5ATXVsdGlXaW5kb3dTZXJ2aWNlPFBsdWdpblVSTFByb3ZpZGVyPignX2dsX19QbHVnaW5VUkxQcm92aWRlcicpXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIFBsdWdpblVSTFByb3ZpZGVyIHtcclxuICBwcml2YXRlIGxvYWRlZFVSTHMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xyXG4gIHByaXZhdGUgbG9hZHMgPSBuZXcgU3ViamVjdDxJUGx1Z2luVVJMPigpO1xyXG4gIHByaXZhdGUgdW5sb2FkcyA9IG5ldyBTdWJqZWN0PHN0cmluZz4oKTtcclxuXHJcbiAgcHVibGljIGxvYWRSZXF1ZXN0cyQoKTogT2JzZXJ2YWJsZTxJUGx1Z2luVVJMPiB7XHJcbiAgICByZXR1cm4gdGhpcy5sb2FkcztcclxuICB9XHJcbiAgcHVibGljIHVubG9hZFJlcXVlc3RzJCgpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xyXG4gICAgcmV0dXJuIHRoaXMudW5sb2FkcztcclxuICB9XHJcbiAgcHVibGljIGFsbFBsdWdpbnMoKTogSVBsdWdpblVSTFtdIHtcclxuICAgIHJldHVybiBbLi4udGhpcy5sb2FkZWRVUkxzLmVudHJpZXMoKV0ubWFwKHAgPT4gKHsgaWQ6IHBbMF0sIHVybDogcFsxXSB9KSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVxdWVzdExvYWQoaWQ6IHN0cmluZywgdXJsOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IHAgPSB0aGlzLmxvYWRlZFVSTHMuZ2V0KGlkKTtcclxuICAgIGlmIChwKSB7XHJcbiAgICAgIGlmIChwICE9PSB1cmwpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBsdWdpbiAke2lkfSBpcyBhbHJlYWR5IGxvYWRlZCB3aXRoIGFub3RoZXIgVVJMYCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy5sb2FkZWRVUkxzLnNldChpZCwgdXJsKTtcclxuICAgIHRoaXMubG9hZHMubmV4dCh7IGlkLCB1cmwgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVxdWVzdFVubG9hZChpZDogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBwID0gdGhpcy5sb2FkZWRVUkxzLmdldChpZCk7XHJcbiAgICBpZiAoIXApIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQbHVnaW4gJHtpZH0gaXMgbm90IGxvYWRlZGApO1xyXG4gICAgfVxyXG4gICAgdGhpcy5sb2FkZWRVUkxzLmRlbGV0ZShpZCk7XHJcbiAgICB0aGlzLnVubG9hZHMubmV4dChpZCk7XHJcbiAgfVxyXG59XHJcbiJdfQ==