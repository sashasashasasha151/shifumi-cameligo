import dotenv from "dotenv";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
import { buf2hex } from "@taquito/utils";
import code from "../compiled/shifumi.json";
import metadata from "./metadata.json";

// Read environment variables from .env file
dotenv.config();

// Initialize RPC connection
const Tezos = new TezosToolkit(process.env.RPC);
console.log(process.env.ADMIN_PK);
// Deploy to configured node with configured secret key
const deploy = async () => {
    try {
        const signer = await InMemorySigner.fromSecretKey(
            process.env.ADMIN_PK
        );

        Tezos.setProvider({ signer });

        // create a JavaScript object to be used as initial storage
        // https://tezostaquito.io/docs/originate/#a-initializing-storage-using-a-plain-old-javascript-object
        const storage = {
            metadata: MichelsonMap.fromLiteral({
                "": buf2hex(Buffer.from("tezos-storage:contents")),
                contents: buf2hex(Buffer.from(JSON.stringify(metadata))),
            }),
            next_session: 0,
            sessions: new MichelsonMap(),
        };

        const op = await Tezos.contract.originate({ code, storage });
        await op.confirmation();
        console.log(`[OK] ${op.contractAddress}`);
    } catch (e) {
        console.log(e);
        return process.exit(1);
    }
};

deploy();
