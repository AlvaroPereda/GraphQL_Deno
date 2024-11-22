import { Dinosaur, DinosaurModel } from "./type.ts";

export const change = (
    dino: DinosaurModel
):Dinosaur => {
    return ({
        id: dino._id!.toString(),
        name: dino.name,
        type: dino.type
    })
}