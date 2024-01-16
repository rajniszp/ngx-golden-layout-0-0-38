import { Injectable } from '@angular/core';
export class RootWindowService {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vdC13aW5kb3cuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9uZ3gtZ29sZGVuLWxheW91dC9zcmMvIiwic291cmNlcyI6WyJsaWIvcm9vdC13aW5kb3cuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRzNDLE1BQU0sT0FBTyxpQkFBaUI7SUFFNUIsZ0JBQWUsQ0FBQztJQUVULGFBQWE7UUFDbEIsSUFBSTtZQUNGLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztTQUN6RDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsT0FBTyxLQUFLLENBQUM7U0FDZDtJQUNILENBQUM7SUFFTSxhQUFhO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDdkQsQ0FBQzs7O1lBZkYsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIFJvb3RXaW5kb3dTZXJ2aWNlIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICBwdWJsaWMgaXNDaGlsZFdpbmRvdygpOiBib29sZWFuIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHJldHVybiAhIXdpbmRvdy5vcGVuZXIgJiYgISF3aW5kb3cub3BlbmVyLmxvY2F0aW9uLmhyZWY7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRSb290V2luZG93KCk6IFdpbmRvdyAmIHR5cGVvZiBnbG9iYWxUaGlzIHtcclxuICAgIHJldHVybiB0aGlzLmlzQ2hpbGRXaW5kb3coKSA/IHdpbmRvdy5vcGVuZXIgOiB3aW5kb3c7XHJcbiAgfVxyXG59XHJcbiJdfQ==