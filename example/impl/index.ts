import { Atlantis } from "../../server";
import { ResourceConfig } from "../generated/resources/ResourceConfig";
import { PetsResourceImpl } from "./PetsResourceImpl";


async function run() {
    const atlantis = await Atlantis.create({
        resourceConfiguration: new ResourceConfig({
            PetsResource: new PetsResourceImpl()
        })
    })
    await atlantis.start(3031)
    console.log('started');
}

run()