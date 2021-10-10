## 说明

⭐️ 默认使用WebGL渲染 不支持时自动切换到2d

该插件可以单独使用也可搭配 mot 库使用
需要浏览器支持以下四种能力

- [Canvas](http://caniuse.com/#feat=canvas)
- [Typed Arrays](http://caniuse.com/#feat=typedarrays)
- [Blob URLs](http://caniuse.com/#feat=bloburls)
- [requestAnimationFrame](http://caniuse.com/#feat=requestanimationframe)

## 单独使用

```javascript
import APNG from "mot-plugin-apng";
let apng = new APNG();
```

## 集成在 mot 库中使用

正在开发 💦

## API

### isSupport

用途:浏览器是否支持 apng<br>
参数:无<br>
返回:promise<br>

```javascript
apng
  .isSupport()
  .then(() => {
    console.log("not support");
  })
  .catch(() => {
    console.log("support");
  });
```

### animateImage(img,autoplay,independent)

用途:将 apng 解析成 canvas 提供控制器<br>

- 参数 1 `img` :HTMLImgElement 需要解析的 img dom 元素<br>
- 参数 2 `autoplay` :boolean 是否自动播放<br>
- 参数 3 `independent` :boolean 是否需要独立控制器 >> 当检测到相同 url 地址时 为了性能 默认会共用一个控制器增加 canvas 上下文,当设置为 true 是 会为当前项独立新增一个控制器<br>

返回:promise `anim`<br>

```javascript
var image1 = document.querySelector(".apng-image1");
apng.animateImage(image1, false).then((anim) => {
  anim.play([50, 70]);
  anim.before((ctx, f) => {
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 100 + f * 3, 100 + f * 3);
  });
  anim.after((ctx, f) => {
    ctx.fillStyle = "blue";
    ctx.fillRect(200, 200, 100 + f * 3, 100 + f * 3);
  });
});
```

### anim 控制器-属性

| 参数名 | 数据类型 | 用途                |
| ------ | -------- | ------------------- |
| width  | number   | 当前 canvas 宽度 px |
| height | number   | 当前 canvas 高度 px |

### anim 控制器-方法

#### anim.play(frameArray)

用途:控制播放

- 参数 1 `frameArray`: [start,end]数组 表示播放的帧数范围,只有 start 的时候播放至结尾

#### anim.stop()

用途:停止播放

#### anim.clear()

用途:清除内容

#### anim.start()

用途:搭配 pause 暂停使用,重新开始播放

#### anim.pause(frame)

用途:暂停播放

- 参数 1 `frame`:当 frame 存在时,到达 frame 帧数时暂停播放

#### anim.setOptions({playNum,rate})

用途:设置选项

| 参数名  | 数据类型 | 用途     | 默认值          |
| ------- | -------- | -------- | --------------- |
| playNum | number   | 播放次数 | 0：表示循环播放 |
| rate    | number   | 播放速率 | 1               |

#### anim.before(func)

用途:表示在 apng 之前渲染

- 参数 1 `func`: 要执行的函数 暴露两个参数 `context`:canvas 上下文 `f`:当前帧数

#### anim.after()

用途:表示在 apng 之后渲染

- 参数 1 `func`: 要执行的函数 暴露两个参数 `context`:canvas 上下文 `f`:当前帧数

#### anim.on(hook,callback)

用途:状态监听

| 参数名   | 数据类型 | 用途                                    | 默认值 |
| -------- | -------- | --------------------------------------- | ------ |
| hook     | string   | 监听的状态 目前只开放了'stop','allStop' |        |
| callback | function | 回调函数 stop 时触发回调                |        |

#### anim.once(hook,callback)

用途:一次性状态监听

| 参数名   | 数据类型 | 用途                                    | 默认值 |
| -------- | -------- | --------------------------------------- | ------ |
| hook     | string   | 监听的状态 目前只开放了'stop','allStop' |        |
| callback | function | 回调函数 stop 时触发回调                |        |
