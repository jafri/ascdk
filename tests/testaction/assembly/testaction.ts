import * as chain from "as-chain";
import { Utils } from "as-chain/utils";

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

    @action("saygoodbye")
    sayGoodbye(name: string): void {
        chain.printString(`+++goodbye, ${name}\n`);
    }
    
    @action("sayhello")
    sayHello(name: string): void {
        {
            let pub = new chain.PublicKey();
        }

        {
            let syn = new chain.Symbol("EOS", 4);
            chain.printString(syn.toString());

            chain.printString(" ");
            let b = new chain.Asset(<i64>(10), syn);
            chain.printString(b.toString());
        }
        // let  = Utils.stringToU8Array(name);
        let enc = new chain.Encoder(1 + name.length);
        enc.packString(name);
        let a = new chain.Action(
            [new chain.PermissionLevel(this.receiver, chain.Name.fromString("active"))],
            this.receiver,
            chain.Name.fromString("saygoodbye"),
            enc.getBytes());
        a.send();
        chain.printString(`hello, ${name}\n`);
    }
}
