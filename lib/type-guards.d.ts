import { GlOnResize, GlOnShow, GlOnHide, GlOnTab, GlOnClose, GlOnPopin, GlOnUnload, GlOnPopout, GlHeaderItem } from "./hooks";
/**
 * Type guard which determines if a component implements the GlOnResize interface.
 */
export declare function implementsGlOnResize(obj: any): obj is GlOnResize;
/**
 * Type guard which determines if a component implements the GlOnShow interface.
 */
export declare function implementsGlOnShow(obj: any): obj is GlOnShow;
/**
 * Type guard which determines if a component implements the GlOnHide interface.
 */
export declare function implementsGlOnHide(obj: any): obj is GlOnHide;
/**
 * Type guard which determines if a component implements the GlOnTab interface.
 */
export declare function implementsGlOnTab(obj: any): obj is GlOnTab;
/**
 * Type guard which determines if a component implements the GlOnClose interface.
 */
export declare function implementsGlOnClose(obj: any): obj is GlOnClose;
export declare function implementsGlOnPopin(obj: any): obj is GlOnPopin;
export declare function implementsGlOnUnload(obj: any): obj is GlOnUnload;
export declare function implementsGlOnPopout(obj: any): obj is GlOnPopout;
export declare function implementsGlHeaderItem(obj: any): obj is GlHeaderItem;
export declare const uuid: () => string;
