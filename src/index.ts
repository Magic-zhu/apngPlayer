import parser from './parser';

class APNG {
  static installed = false;
  static pluginName = 'APNG';

  on: Function;
  emit: Function;
  canYouUseCache: boolean;

  constructor() {}

  private checkNativeFeatures(): Promise<any> {
    return new Promise((resolve) => {
      let canvas = document.createElement('canvas');
      let result = {
        TypedArrays: 'ArrayBuffer' in global,
        BlobURLs: 'URL' in global,
        requestAnimationFrame: 'requestAnimationFrame' in global,
        pageProtocol:
          location.protocol == 'http:' || location.protocol == 'https:',
        canvas: 'getContext' in document.createElement('canvas'),
        APNG: false,
      };
      if (result.canvas) {
        let img = new Image();
        img.onload = function () {
          let ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          result.APNG = ctx.getImageData(0, 0, 1, 1).data[3] === 0;
          resolve(result);
        };
        img.src =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACGFjV' +
          'EwAAAABAAAAAcMq2TYAAAANSURBVAiZY2BgYPgPAAEEAQB9ssjfAAAAGmZjVEwAAAAAAAAAAQAAAAEAAA' +
          'AAAAAAAAD6A+gBAbNU+2sAAAARZmRBVAAAAAEImWNgYGBgAAAABQAB6MzFdgAAAABJRU5ErkJggg==';
      } else {
        resolve(result);
      }
    });
  }

  isSupport(ignoreNativeAPNG?: boolean): Promise<boolean> {
    if (typeof ignoreNativeAPNG == 'undefined') ignoreNativeAPNG = false;
    return this.checkNativeFeatures().then((features) => {
      if (features.APNG && !ignoreNativeAPNG) {
        return Promise.reject(false);
      } else {
        return Promise.resolve(true);
      }
    });
  }

  /**
   * @param buffer
   * @return {Promise}
   */
  parseBuffer(buffer: Uint8Array): Promise<{}> {
    return parser.parse(buffer);
  }

  /**
   * @param {String} url
   * @return {Promise}
   */
  parseURL(url: string, independent: boolean): Promise<any> {
    return parser.urlParse(url, independent);
  }

  /**
   * @param {HTMLImageElement} img
   * @param {boolean} autoplay
   * @param {boolean} independent 是否需要独立控制器
   * @return {Promise}
   */
  animateImage(
    img: HTMLImageElement,
    autoplay: boolean = true,
    independent: boolean = false,
    engine: string = '2d'
  ): Promise<any> {
    img.setAttribute('data-is-apng', 'progress');
    const success = (anim) => {
      img.setAttribute('data-is-apng', 'yes');
      if (img.style.opacity === '0') img.style.opacity = '1';
      let canvas: HTMLCanvasElement = document.createElement('canvas');
      canvas.width = anim.width;
      canvas.height = anim.height;
      Array.prototype.slice.call(img.attributes).forEach(function (attr) {
        if (
          [
            'alt',
            'src',
            'usemap',
            'ismap',
            'data-is-apng',
            'width',
            'height',
          ].indexOf(attr.nodeName) == -1
        ) {
          canvas.setAttributeNode(attr.cloneNode(false));
        }
      });
      canvas.setAttribute('data-apng-src', img.src);
      if (img.alt != '') canvas.appendChild(document.createTextNode(img.alt));

      let imgWidth = '',
        imgHeight = '',
        val = 0,
        unit = '';

      if (img.style.width != '' && img.style.width != 'auto') {
        imgWidth = img.style.width;
      } else if (img.hasAttribute('width')) {
        imgWidth = img.getAttribute('width') + 'px';
      }
      if (img.style.height != '' && img.style.height != 'auto') {
        imgHeight = img.style.height;
      } else if (img.hasAttribute('height')) {
        imgHeight = img.getAttribute('height') + 'px';
      }
      if (imgWidth != '' && imgHeight == '') {
        val = parseFloat(imgWidth);
        unit = imgWidth.match(/\D+$/)[0];
        imgHeight = Math.round((canvas.height * val) / canvas.width) + unit;
      }
      if (imgHeight != '' && imgWidth == '') {
        val = parseFloat(imgHeight);
        unit = imgHeight.match(/\D+$/)[0];
        imgWidth = Math.round((canvas.width * val) / canvas.height) + unit;
      }

      canvas.style.width = imgWidth;
      canvas.style.height = imgHeight;

      let p = img.parentNode;
      p.insertBefore(canvas, img);
      img.parentElement.removeChild(img);

      let isWebGL;
      if (engine === 'auto') {
        isWebGL = true;
      } else if (engine === '2d') {
        isWebGL = false;
      } else if (engine === 'webgl') {
        isWebGL = true;
      }

      if (engine === 'auto') {
        const textCanvas = document.createElement('canvas');
        const textGl = textCanvas.getContext('webgl');
        if (!textGl) {
          console.warn(
            '无法初始化WebGL，你的浏览器、操作系统或硬件等可能不支持WebGL,切换到canvas2d'
          );
          isWebGL = false;
        }
      }
      anim.isWebGL = isWebGL;
      anim.addContext(
        isWebGL ? canvas.getContext('webgl') : canvas.getContext('2d')
      );

      if (autoplay === true) {
        anim.play();
      }
    };
    const normal = () => {
      return new Promise((resolve, reject) => {
        this.parseURL(img.src, independent)
          .then((anim) => {
            success(anim);
            resolve(anim);
          })
          .catch((err) => {
            img.setAttribute('data-is-apng', 'no');
            reject(err);
          });
      });
    };
    // //启用缓存模式
    // if (
    //     img.dataset.src != undefined
    //     && img.dataset.src != ''
    //     && this.canYouUseCache
    // ) {
    //     return this.ifHasCache(img.dataset.src)
    //         .then((buffer: ArrayBuffer) => {
    //             return this.parseBuffer(buffer)
    //         })
    //         .then((anim) => {
    //             success(anim)
    //             return
    //         })
    //         .catch(() => {
    //             return normal()
    //         })
    // }
    return normal();
  }

  bindCanvas(url: string, canvasDom: HTMLElement) {}

  ifHasCache(src: string) {
    return new Promise((resolve, reject) => {
      this.emit('getCache', src);
      this.on('getCacheBack', (data: any) => {
        if (data == undefined) reject(false);
        else resolve(data);
      });
    });
  }

  static install(mot: any) {
    mot.register('APNG', () => {
      let apng = new APNG();
      apng.on = mot.on;
      apng.emit = mot.emit;
      apng.canYouUseCache =
        mot.plugins.LocalCache && mot.plugins.LocalCache.installed;
      return apng;
    });
  }
}

export default APNG;
