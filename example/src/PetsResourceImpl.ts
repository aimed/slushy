import {
    PetsResource,
    GetPetByIdParams,
    CreatePetParams,
    CreatePetResponse,
    GetPetsResponse,
    GetPetByIdResponse,
    UploadPetPictureParams,
    UploadPetPictureResponse,
    GetPetByIdOK,
    CreatePetOK,
    UploadPetPictureOK,
    GetPetsOK,
    GetPetByIdBadRequest,
} from './generated/resources/PetsResource'
import { Pet } from './generated/types'
import { SlushyContext } from '@slushy/server'
import { Context } from './Context'

export class PetsResourceImpl implements PetsResource<Context> {
    private pets: Pet[] = [{ id: 1, name: 'Pet 1' }]

    public async getPets(): Promise<GetPetsResponse> {
        return new GetPetsOK(this.pets)
    }

    public async getPetById(params: GetPetByIdParams): Promise<GetPetByIdResponse> {
        const pet = this.pets.filter(pet => pet.id === params.petId)[0]
        if (!pet) {
            throw new GetPetByIdBadRequest({ message: 'No pet found.' })
        }
        return new GetPetByIdOK(pet)
    }

    public async createPet(params: CreatePetParams): Promise<CreatePetResponse> {
        const pet: Pet = {
            id: this.pets.length + 1,
            ...params.requestBody,
        }

        this.pets.push(pet)
        return new CreatePetOK(pet)
    }

    public async uploadPetPicture(
        _params: UploadPetPictureParams,
        _context: SlushyContext<Context>
    ): Promise<UploadPetPictureResponse> {
        return new UploadPetPictureOK()
    }
}
