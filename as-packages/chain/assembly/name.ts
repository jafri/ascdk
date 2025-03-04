import { Decoder, Packer } from "./serializer";

const charToSymbol = (c: u16): u16 => {
    if (c >= 97 && c <= 122) {// c >= 'a' && c <= 'z'
        return (c - 97) + 6;
    }

    if (c >= 49 && c <= 53) {// c >= '1' && c <= '5'
        return (c - 49) + 1;
    }

    if (c == 46) { // c == '.'
        return 0;
    }
    return 0xffff;
};

export function S2N(s: string): u64 {
    let value: u64 = 0;
    for (let i=0; i<=12; i++) {
        let c: u64 = 0;
        if (i < s.length && i <= 12) {
            c = <u64>charToSymbol(<u16>s.charCodeAt(i));
            if (c==0xffff) {
                return 0;
            }
        }
        if (i < 12) {
            c &= 0x1f;
            c <<= 64 - 5*(i+1);
        } else {
            c &= 0x0f;
        }
        value |= c;
    }
    return value;
}

// ".12345abcdefghijklmnopqrstuvwxyz"
const charmap: u8[] = [0x2e,0x31,0x32,0x33,0x34,0x35,0x61,0x62,0x63,0x64,0x65,0x66,0x67,0x68,0x69,0x6a,0x6b,0x6c,0x6d,0x6e,0x6f,0x70,0x71,0x72,0x73,0x74,0x75,0x76,0x77,0x78,0x79,0x7a];

export function N2S(value: u64): string {
    // 13 dots
    let str = new Array<u8>(13);
    let tmp: u64 = value;
    for (let i=0; i<=12; i++) {
        let c: u8;
        if (i == 0) {
            c = charmap[<i32>(tmp&0x0f)];
        } else {
            c = charmap[<i32>(tmp&0x1f)];
        }
        str[12-i] = c;
        if (i==0) {
            tmp >>= 4;
        } else {
            tmp >>= 5;
        }
    }

    let i = str.length - 1;
    for (; i >= 0; i--) {
        if (str[i] != 46) {// 46 '.'
            break;
        }
    }
    return String.UTF8.decode(str.slice(0, i+1).buffer);
}

export class Name implements Packer {
    N: u64;

    @inline constructor(n: u64=0) {
        this.N = n;
    }

    @inline static fromString(s: string): Name {
        return new Name(S2N(s));
    }

    toString(): string {
        return N2S(this.N);
    }

    pack(): u8[] {
        let ret = new Array<u8>(8);
        store<u64>(ret.dataStart, this.N);
        return ret;
    }

    unpack(data: u8[]): usize {
        let dec = new Decoder(data);
        this.N = dec.unpackNumber<u64>();
        return 8;
    }

    getSize(): usize {
        return 8;
    }

    @inline @operator('==')
    static eq(a: Name, b: Name): bool {
        return a.N == b.N;
    }
}
