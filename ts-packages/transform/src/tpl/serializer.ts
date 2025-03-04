import { CONFIG } from "../config/compile";

// let scope = CONFIG.scope;

export const serializerTpl = `

{{export}}class {{className}} implements _chain.Packer {

    {{{ExtractClassBody range}}}

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        {{#each fields}}
        {{{actionParameterSerialize .}}}
        {{/each}}
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        {{#each fields}}
        {{{actionParameterDeserialize .}}}
        {{/each}}
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        {{#each fields}}
        {{{actionParameterGetSize .}}}
        {{/each}}
        return size;
    }
}`;