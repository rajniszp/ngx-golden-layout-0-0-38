export function MultiWindowInit() {
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
export function isChildWindow() {
    try {
        return !!window.opener && !!window.opener.location.href;
    }
    catch (e) {
        return false;
    }
}
export function MultiWindowService(uniqueName) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGl3aW5kb3ctc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9uZ3gtZ29sZGVuLWxheW91dC9zcmMvIiwic291cmNlcyI6WyJsaWIvbXVsdGl3aW5kb3ctc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFVBQVUsZUFBZTtJQUM3QixJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUU7UUFDcEIsSUFBSSxDQUFFLE1BQWMsQ0FBQyxVQUFVLElBQUksQ0FBRSxNQUFjLENBQUMscUJBQXFCLEVBQUU7WUFDeEUsTUFBYyxDQUFDLFVBQVUsR0FBRyxJQUFLLE1BQWMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUN0RCxNQUFjLENBQUMscUJBQXFCLEdBQUcsSUFBSyxNQUFjLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFbEUsaUhBQWlIO1lBQ2pILElBQUssTUFBYyxDQUFDLE9BQU8sRUFBRTtnQkFDM0IsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDcEQsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQVksRUFBRSxNQUFlLEVBQUUsUUFBaUIsRUFBRSxPQUFpQixFQUFVLEVBQUU7b0JBQzVGLE1BQU0sU0FBUyxHQUFHLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUNyRSxTQUFTLENBQUMsT0FBTyxHQUFJLE1BQWMsQ0FBQyxPQUFPLENBQUM7b0JBQzVDLE9BQU8sU0FBUyxDQUFDO2dCQUNuQixDQUFDLENBQUM7YUFDSDtTQUNGO0tBQ0Y7QUFDSCxDQUFDO0FBTUQsTUFBTSxVQUFVLGFBQWE7SUFDM0IsSUFBSTtRQUNGLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztLQUN6RDtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsT0FBTyxLQUFLLENBQUM7S0FDZDtBQUNILENBQUM7QUFFRCxNQUFNLFVBQVUsa0JBQWtCLENBQUksVUFBa0I7SUFDdEQsZUFBZSxFQUFFLENBQUM7SUFDbEIsT0FBTyxVQUFVLFdBQTJCO1FBQzFDLE1BQU0sTUFBTSxHQUFHLFdBQWtCLENBQUM7UUFDbEMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFRLENBQUM7UUFDckUsTUFBTSxvQkFBb0IsR0FBRyxVQUFVLEtBQUssTUFBTSxDQUFDO1FBQ25ELElBQUksb0JBQW9CLEVBQUU7WUFDeEIsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNuRSxJQUFJLFNBQVMsSUFBSSxTQUFTLEtBQUssTUFBTSxFQUFFO2dCQUNyQyxNQUFNLElBQUksS0FBSyxDQUFDLG9DQUFvQyxVQUFVLHFCQUFxQixTQUFTLGVBQWUsTUFBTSxFQUFFLENBQUMsQ0FBQzthQUN0SDtZQUNELFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQzFEO1FBQ0QsTUFBTSxjQUFjLEdBQUcsQ0FBQyxVQUFTLEdBQUcsSUFBVztZQUM3QyxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNoQixNQUFNLFlBQVksR0FBRyxVQUFVLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLE1BQU0sQ0FBQztnQkFDaEYsVUFBVSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLElBQUksWUFBWSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUNsRTtZQUNELE9BQU8sVUFBVSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0MsQ0FBQyxDQUFRLENBQUM7UUFDVixJQUFJLG9CQUFvQixFQUFFO1lBQ3hCLGtEQUFrRDtZQUNsRCw4Q0FBOEM7WUFDOUMsc0NBQXNDO1lBQ3RDLEtBQUssTUFBTSxJQUFJLElBQUksTUFBTSxFQUFFO2dCQUN6QixJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQy9CLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3JDO2FBQ0Y7U0FDRjtRQUNELElBQUk7WUFDRixJQUFJLG9CQUFvQixFQUFFO2dCQUN4QixNQUFNLFFBQVEsR0FBSSxPQUFlLENBQUMsV0FBVyxDQUFDLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMxRSxPQUFlLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2FBQzFFO1NBQ0Y7UUFBQyxXQUFNO1lBQ04sMkJBQTJCO1NBQzVCO1FBQ0QsT0FBTyxjQUFnQyxDQUFDO0lBQzFDLENBQUMsQ0FBQztBQUNKLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gTXVsdGlXaW5kb3dJbml0KCk6IHZvaWQge1xyXG4gIGlmICghaXNDaGlsZFdpbmRvdygpKSB7XHJcbiAgICBpZiAoISh3aW5kb3cgYXMgYW55KS5fX3NlcnZpY2VzICYmICEod2luZG93IGFzIGFueSkuX19zZXJ2aWNlQ29uc3RydWN0b3JzKSB7XHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5fX3NlcnZpY2VzID0gbmV3ICh3aW5kb3cgYXMgYW55KS5NYXAoKTtcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLl9fc2VydmljZUNvbnN0cnVjdG9ycyA9IG5ldyAod2luZG93IGFzIGFueSkuTWFwKCk7XHJcblxyXG4gICAgICAvLyBFbGVjdHJvbiBjb21wYXRpYmlsaXR5LCB3aGVuIHdlIGhhdmUgYSBnbG9iYWwgJ3JlcXVpcmUnIGluIG91ciB3aW5kb3csIHdlIHRocm93IGl0IGludG8gdGhlIG5ldyB3aW5kb3cgY29udGV4dFxyXG4gICAgICBpZiAoKHdpbmRvdyBhcyBhbnkpLnJlcXVpcmUpIHtcclxuICAgICAgICBjb25zdCBvcmlnaW5hbFdpbmRvd09wZW4gPSB3aW5kb3cub3Blbi5iaW5kKHdpbmRvdyk7XHJcbiAgICAgICAgd2luZG93Lm9wZW4gPSAodXJsPzogc3RyaW5nLCB0YXJnZXQ/OiBzdHJpbmcsIGZlYXR1cmVzPzogc3RyaW5nLCByZXBsYWNlPzogYm9vbGVhbik6IFdpbmRvdyA9PiB7XHJcbiAgICAgICAgICBjb25zdCBuZXdXaW5kb3cgPSBvcmlnaW5hbFdpbmRvd09wZW4odXJsLCB0YXJnZXQsIGZlYXR1cmVzLCByZXBsYWNlKTtcclxuICAgICAgICAgIG5ld1dpbmRvdy5yZXF1aXJlID0gKHdpbmRvdyBhcyBhbnkpLnJlcXVpcmU7XHJcbiAgICAgICAgICByZXR1cm4gbmV3V2luZG93O1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIENvbnN0cnVjdG9yPFQ+ID0ge1xyXG4gIG5ldyAoLi4uYXJnczogYW55W10pOiBUO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNDaGlsZFdpbmRvdygpOiBib29sZWFuIHtcclxuICB0cnkge1xyXG4gICAgcmV0dXJuICEhd2luZG93Lm9wZW5lciAmJiAhIXdpbmRvdy5vcGVuZXIubG9jYXRpb24uaHJlZjtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gTXVsdGlXaW5kb3dTZXJ2aWNlPFQ+KHVuaXF1ZU5hbWU6IHN0cmluZykge1xyXG4gIE11bHRpV2luZG93SW5pdCgpO1xyXG4gIHJldHVybiBmdW5jdGlvbiAoY29uc3RydWN0b3I6IENvbnN0cnVjdG9yPFQ+KTogQ29uc3RydWN0b3I8VD4ge1xyXG4gICAgY29uc3QgY29uc3RyID0gY29uc3RydWN0b3IgYXMgYW55O1xyXG4gICAgY29uc3Qgcm9vdFdpbmRvdyA9IChpc0NoaWxkV2luZG93KCkgPyB3aW5kb3cub3BlbmVyIDogd2luZG93KSBhcyBhbnk7XHJcbiAgICBjb25zdCByb290V2luZG93SXNNeVdpbmRvdyA9IHJvb3RXaW5kb3cgPT09IHdpbmRvdztcclxuICAgIGlmIChyb290V2luZG93SXNNeVdpbmRvdykge1xyXG4gICAgICBjb25zdCBjb25zdHJHb3QgPSByb290V2luZG93Ll9fc2VydmljZUNvbnN0cnVjdG9ycy5nZXQodW5pcXVlTmFtZSk7XHJcbiAgICAgIGlmIChjb25zdHJHb3QgJiYgY29uc3RyR290ICE9PSBjb25zdHIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE11bHRpV2luZG93U2VydmljZSgpOiB1bmlxdWVOYW1lICR7dW5pcXVlTmFtZX0gYWxyZWFkeSB0YWtlbiBieSAke2NvbnN0ckdvdH0sIHdhbnRlZCBieSAke2NvbnN0cn1gKTtcclxuICAgICAgfVxyXG4gICAgICByb290V2luZG93Ll9fc2VydmljZUNvbnN0cnVjdG9ycy5zZXQodW5pcXVlTmFtZSwgY29uc3RyKTtcclxuICAgIH1cclxuICAgIGNvbnN0IG5ld0NvbnN0cnVjdG9yID0gKGZ1bmN0aW9uKC4uLmFyZ3M6IGFueVtdKTogVCB7XHJcbiAgICAgIGNvbnN0IGhhc0luc3RhbmNlID0gcm9vdFdpbmRvdy5fX3NlcnZpY2VzLmhhcyh1bmlxdWVOYW1lKTtcclxuICAgICAgaWYgKCFoYXNJbnN0YW5jZSkge1xyXG4gICAgICAgIGNvbnN0IHN0b3JlZENvbnN0ciA9IHJvb3RXaW5kb3cuX19zZXJ2aWNlQ29uc3RydWN0b3JzLmdldCh1bmlxdWVOYW1lKSB8fCBjb25zdHI7XHJcbiAgICAgICAgcm9vdFdpbmRvdy5fX3NlcnZpY2VzLnNldCh1bmlxdWVOYW1lLCBuZXcgc3RvcmVkQ29uc3RyKC4uLmFyZ3MpKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcm9vdFdpbmRvdy5fX3NlcnZpY2VzLmdldCh1bmlxdWVOYW1lKTtcclxuICAgIH0pIGFzIGFueTtcclxuICAgIGlmIChyb290V2luZG93SXNNeVdpbmRvdykge1xyXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8zNjEyMFxyXG4gICAgICAvLyDJtWZhYyBpcyBjcmVhdGVkIGJlZm9yZSB0aGlzIGRlY29yYXRvciBydW5zLlxyXG4gICAgICAvLyBzbyBjb3B5IG92ZXIgdGhlIHN0YXRpYyBwcm9wZXJ0aWVzLlxyXG4gICAgICBmb3IgKGNvbnN0IHByb3AgaW4gY29uc3RyKSB7XHJcbiAgICAgICAgaWYgKGNvbnN0ci5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xyXG4gICAgICAgICAgbmV3Q29uc3RydWN0b3JbcHJvcF0gPSBjb25zdHJbcHJvcF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0cnkge1xyXG4gICAgICBpZiAocm9vdFdpbmRvd0lzTXlXaW5kb3cpIHtcclxuICAgICAgICBjb25zdCBtZXRhZGF0YSA9IChSZWZsZWN0IGFzIGFueSkuZ2V0TWV0YWRhdGEoJ2Rlc2lnbjpwYXJhbXR5cGVzJywgY29uc3RyKTtcclxuICAgICAgICAoUmVmbGVjdCBhcyBhbnkpLm1ldGFkYXRhKCdkZXNpZ246cGFyYW10eXBlcycsIG1ldGFkYXRhKShuZXdDb25zdHJ1Y3Rvcik7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAvLyBvYnZpb3VzbHksIHdlJ3JlIGluIGl2eS5cclxuICAgIH1cclxuICAgIHJldHVybiBuZXdDb25zdHJ1Y3RvciBhcyBDb25zdHJ1Y3RvcjxUPjtcclxuICB9O1xyXG59XHJcbiJdfQ==