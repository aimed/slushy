import { Slushy } from "../../server/src";
import { ResourceConfig } from "./generated/resources/ResourceConfig";
import { PetsResourceImpl } from "./PetsResourceImpl";


async function run() {
    const slushy = await Slushy.create({
        resourceConfiguration: new ResourceConfig({
            PetsResource: new PetsResourceImpl()
        })
    })
    await slushy.start(3031)
}

run()