import { InjectionToken } from '@angular/core';
/**
 * Inject an angular component using this token to indicate
 * that the component should be rendered when there is an error rendering
 * the actual component.
 * Errors could be exceptions thrown at construction time or a not-registered component.
 */
export const FallbackComponent = new InjectionToken("fallback component");
/**
 * This token is injected into the FallbackComponent when it is instantiated and contains
 * the name of the component that failed to initialize.
 */
export const FailedComponent = new InjectionToken("failed component");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmFsbGJhY2suanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvbmd4LWdvbGRlbi1sYXlvdXQvc3JjLyIsInNvdXJjZXMiOlsibGliL2ZhbGxiYWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQVEsTUFBTSxlQUFlLENBQUM7QUFFckQ7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLGNBQWMsQ0FBWSxvQkFBb0IsQ0FBQyxDQUFDO0FBRXJGOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxJQUFJLGNBQWMsQ0FBUyxrQkFBa0IsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0aW9uVG9rZW4sIFR5cGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbi8qKlxyXG4gKiBJbmplY3QgYW4gYW5ndWxhciBjb21wb25lbnQgdXNpbmcgdGhpcyB0b2tlbiB0byBpbmRpY2F0ZVxyXG4gKiB0aGF0IHRoZSBjb21wb25lbnQgc2hvdWxkIGJlIHJlbmRlcmVkIHdoZW4gdGhlcmUgaXMgYW4gZXJyb3IgcmVuZGVyaW5nXHJcbiAqIHRoZSBhY3R1YWwgY29tcG9uZW50LlxyXG4gKiBFcnJvcnMgY291bGQgYmUgZXhjZXB0aW9ucyB0aHJvd24gYXQgY29uc3RydWN0aW9uIHRpbWUgb3IgYSBub3QtcmVnaXN0ZXJlZCBjb21wb25lbnQuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgRmFsbGJhY2tDb21wb25lbnQgPSBuZXcgSW5qZWN0aW9uVG9rZW48VHlwZTxhbnk+PihcImZhbGxiYWNrIGNvbXBvbmVudFwiKTtcclxuXHJcbi8qKlxyXG4gKiBUaGlzIHRva2VuIGlzIGluamVjdGVkIGludG8gdGhlIEZhbGxiYWNrQ29tcG9uZW50IHdoZW4gaXQgaXMgaW5zdGFudGlhdGVkIGFuZCBjb250YWluc1xyXG4gKiB0aGUgbmFtZSBvZiB0aGUgY29tcG9uZW50IHRoYXQgZmFpbGVkIHRvIGluaXRpYWxpemUuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgRmFpbGVkQ29tcG9uZW50ID0gbmV3IEluamVjdGlvblRva2VuPHN0cmluZz4oXCJmYWlsZWQgY29tcG9uZW50XCIpO1xyXG4iXX0=