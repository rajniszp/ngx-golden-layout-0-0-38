import { Component, ViewEncapsulation, Inject } from '@angular/core';
import { GoldenLayoutComponentHost, GoldenLayoutComponentState, GoldenLayoutContainer } from './tokens';
import { implementsGlOnResize, implementsGlOnHide, implementsGlOnShow, implementsGlOnTab } from './type-guards';
export class WrapperComponent {
    constructor(host, container, state) {
        this.host = host;
        this.container = container;
        this.state = state;
        this.destroyed = false;
        this.initialized = false;
        this.originalComponent = this.host.getGoldenLayoutInstance()._getAllComponents()[this.state.originalId];
    }
    get headerComponent() {
        if (!this.originalComponent || !this.originalComponent.instance) {
            return undefined;
        }
        return this.originalComponent.instance.then(x => x.instance.headerComponent);
    }
    get additionalTokens() {
        if (!this.originalComponent || !this.originalComponent.instance) {
            return undefined;
        }
        return this.originalComponent.instance.then(x => x.instance.additionalTokens);
    }
    ngOnInit() {
        this.originalComponent.instance.then((componentRef) => {
            if (this.destroyed || this.initialized) {
                return;
            }
            this.redock(componentRef, this.container.getElement());
            this.initialized = true;
        });
    }
    ngOnDestroy() {
        this.originalComponent.instance.then((cr) => {
            if (!this.initialized || this.destroyed) {
                return;
            }
            this.redock(cr, this.originalComponent.container.getElement());
            this.destroyed = true;
        });
    }
    redock(componentRef, to) {
        const el = $(componentRef.location.nativeElement);
        el.remove();
        to.append(el);
        if (implementsGlOnResize(componentRef.instance)) {
            componentRef.instance.glOnResize();
        }
    }
    glOnHide() {
        this.originalComponent.instance.then((cr) => {
            if (implementsGlOnHide(cr.instance)) {
                cr.instance.glOnHide();
            }
        });
    }
    glOnShow() {
        this.originalComponent.instance.then((cr) => {
            if (implementsGlOnShow(cr.instance)) {
                cr.instance.glOnShow();
            }
        });
    }
    glOnResize() {
        this.originalComponent.instance.then((cr) => {
            if (implementsGlOnResize(cr.instance)) {
                cr.instance.glOnResize();
            }
        });
    }
    glOnTab(tab) {
        this.originalComponent.instance.then((cr) => {
            if (implementsGlOnTab(cr.instance)) {
                debugger;
                cr.instance.glOnTab(this.originalComponent.tab);
            }
        });
    }
}
WrapperComponent.decorators = [
    { type: Component, args: [{
                selector: 'gl-wrapper',
                encapsulation: ViewEncapsulation.None,
                template: `<div class="wrapper"></div>`
            },] }
];
WrapperComponent.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [GoldenLayoutComponentHost,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [GoldenLayoutContainer,] }] },
    { type: undefined, decorators: [{ type: Inject, args: [GoldenLayoutComponentState,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JhcHBlci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvbmd4LWdvbGRlbi1sYXlvdXQvc3JjLyIsInNvdXJjZXMiOlsibGliL3dyYXBwZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFtQyxNQUFNLGVBQWUsQ0FBQztBQUV0RyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsMEJBQTBCLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDeEcsT0FBTyxFQUFFLG9CQUFvQixFQUFFLGtCQUFrQixFQUFFLGtCQUFrQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBT2hILE1BQU0sT0FBTyxnQkFBZ0I7SUEwQjNCLFlBQzZDLElBQVMsRUFDYixTQUFjLEVBQ1QsS0FBVTtRQUZYLFNBQUksR0FBSixJQUFJLENBQUs7UUFDYixjQUFTLEdBQVQsU0FBUyxDQUFLO1FBQ1QsVUFBSyxHQUFMLEtBQUssQ0FBSztRQU5oRCxjQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ2xCLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBTzFCLElBQUksQ0FBQyxpQkFBaUIsR0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ25ILENBQUM7SUF2QkQsSUFBSSxlQUFlO1FBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFO1lBQy9ELE9BQU8sU0FBUyxDQUFDO1NBQ2xCO1FBQ0QsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsZUFB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LENBQUMsQ0FBQyxFQUFxQixFQUFFLEVBQUU7WUFDN0QsSUFBSSxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ2xDLFFBQVEsQ0FBQztnQkFDVCxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDakQ7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7OztZQWpHRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLFlBQVk7Z0JBQ3RCLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2dCQUNyQyxRQUFRLEVBQUUsNkJBQTZCO2FBQ3hDOzs7NENBNEJJLE1BQU0sU0FBQyx5QkFBeUI7NENBQ2hDLE1BQU0sU0FBQyxxQkFBcUI7NENBQzVCLE1BQU0sU0FBQywwQkFBMEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIFZpZXdFbmNhcHN1bGF0aW9uLCBJbmplY3QsIE9uSW5pdCwgQ29tcG9uZW50UmVmLCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgR2xIZWFkZXJJdGVtLCBHbE9uSGlkZSwgR2xPblNob3csIEdsT25SZXNpemUsIEdsT25UYWIgfSBmcm9tICcuL2hvb2tzJztcclxuaW1wb3J0IHsgR29sZGVuTGF5b3V0Q29tcG9uZW50SG9zdCwgR29sZGVuTGF5b3V0Q29tcG9uZW50U3RhdGUsIEdvbGRlbkxheW91dENvbnRhaW5lciB9IGZyb20gJy4vdG9rZW5zJztcclxuaW1wb3J0IHsgaW1wbGVtZW50c0dsT25SZXNpemUsIGltcGxlbWVudHNHbE9uSGlkZSwgaW1wbGVtZW50c0dsT25TaG93LCBpbXBsZW1lbnRzR2xPblRhYiB9IGZyb20gJy4vdHlwZS1ndWFyZHMnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICdnbC13cmFwcGVyJyxcclxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxyXG4gIHRlbXBsYXRlOiBgPGRpdiBjbGFzcz1cIndyYXBwZXJcIj48L2Rpdj5gXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBXcmFwcGVyQ29tcG9uZW50IGltcGxlbWVudHNcclxuICBHbEhlYWRlckl0ZW0sXHJcbiAgT25Jbml0LFxyXG4gIE9uRGVzdHJveSxcclxuICBHbE9uSGlkZSxcclxuICBHbE9uU2hvdyxcclxuICBHbE9uUmVzaXplLFxyXG4gIEdsT25UYWJcclxuIHtcclxuICBnZXQgaGVhZGVyQ29tcG9uZW50KCkge1xyXG4gICAgaWYgKCF0aGlzLm9yaWdpbmFsQ29tcG9uZW50IHx8ICF0aGlzLm9yaWdpbmFsQ29tcG9uZW50Lmluc3RhbmNlKSB7XHJcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5vcmlnaW5hbENvbXBvbmVudC5pbnN0YW5jZS50aGVuKHggPT4geC5pbnN0YW5jZS5oZWFkZXJDb21wb25lbnQpO1xyXG4gIH1cclxuICBnZXQgYWRkaXRpb25hbFRva2VucygpIHtcclxuICAgIGlmICghdGhpcy5vcmlnaW5hbENvbXBvbmVudCB8fCAhdGhpcy5vcmlnaW5hbENvbXBvbmVudC5pbnN0YW5jZSkge1xyXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMub3JpZ2luYWxDb21wb25lbnQuaW5zdGFuY2UudGhlbih4ID0+IHguaW5zdGFuY2UuYWRkaXRpb25hbFRva2Vucyk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9yaWdpbmFsQ29tcG9uZW50OiBhbnk7XHJcbiAgcHJpdmF0ZSBkZXN0cm95ZWQgPSBmYWxzZTtcclxuICBwcml2YXRlIGluaXRpYWxpemVkID0gZmFsc2U7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgQEluamVjdChHb2xkZW5MYXlvdXRDb21wb25lbnRIb3N0KSBwcml2YXRlIGhvc3Q6IGFueSxcclxuICAgIEBJbmplY3QoR29sZGVuTGF5b3V0Q29udGFpbmVyKSBwcml2YXRlIGNvbnRhaW5lcjogYW55LFxyXG4gICAgQEluamVjdChHb2xkZW5MYXlvdXRDb21wb25lbnRTdGF0ZSkgcHJpdmF0ZSBzdGF0ZTogYW55LFxyXG4gICkge1xyXG4gICAgdGhpcy5vcmlnaW5hbENvbXBvbmVudCA9ICh0aGlzLmhvc3QuZ2V0R29sZGVuTGF5b3V0SW5zdGFuY2UoKSBhcyBhbnkpLl9nZXRBbGxDb21wb25lbnRzKClbdGhpcy5zdGF0ZS5vcmlnaW5hbElkXTtcclxuICB9XHJcblxyXG5cclxuICBuZ09uSW5pdCgpIHtcclxuICAgIHRoaXMub3JpZ2luYWxDb21wb25lbnQuaW5zdGFuY2UudGhlbigoY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8YW55PikgPT4ge1xyXG4gICAgICBpZiAodGhpcy5kZXN0cm95ZWQgfHwgdGhpcy5pbml0aWFsaXplZCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnJlZG9jayhjb21wb25lbnRSZWYsIHRoaXMuY29udGFpbmVyLmdldEVsZW1lbnQoKSk7XHJcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgdGhpcy5vcmlnaW5hbENvbXBvbmVudC5pbnN0YW5jZS50aGVuKChjcjogQ29tcG9uZW50UmVmPGFueT4pID0+IHtcclxuICAgICAgaWYgKCF0aGlzLmluaXRpYWxpemVkIHx8IHRoaXMuZGVzdHJveWVkKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucmVkb2NrKGNyLCB0aGlzLm9yaWdpbmFsQ29tcG9uZW50LmNvbnRhaW5lci5nZXRFbGVtZW50KCkpO1xyXG4gICAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWU7XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSByZWRvY2soY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8YW55PiwgdG86IEpRdWVyeSkge1xyXG4gICAgY29uc3QgZWwgPSAkKGNvbXBvbmVudFJlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50KTtcclxuICAgIGVsLnJlbW92ZSgpO1xyXG4gICAgdG8uYXBwZW5kKGVsKTtcclxuICAgIGlmIChpbXBsZW1lbnRzR2xPblJlc2l6ZShjb21wb25lbnRSZWYuaW5zdGFuY2UpKSB7XHJcbiAgICAgIGNvbXBvbmVudFJlZi5pbnN0YW5jZS5nbE9uUmVzaXplKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnbE9uSGlkZSgpIHtcclxuICAgIHRoaXMub3JpZ2luYWxDb21wb25lbnQuaW5zdGFuY2UudGhlbigoY3I6IENvbXBvbmVudFJlZjxhbnk+KSA9PiB7XHJcbiAgICAgIGlmIChpbXBsZW1lbnRzR2xPbkhpZGUoY3IuaW5zdGFuY2UpKSB7XHJcbiAgICAgICAgY3IuaW5zdGFuY2UuZ2xPbkhpZGUoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGdsT25TaG93KCkge1xyXG4gICAgdGhpcy5vcmlnaW5hbENvbXBvbmVudC5pbnN0YW5jZS50aGVuKChjcjogQ29tcG9uZW50UmVmPGFueT4pID0+IHtcclxuICAgICAgaWYgKGltcGxlbWVudHNHbE9uU2hvdyhjci5pbnN0YW5jZSkpIHtcclxuICAgICAgICBjci5pbnN0YW5jZS5nbE9uU2hvdygpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbiAgZ2xPblJlc2l6ZSgpIHtcclxuICAgIHRoaXMub3JpZ2luYWxDb21wb25lbnQuaW5zdGFuY2UudGhlbigoY3I6IENvbXBvbmVudFJlZjxhbnk+KSA9PiB7XHJcbiAgICAgIGlmIChpbXBsZW1lbnRzR2xPblJlc2l6ZShjci5pbnN0YW5jZSkpIHtcclxuICAgICAgICBjci5pbnN0YW5jZS5nbE9uUmVzaXplKCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICBnbE9uVGFiKHRhYjogYW55KSB7XHJcbiAgICB0aGlzLm9yaWdpbmFsQ29tcG9uZW50Lmluc3RhbmNlLnRoZW4oKGNyOiBDb21wb25lbnRSZWY8YW55PikgPT4ge1xyXG4gICAgICBpZiAoaW1wbGVtZW50c0dsT25UYWIoY3IuaW5zdGFuY2UpKSB7XHJcbiAgICAgICAgZGVidWdnZXI7XHJcbiAgICAgICAgY3IuaW5zdGFuY2UuZ2xPblRhYih0aGlzLm9yaWdpbmFsQ29tcG9uZW50LnRhYik7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXX0=