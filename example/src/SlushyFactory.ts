import { Slushy } from "@slushy/server";
import { ResourceConfig } from "./generated/resources";
import { PetsResourceImpl } from "./PetsResourceImpl";

export class SlushyFactory {
    public static async create() {
        const slushy = await Slushy.create({
            resourceConfiguration: new ResourceConfig({
                PetsResource: new PetsResourceImpl()
            })
        })
        return slushy
    }
}