import { AnimationOptions, HookMap } from './interface';
declare class Animation {
    width: number;
    height: number;
    numPlays: number;
    actualPlays: number;
    playTime: number;
    frames: any[];
    rate: number;
    isWebGL: boolean;
    nextRenderTime: number;
    fNum: number;
    prevF: any;
    played: boolean;
    finished: boolean;
    contexts: any[];
    contextsBackup: any[];
    endFrame: number;
    startFrame: number;
    beforeHook: Function | null;
    afterHook: Function | null;
    beforeHookPure: Function | null;
    afterHookPure: Function | null;
    pauseNum: number;
    manualEndNum: number;
    manualPlayNum: number;
    keep: boolean;
    hookmap: HookMap;
    onceHookMap: HookMap;
    constructor();
    play(frameRange?: number[]): void;
    stop(): void;
    pause(frameNumber?: number): void;
    start(frameNumber?: number): void;
    clear(): void;
    before(func: Function, pure: false): void;
    after(func: Function, pure: false): void;
    on(hook: string, callback: Function): void;
    once(hook: string, callback: Function): void;
    rewind(): void;
    private setFrameNum;
    setOptions(options: AnimationOptions): void;
    addContext(ctx: CanvasRenderingContext2D | WebGLRenderingContext): void;
    removeContext(ctx: CanvasRenderingContext2D): void;
    private tick;
    private renderFrame;
}
export default Animation;