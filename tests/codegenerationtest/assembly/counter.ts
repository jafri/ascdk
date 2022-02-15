import * as chain from "as-chain"
import { UInt64 } from "as-scale-codec";
import { MyTable } from "./utils"


@serializer
class MyStruct {
    a1: u64;
    a2: u64;
    constructor(a1: u64=0, a2: u64=0) {
        this.a1 = a1;
        this.a2 = a2;
    }
}

@table("mydata")
class MyData {
    primary: u64;
    count: u64;

    constructor(primary: u64, count: u64) {
        this.primary = primary;
        this.count = count;
    }

    sayHello(): void {

    }

    @primary
    get getPrimary(): u64 {

    }

    @secondary
    getByCount(): u64 {

    }

    @secondary
    get bar(): u64 {
        return this._bar;
    }

    @secondary
    set bar(value: u64) {
        this._bar = value;
    }

    @secondary
    get foo(): u64 {
        return this._bar;
    }

    @secondary
    set foo(value: u64) {
        this._bar = value;
    }
}

@contract("hello")
class MyContract {
    receiver: chain.Name;
    firstReceiver: chain.Name;
    action: chain.Name
    mytable: MyTable

    constructor(receiver: chain.Name, firstReceiver: chain.Name, action: chain.Name) {
        this.receiver = receiver;
        this.firstReceiver = firstReceiver;
        this.action = action;
        this.mytable = new MyTable();
    }

    @action("count")
    count(n: u64, m: u64): void {
        let mystruct = new MyStruct();
        let data = chain.readActionData();
        mystruct.deserialize(data);
        chain.printString(`++++++${mystruct.a1}, ${mystruct.a2}`);
    }

    @action("inccc", notify=true)
    inc(n: u32, m: u32): void {
        // let v = this.stored.value;
        // this.stored.value = ++v;
    }

    @action("dec")
    dec(n: u32, m: u32): u32 {
        return 0;
    }

    @action("dec2")
    dec2(n: u32, m: u32): void {
        chain.printui(n);
        chain.printString(" ");
        chain.printui(m);
    }

    @action("zzzzzzzzzzzz")
    fullname(n: u32, m: u32): void {
        chain.printString("fullname test:");
        chain.printui(n);
        chain.printString(":");
        chain.printui(m);

        let name = chain.Name.fromString("zzzzzzzzzzzzj");
        chain.printString(" ");
        chain.printString(name.toString());
    }
}
