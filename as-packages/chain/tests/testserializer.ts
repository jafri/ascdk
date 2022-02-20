import { Name, Asset, Symbol, Encoder, Decoder, VarUint32, packer, contract, action, check, printString } from "as-chain"

@packer
class MyData {
    constructor(public a: u64 = 0,
        public b: u64 = 0,
        public c: u64 = 0,
        public d: Asset[] = [],
        ) {
    }
}

@contract("hello")
class MyContract {
    receiver: Name;
    firstReceiver: Name;
    action: Name

    constructor(receiver: Name, firstReceiver: Name, action: Name) {
        this.receiver = receiver;
        this.firstReceiver = firstReceiver;
        this.action = action;
    }

    @action("test1")
    testEncodeDecode(): void {
        {
            let arr = new Array<MyData>();

            let obj1 = new MyData();
            arr.push(obj1);

            let obj2 = new MyData(1, 2, 3, 
                [new Asset(10, new Symbol("EOS", 4))]
            );
            arr.push(obj2);

            let enc = new Encoder(8*3+1 + 8*3+1+16 + 1);
            enc.packObjectArray(arr);
            
            let data = enc.getBytes();

            arr = new Array<MyData>();
            let dec = new Decoder(data);
            let length = dec.unpackLength();
            for (let i=<u32>0; i<length; i++) {
                let obj = new MyData();
                dec.unpack(obj);
                arr.push(obj);
            }
            check(arr[1].a == 1 && arr[1].b == 2 && arr[1].c == 3 && arr[1].d[0].amount == 10, "bad value");
        }

        {
            let arr = new Array<MyData>();

            let obj1 = new MyData();
            arr.push(obj1);

            let obj2 = new MyData(1, 2, 3);
            arr.push(obj2);

            let data = obj2.pack();

            let dec = new Decoder(data);
            dec.unpack(arr[0]);
            check(obj1.a == 1 && obj1.b == 2 && obj1.c == 3, "bad value");
        }

        let n = new VarUint32(0xfff);
        let packed = n.pack();

        let m = new VarUint32(0);
        m.unpack(packed);
        check(n.n == m.n, "bad value.");

        let enc = new Encoder(10);
        enc.packLength(0xfffff);

        let dec = new Decoder(enc.getBytes());
        let length = dec.unpackLength();
        check(length == 0xfffff, "bad value");
    }

    @action("test2")
    testSerializer(
        a1: bool,
        a2: i8,
        a3: u8,
        a4: i16,
        a5: u16,
        a6: i32,
        a7: u32,
        a8: i64,
        a9: u64,
        // a10: i128,
        // a11: u128,
        // a12: VarInt32,
        a13: VarUint32,
        a14: f32,
        a15: f64,
        //a16: f128,
        //a17: TimePoint,
        //a18: TimePointSec,
        //a19: BlockTimestampType,
        a20: Name,
        //a21: u8[],
        a22: string,
        //a23: Checksum160,
        //a24: Checksum256,
        //a25: Checksum512,
        //a26: PublicKey,
        //a27: chain.Signature,
        //a28: chain.Symbol,
        // a29: chain.SymbolCode,
        a30: Asset,
        // a31: chain.ExtendedAsset,
        a32: string[],
    ): void {
        check(a13 == new VarUint32(0xfff), "bad a13 value.");
        check(a20 == Name.fromString("alice"), "bad a20 value");
        printString(`
        a1 = ${a1},
        a2 = ${a2},
        a3 = ${a3},
        a4 = ${a4},
        a5 = ${a5},
        a6 = ${a6},
        a7 = ${a7},
        a8 = ${a8},
        a9 = ${a9.toString(16)},
        a14 = ${a14},
        a15 = ${a15},
        a20 = ${a20},
        a22 = ${a22},
        a30 = ${a30},
        a32 = ${a32},
        `)
    }
}
