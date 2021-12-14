import loadUrl from './loader';

interface PlayerOptions {
  url: string;
  target: HTMLCanvasElement;
}
interface UrlMap {
  [key: string]: any;
}
const  urlBufferMap: UrlMap = {};
const  urlParseMap:UrlMap = {};
class Player {
  url: string;
  target: HTMLCanvasElement;
  bufferData:ArrayBuffer;



  constructor(options: PlayerOptions) {
    this.url = options.url;
    this.target = options.target;
  }

  async load(callback: Function) {
    if(urlBufferMap[this.url]===undefined) {
      await loadUrl(this.url)
      .then(() => {})
      .catch(() => {});
    }
    this.bufferData = urlBufferMap[this.url]
  }

  play() {}

  pause() {}

  stop() {}
}
export default Player;
