import { AnimationOptions, HookMap } from './interface';
import { glDrawImage } from './WebGL';
class Animation {
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
  contextsBackup: any[]; // backup

  endFrame: number; // -1 means to the end
  startFrame: number;
  beforeHook: Function | null;
  afterHook: Function | null;
  beforeHookPure: Function | null;
  afterHookPure: Function | null;
  pauseNum: number;
  manualEndNum: number;
  manualPlayNum: number;
  keep: boolean;

  hookmap: HookMap = {
    stop: [],
    allStop: () => {},
  };

  onceHookMap: HookMap = {
    stop: [],
    allStop: () => {},
  };

  constructor() {
    this.width = 0;
    this.height = 0;
    this.numPlays = 0;
    this.actualPlays = 0;
    this.playTime = 0;
    this.frames = [];
    this.rate = 1;
    this.nextRenderTime = 0;
    this.fNum = 0;
    this.prevF = null;
    this.played = false;
    this.finished = false;
    this.contexts = [];
    this.contextsBackup = [];
    this.endFrame = -1; // -1 means to the end
    this.startFrame = 0;
    this.beforeHook = undefined;
    this.afterHook = undefined;
    this.beforeHookPure = undefined;
    this.afterHookPure = undefined;
    this.pauseNum = 0;
    this.manualEndNum = -1;
    this.manualPlayNum = 0;
    this.keep = false;
  }

  /**
   *
   * @param frameRange
   */
  play(frameRange: number[] = []): void {
    if (this.played || this.finished) return;
    this.rewind();
    this.setFrameNum(frameRange);
    this.played = true;
    requestAnimationFrame((time: number) => {
      this.tick(time);
    });
  }

  stop() {
    this.contextsBackup = this.contexts.map(
      (item: CanvasRenderingContext2D) => item
    );
    if (this.keep === false) {
      this.contexts = [];
    }
    this.rewind();
    this.onceHookMap.allStop();
    this.onceHookMap.allStop = () => {};
    this.onceHookMap.stop.forEach((func: Function) => {
      func();
    });
    this.onceHookMap.stop = [];
    this.hookmap.allStop();
    this.hookmap.stop.forEach((func: Function) => {
      func();
    });
  }

  pause(frameNumber?: number) {
    if (frameNumber != undefined) {
      this.manualEndNum = frameNumber;
      return;
    }
    this.pauseNum = this.fNum;
    this.stop();
    this.contexts = this.contextsBackup;
  }

  start(frameNumber?: number) {
    this.fNum = this.pauseNum;
    if (frameNumber != undefined) this.fNum = frameNumber;
    this.played = true;
    requestAnimationFrame((time: number) => {
      this.tick(time);
    });
  }

  clear() {
    if(!this.isWebGL){
      this.contextsBackup.forEach((ctx) => {
        ctx.clearRect(0, 0, this.width, this.height);
      });
    }else{
      this.contextsBackup.forEach((gl:WebGLRenderingContext)=>{
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      })
    }
  }

  before(func: Function, pure:false): void {
    if(pure) {
      this.beforeHookPure = func || null;
    }else{
      this.beforeHook = func || null;
    }
  }

  after(func: Function, pure:false): void {
    if(pure){
      this.afterHookPure = func || null;
    }else{
      this.afterHook = func || null;
    }
  }

  on(hook: string, callback: Function) {
    if (callback == undefined) {
      return;
    }
    switch (hook) {
      case 'stop':
        this.hookmap.stop.push(callback);
        break;
      case 'allStop':
        this.hookmap.allStop = callback;
        break;
    }
  }

  once(hook: string, callback: Function) {
    if (callback == undefined) {
      return;
    }
    switch (hook) {
      case 'stop':
        this.onceHookMap.stop.push(callback);
        break;
      case 'allStop':
        this.onceHookMap.allStop = callback;
        break;
    }
  }

  rewind() {
    this.nextRenderTime = 0;
    this.fNum = 0;
    this.actualPlays = 0;
    this.prevF = null;
    this.played = false;
    this.finished = false;
  }

  private setFrameNum(range: number[]): void {
    if (range.length === 0) return;
    this.startFrame = range[0];
    this.fNum = this.startFrame;
    if (range.length > 1) this.endFrame = range[1];
  }

  setOptions(options: AnimationOptions) {
    if (options.rate !== undefined)
      this.rate = options.rate <= 0 ? 1 : options.rate;
    if (options.playNum !== undefined)
      this.manualPlayNum = options.playNum < 0 ? 0 : options.playNum;
    if (options.keep !== undefined) this.keep = options.keep;
  }

  addContext(ctx: CanvasRenderingContext2D | WebGLRenderingContext) {
    if (this.contexts.length > 0) {
      if (!this.isWebGL) {
        // let dat = this.contexts[0].getImageData(0, 0, this.width, this.height);
        //@ts-ignore
        // ctx.putImageData(dat, 0, 0);
        ctx['_apng_animation'] = this;
      }
    }
    this.contexts.push(ctx);
  }

  removeContext(ctx: CanvasRenderingContext2D) {
    let idx = this.contexts.indexOf(ctx);
    if (idx === -1) {
      return;
    }
    this.contexts.splice(idx, 1);
    if (this.contexts.length === 0) {
      this.rewind();
    }
    if ('_apng_animation' in ctx) {
      delete ctx['_apng_animation'];
    }
  }

  private tick(now: number) {
    while (this.played && this.nextRenderTime <= now) this.renderFrame(now);
    if (this.played)
      requestAnimationFrame((time: number) => {
        this.tick(time);
      });
  }

  private renderFrame(now: number) {
    let f = this.fNum;

    //指定停止
    if (this.manualEndNum !== -1 && f == this.manualEndNum) {
      this.manualEndNum = -1;
      this.pause();
      return;
    }

    this.fNum++;

    if (this.manualPlayNum != 0 && this.actualPlays >= this.manualPlayNum) {
      this.stop();
      return;
    }

    //播放1次
    if (
      this.fNum >= this.frames.length ||
      (this.fNum > this.endFrame && this.endFrame != -1)
    ) {
      this.fNum = this.startFrame;
      this.actualPlays++;
    }

    let frame = this.frames[f];

    if (f == 0) {
      if (!this.isWebGL) {
        this.contexts.forEach((ctx) => {
          ctx.clearRect(0, 0, this.width, this.height);
        });
      } else {
        this.contexts.forEach((gl) => {
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        });
      }
      this.prevF = null;
      if (frame.disposeOp == 2) frame.disposeOp = 1;
    }

    if (this.prevF && this.prevF.disposeOp == 1) {
      if (!this.isWebGL) {
        this.contexts.forEach((ctx) => {
          ctx.clearRect(
            this.prevF.left,
            this.prevF.top,
            this.prevF.width,
            this.prevF.height
          );
        });
      } else {
        this.contexts.forEach((gl) => {
          // gl.clearColor(
          //   this.prevF.left,
          //   this.prevF.top,
          //   this.prevF.width,
          //   this.prevF.height
          // );
          // gl.clear(gl.COLOR_BUFFER_BIT);
        });
      }
    } else if (this.prevF && this.prevF.disposeOp == 2) {
      if (!this.isWebGL) {
        this.contexts.forEach((ctx) => {
          ctx.putImageData(this.prevF.iData, this.prevF.left, this.prevF.top);
        });
      } else {
        this.contexts.forEach((gl) => {

        });
      }
    }
    this.prevF = frame;
    this.prevF.iData = null;
    if (this.prevF.disposeOp == 2) {
      if (!this.isWebGL) {
        this.prevF.iData = this.contexts[0].getImageData(
          frame.left,
          frame.top,
          frame.width,
          frame.height
        );
      }else{
        // this.prevF.iData = this.contexts[0]
      }
    }
    if (frame.blendOp == 0) {
      if (!this.isWebGL) {
        this.contexts.forEach((ctx) => {
          ctx.clearRect(frame.left, frame.top, frame.width, frame.height);
        });
      } else {
        this.contexts.forEach((gl) => {

          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        });
      }
    }
    if (!this.isWebGL) {
      this.contexts.forEach((ctx) => {
        this.beforeHook && this.beforeHook(ctx, f);
        this.beforeHookPure && this.beforeHookPure(ctx, f);
        ctx.drawImage(frame.img, frame.left, frame.top);
        this.afterHook && this.afterHook(ctx, f);
        this.afterHookPure && this.afterHookPure(ctx, f);
      });
    } else {
      this.contexts.forEach((gl) => {
        glDrawImage(gl, frame.img,this.width,this.height,frame.left,frame.top);
      });
    }

    if (this.nextRenderTime == 0) this.nextRenderTime = now;
    while (now > this.nextRenderTime + this.playTime)
      this.nextRenderTime += this.playTime;
    this.nextRenderTime += frame.delay / this.rate;
  }
}
export default Animation;
