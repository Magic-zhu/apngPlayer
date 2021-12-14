import {Warn} from '../utils/warn'
const PNG_SIGNATURE_BYTES: Uint8Array = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
class ApngParser {

    buffer:ArrayBuffer

    constructor(buffer:ArrayBuffer) {
        let bytes: Uint8Array = new Uint8Array(buffer);
        if(!this.checkPngSignature(bytes)){
          Warn("Not a PNG file (invalid file signature)",2)
        }else{
          this.parse(bytes)
        }
    }

    checkPngSignature(bytes: Uint8Array):boolean {
        for (let i = 0; i < PNG_SIGNATURE_BYTES.length; i++) {
            if (PNG_SIGNATURE_BYTES[i] != bytes[i]) {
                return false
            }
        }
        return true
    }

    parse(bytes:Uint8Array) {

    }

    splitChunks(bytes:Uint8Array) {

    }

    readWord(bytes: Uint8Array, off: number): number {
        let x = 0;
        for (let i = 0; i < 2; i++) x += (bytes[i + off] << ((1 - i) * 8));
        return x;
    }

    readDoubleWord(bytes: Uint8Array, off: number): number {
        let x = 0;
        // Force the most-significant byte to unsigned.
        x += ((bytes[0 + off] << 24) >>> 0);
        for (let i = 1; i < 4; i++) x += ((bytes[i + off] << ((3 - i) * 8)));
        return x;
    }

    readByte(bytes: Uint8Array, off: number): number {
        return bytes[off];
    }

    subBuffer(bytes: Uint8Array, start: number, length: number): Uint8Array {
        let a = new Uint8Array(length);
        a.set(bytes.subarray(start, start + length));
        return a;
    }

    readString(bytes: Uint8Array, off: number, length: number) {
        let chars = Array.prototype.slice.call(bytes.subarray(off, off + length));
        return String.fromCharCode.apply(String, chars);
    }
}
export default ApngParser
