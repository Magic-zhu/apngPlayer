declare class APNG {
    static installed: boolean;
    static pluginName: string;
    on: Function;
    emit: Function;
    canYouUseCache: boolean;
    constructor();
    private checkNativeFeatures;
    isSupport(ignoreNativeAPNG?: boolean): Promise<boolean>;
    parseBuffer(buffer: Uint8Array): Promise<{}>;
    parseURL(url: string, independent: boolean): Promise<any>;
    animateImage(img: HTMLImageElement, autoplay?: boolean, independent?: boolean, engine?: string): Promise<any>;
    bindCanvas(url: string, canvasDom: HTMLElement): void;
    ifHasCache(src: string): Promise<unknown>;
    static install(mot: any): void;
}
export default APNG;
