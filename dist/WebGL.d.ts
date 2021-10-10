declare const setRectangle: (gl: WebGLRenderingContext, x: number, y: number, width: number, height: number) => void;
declare const loadShader: (gl: WebGLRenderingContext, type: string, source: string) => WebGLShader;
declare const createShaderProgram: (gl: WebGLRenderingContext, vsSource: string, fsSource: string) => WebGLProgram;
declare const glDrawImage: (gl: WebGLRenderingContext, img: HTMLImageElement, width: number, height: number, left: number, top: number) => void;
export { loadShader, setRectangle, createShaderProgram, glDrawImage };
