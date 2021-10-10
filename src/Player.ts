interface PlayerOptions {
    url:string,
    target:HTMLCanvasElement,
}
class Player {

    url:string
    target:HTMLCanvasElement

    constructor(options:PlayerOptions) {
        this.url = options.url
        this.target = options.target
    }

    play() {

    }

    pause() {

    }

    stop() {

    }
}
export default Player