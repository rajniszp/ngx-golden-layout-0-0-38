import { Injectable, ApplicationRef, Injector } from '@angular/core';
import { RootWindowService } from './root-window.service';
export class MockWindowSynchronizerService {
    restoreAppRefTick() { }
    onUnload() { }
}
MockWindowSynchronizerService.decorators = [
    { type: Injectable }
];
export class WindowSynchronizerService {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LXN5bmMuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9uZ3gtZ29sZGVuLWxheW91dC9zcmMvIiwic291cmNlcyI6WyJsaWIvd2luZG93LXN5bmMuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDckUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFHMUQsTUFBTSxPQUFPLDZCQUE2QjtJQUN4QyxpQkFBaUIsS0FBSSxDQUFDO0lBQ3RCLFFBQVEsS0FBSSxDQUFDOzs7WUFIZCxVQUFVOztBQU9YLE1BQU0sT0FBTyx5QkFBeUI7SUFLcEMsWUFDVSxNQUFzQixFQUN0QixXQUE4QixFQUM5QixRQUFrQjtRQUZsQixXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQUN0QixnQkFBVyxHQUFYLFdBQVcsQ0FBbUI7UUFDOUIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUxwQixhQUFRLEdBQUcsS0FBSyxDQUFDO1FBT3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNsRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFdEQsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3RCLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO1lBQzNDLE9BQWUsQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNyQyxPQUFPLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFXLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUNyRjtRQUVELDhCQUE4QjtRQUM5QixxREFBcUQ7UUFDckQsd0dBQXdHO1FBQ3hHLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFnQixDQUFDO1FBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3ZCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztTQUNuQztRQUVELHVGQUF1RjtRQUN2RixNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLE1BQWMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFFL0MsZ0VBQWdFO1FBQ2hFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLEdBQVMsRUFBRTtZQUM1QixLQUFLLE1BQU0sRUFBRSxJQUFLLElBQUksQ0FBQyxTQUFpQixDQUFDLFNBQVMsRUFBRTtnQkFDbEQsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7YUFDakM7UUFDSCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRU0saUJBQWlCO1FBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFJLElBQUksQ0FBQyxNQUFjLENBQUMsTUFBTSxDQUFDO0lBQ2pELENBQUM7SUFFTSxRQUFRO1FBQ2IsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2pCLE9BQU87U0FDUjtRQUNELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUN0QixNQUFNLEtBQUssR0FBSSxJQUFJLENBQUMsU0FBaUIsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyRSxJQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7Z0JBQ2IsSUFBSSxDQUFDLFNBQWlCLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDcEQ7U0FDRjtJQUNILENBQUM7OztZQXhERixVQUFVOzs7WUFUVSxjQUFjO1lBQzFCLGlCQUFpQjtZQURXLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBBcHBsaWNhdGlvblJlZiwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgUm9vdFdpbmRvd1NlcnZpY2UgfSBmcm9tICcuL3Jvb3Qtd2luZG93LnNlcnZpY2UnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgTW9ja1dpbmRvd1N5bmNocm9uaXplclNlcnZpY2Uge1xyXG4gIHJlc3RvcmVBcHBSZWZUaWNrKCkge31cclxuICBvblVubG9hZCgpIHt9XHJcbn1cclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIFdpbmRvd1N5bmNocm9uaXplclNlcnZpY2Uge1xyXG4gIHByaXZhdGUgdG9wV2luZG93OiBXaW5kb3cgJiB0eXBlb2YgZ2xvYmFsVGhpcztcclxuICBwcml2YXRlIGlzQ2hpbGRXaW5kb3c6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSB1bmxvYWRlZCA9IGZhbHNlO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgYXBwcmVmOiBBcHBsaWNhdGlvblJlZixcclxuICAgIHByaXZhdGUgcm9vdFNlcnZpY2U6IFJvb3RXaW5kb3dTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IsXHJcbiAgKSB7XHJcbiAgICB0aGlzLnRvcFdpbmRvdyA9IHRoaXMucm9vdFNlcnZpY2UuZ2V0Um9vdFdpbmRvdygpO1xyXG4gICAgdGhpcy5pc0NoaWxkV2luZG93ID0gdGhpcy5yb290U2VydmljZS5pc0NoaWxkV2luZG93KCk7XHJcblxyXG4gICAgaWYgKHRoaXMuaXNDaGlsZFdpbmRvdykge1xyXG4gICAgICB3aW5kb3cuZG9jdW1lbnQudGl0bGUgPSB3aW5kb3cuZG9jdW1lbnQuVVJMO1xyXG4gICAgICAoY29uc29sZSBhcyBhbnkpLl9fbG9nID0gY29uc29sZS5sb2c7XHJcbiAgICAgIGNvbnNvbGUubG9nID0gKC4uLmFyZ3M6IGFueVtdKSA9PiB0aGlzLnRvcFdpbmRvdy5jb25zb2xlLmxvZygnW0NISUxEXSA9PicsIC4uLmFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE11bHRpLVdpbmRvdyBjb21wYXRpYmlsaXR5LlxyXG4gICAgLy8gV2UgbmVlZCB0byBzeW5jaHJvbml6ZSBhbGwgYXBwUmVmcyB0aGF0IGNvdWxkIHRpY2tcclxuICAgIC8vIFN0b3JlIHRoZW0gaW4gYSBnbG9iYWwgYXJyYXkgYW5kIGFsc28gb3ZlcndyaXRlIHRoZSBpbmplY3RvciB1c2luZyB0aGUgaW5qZWN0b3IgZnJvbSB0aGUgbWFpbiB3aW5kb3cuXHJcbiAgICBsZXQgYW55V2luID0gdGhpcy50b3BXaW5kb3cgYXMgYW55O1xyXG4gICAgaWYgKCF0aGlzLmlzQ2hpbGRXaW5kb3cpIHtcclxuICAgICAgYW55V2luLl9fYXBwcmVmcyA9IFtdO1xyXG4gICAgICBhbnlXaW4uX19pbmplY3RvciA9IHRoaXMuaW5qZWN0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYXR0YWNoIHRoZSBhcHBsaWNhdGlvbiByZWZlcmVuY2UgdG8gdGhlIHJvb3Qgd2luZG93LCBzYXZlIHRoZSBvcmlnaW5hbCAndGljaycgbWV0aG9kXHJcbiAgICBhbnlXaW4uX19hcHByZWZzLnB1c2godGhpcy5hcHByZWYpO1xyXG4gICAgKHRoaXMuYXBwcmVmIGFzIGFueSkuX190aWNrID0gdGhpcy5hcHByZWYudGljaztcclxuXHJcbiAgICAvLyBPdmVyd3JpdGUgdGhlIHRpY2sgbWV0aG9kIHJ1bm5pbmcgYWxsIGFwcHJlZnMgaW4gdGhlaXIgem9uZXMuXHJcbiAgICB0aGlzLmFwcHJlZi50aWNrID0gKCk6IHZvaWQgPT4ge1xyXG4gICAgICBmb3IgKGNvbnN0IGFyIG9mICh0aGlzLnRvcFdpbmRvdyBhcyBhbnkpLl9fYXBwcmVmcykge1xyXG4gICAgICAgIGFyLl96b25lLnJ1bigoKSA9PiBhci5fX3RpY2soKSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzdG9yZUFwcFJlZlRpY2soKSB7XHJcbiAgICB0aGlzLmFwcHJlZi50aWNrID0gKHRoaXMuYXBwcmVmIGFzIGFueSkuX190aWNrO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG9uVW5sb2FkKCkge1xyXG4gICAgaWYgKHRoaXMudW5sb2FkZWQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy51bmxvYWRlZCA9IHRydWU7XHJcbiAgICBpZiAodGhpcy5pc0NoaWxkV2luZG93KSB7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gKHRoaXMudG9wV2luZG93IGFzIGFueSkuX19hcHByZWZzLmluZGV4T2YodGhpcy5hcHByZWYpO1xyXG4gICAgICBpZiAoaW5kZXggPj0gMCkge1xyXG4gICAgICAgICh0aGlzLnRvcFdpbmRvdyBhcyBhbnkpLl9fYXBwcmVmcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==