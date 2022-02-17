import * as chain from "as-chain"

@table("mydata")
class MyData {
    constructor(
        public a: u64=0,
        public b: u64=0,
        public c: chain.U128=new chain.U128()) {
    }

    @primary
    get getPrimary(): u64 {
        return this.a;
    }

    @secondary
    get bvalue(): u64 {
        return this.b;
    }

    @secondary
    set bvalue(value: u64) {
        this.b = value;
    }

    @secondary
    get cvalue(): chain.U128 {
        return this.c;
    }

    @secondary
    set cvalue(value: chain.U128) {
        this.c = value;
    }
}

@contract("hello")
class MyContract {
    receiver: chain.Name;
    firstReceiver: chain.Name;
    action: chain.Name

    constructor(receiver: chain.Name, firstReceiver: chain.Name, action: chain.Name) {
        this.receiver = receiver;
        this.firstReceiver = firstReceiver;
        this.action = action;
    }

    @action("testmi")
    testmi(): void {
        let newObj = (): MyData => {
            return new MyData();
        }

        let indexes = [chain.SecondaryType.U64, chain.SecondaryType.U128];
        let mi = new chain.MultiIndex<MyData>(this.receiver, this.firstReceiver, this.action, indexes, newObj);
        let value = new MyData(1, 2, new chain.U128(3));
        mi.store(value, this.receiver);

        value = new MyData(4, 5, new chain.U128(6));
        mi.store(value, this.receiver);

        value = new MyData(7, 8, new chain.U128(9));
        mi.store(value, this.receiver);

        let it = mi.find(4);
        chain.assert(it.isOk(), "value not found!")
        chain.printString(`+++++++++++it.i:${it.i}\n`)
        value = mi.get(it);
        chain.printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`)
        chain.assert(value.a == 4 && value.b == 5 && value.c == new chain.U128(6), "bad value");

        it = mi.previous(it);
        chain.assert(it.isOk(), "previous");
        value = mi.get(it);
        chain.printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`)
        chain.assert(value.a == 1 && value.b == 2 && value.c == new chain.U128(3), "bad value");

        it = mi.lowerBound(1);
        value = mi.get(it);
        chain.printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`)
        chain.assert(value.a == 1 && value.b == 2 && value.c == new chain.U128(3), "bad value");

        it = mi.upperBound(1);
        value = mi.get(it);
        chain.printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`)
        chain.assert(value.a == 4 && value.b == 5 && value.c == new chain.U128(6), "bad value");

        it = mi.end();
        it = mi.previous(it);
        value = mi.get(it);
        chain.printString(`+++++++++++it.i:${value.a}, ${value.b}, ${value.c}\n`)
        chain.assert(value.a == 7 && value.b == 8 && value.c == new chain.U128(9), "bad value");

        value.c = new chain.U128(10);
        mi.update(it, value, this.receiver);
        value = mi.get(it);        
        chain.assert(value.a == 7 && value.b == 8 && value.c == new chain.U128(10), "bad value");

        let idx = <chain.IDX64>mi.getIdxDB(0);
        let idxIt = idx.findPrimary(7);
        chain.printString(`++++++++${idxIt.i.i}, ${idxIt.value}\n`)

        {//4, 5, 6
            // let idx64 = <chain.IDX64>idx;
            let idx64 = changetype<chain.IDX64>(idx);
            let idxIt = idx64.find(5);
            chain.printString(`+++++++++idx64.find: ${idxIt.i}, ${idxIt.primary}\n`)
            chain.assert(idxIt.primary == 4, "bad value");
        }

        //1 2 3
        //4 5 6
        //7 8 10
        {
            let ret = idx.lowerBoundEx(2)
            chain.assert(ret.value == 2, "bad value");
            ret = idx.upperBoundEx(2);
            chain.assert(ret.value == 5, "bad value");

            let it = idx.previous(ret.i);
            chain.assert(it.primary == 1, "bad primary value");
            it = idx.next(it);
            chain.assert(it.primary == 4, "bad primary value");

            it = idx.end();
            it = idx.previous(it);
            chain.printString(`++++++${it.i}, ${it.primary}`);
            chain.assert(it.primary == 7, "bad primary value");
        }

        {//1, 2, 3
            let idxIt = idx.find(2);
            chain.printString(`+++++++++idx.find(2): ${idxIt.i}, ${idxIt.primary}\n`);
            chain.assert(idxIt.primary == 1, "bad value");
            let secValue = chain.newSecondaryValue_u64(22);
            mi.idxUpdate(idxIt, secValue, this.receiver);
            let ret = idx.find(22);
            chain.assert(ret.isOk(), "bad scondary value");
        }

        //1 22 3
        //4 5 6
        //7 8 10
        {
            let idx128 = <chain.IDX128>mi.getIdxDB(1);
            let idxRet = idx128.findPrimary(1);
            chain.assert(idxRet.value == new chain.U128(3), "bad idx128 value");
            let it = idx128.previous(idxRet.i);
            chain.assert(it.i == -1, 'bad iterator');

            it = idx128.next(idxRet.i);
            chain.assert(it.primary == 4, "bad primary value!");

            it = idx128.lowerBound(new chain.U128(6));
            chain.assert(it.primary == 4, "idx128.lowerBound: bad primary value!");

            it = idx128.upperBound(new chain.U128(6));
            chain.assert(it.primary == 7, "idx128.lowerBound: bad primary value!");

            let secondary = chain.newSecondaryValue_U128(new chain.U128(6));
            let ret = idx128.lowerBoundEx(secondary);
            chain.assert(ret.value.value[0] == 6, "idx128.lowerBound: bad secondary value!");

            ret = idx128.upperBoundEx(secondary);
            chain.assert(ret.value.value[0] == 10, "idx128.lowerBound: bad secondary value!");
        }

        // 1 22 3
        // 4 5 6
        // 7 8 10
        {
            let it = mi.find(1);
            mi.remove(it);
            it = mi.find(1);
            chain.assert(!it.isOk(), "bad iterator!");
        }
    }
}
