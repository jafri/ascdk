import { ClassPrototype } from "assemblyscript";
import { Contract, ContractMetadata, ContractSpec, Source } from "contract-metadata/src";
import { FieldLayout, Layout, StructLayout } from "contract-metadata/src/layouts";
import { ArrayDef, CompositeDef, Field, PrimitiveDef, SequenceDef, Type } from "contract-metadata/src/types";
import { CONFIG } from "../config/compile";
import { ContractProgram } from "../contract/contract";
import { ClassInterpreter } from "../contract/classdef";
import { ConstructorDef, MessageFuctionDef } from "../contract/elementdef";
import { TypeKindEnum } from "../enums/customtype";
import { TypeHelper } from "../utils/typeutil";

export class MetadataGenerator {

    contractInfo: ContractProgram;

    constructor(contract: ContractProgram) {
        this.contractInfo = contract;
    }

    public createMetadata(): ContractMetadata {
        let source = new Source("", CONFIG.language, CONFIG.language);
        let contract = new Contract(this.contractInfo.contract!.camelName, CONFIG.metadataVersion);
        let contractSpec = this.getContractSpec();
        let types = this.createTypeMetadata();
        let layout = this.createStoreLayout();
        return new ContractMetadata(source, contract, contractSpec, types, layout);
    }

    private getContractSpec(): ContractSpec {
        let events = this.contractInfo.events.map(item => item.createMetadata());
        let message = this.contractInfo.contract.msgFuncDefs.map(item => {
            let msg = <MessageFuctionDef>item;
            return msg.createMetadata();
        });
        let contract = this.contractInfo.contract.cntrFuncDefs.map(item => {
            let msg = <ConstructorDef>item;
            return msg.createMetadata();
        });
        return new ContractSpec(contract, message, events, []);
    }

    private createStoreLayout(): Layout {
        let layouts: FieldLayout[] = [];
        this.contractInfo.storages.forEach(item => layouts = layouts.concat(item.createMetadata()));
        return new StructLayout(layouts);
    }

    private createTypeMetadata(): Type[] {
        let metadataTypes = new Array<Type>();
        let exportedTypeMap = this.contractInfo.definedTypeMap;
        exportedTypeMap.forEach((type, _) => {
            if (TypeHelper.isPrimitiveType(type.typeKind)) {
                metadataTypes.push(new PrimitiveDef(type.abiType));
            } else if (type.typeKind == TypeKindEnum.USER_CLASS) {
                let classType: ClassPrototype = <ClassPrototype>type.current;
                let interpreter = new ClassInterpreter(classType);
                interpreter.resolveFieldMembers();
                let fieldArr = new Array<Field>();
                interpreter.fields.forEach(classField => {
                    let name = classField.name;
                    let fieldTypeName = classField.type.definedCodeType;
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    let fieldType = exportedTypeMap.get(fieldTypeName)!;
                    let field = new Field(name, fieldType?.index, fieldType?.plainType);
                    fieldArr.push(field);
                });
                let compositeDef = new CompositeDef(fieldArr);
                metadataTypes.push(compositeDef);
            } else if (type.typeKind == TypeKindEnum.ARRAY) {
                let argumentType = type.typeArguments[0];
                // TODO
                let fieldType = exportedTypeMap.get(argumentType.getTypeKey())!;
                if (fieldType.capacity == 0) {
                    let sequence = new SequenceDef(fieldType.index);
                    metadataTypes.push(sequence);
                } else {
                    let arr = new ArrayDef(fieldType.capacity, fieldType.index);
                    metadataTypes.push(arr);
                }
            }
        });
        return metadataTypes;
    }
}