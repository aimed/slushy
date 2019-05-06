import {
    PetsResource,
    GetPetByIdParams,
    CreatePetParams,
    CreatePetResponse,
    GetPetsResponse,
    GetPetByIdResponse,
    UploadPetPictureParams,
} from './generated/resources/PetsResource'
import { Pet } from './generated/types'
import { SlushyContext } from '@slushy/server'

export class PetsResourceImpl implements PetsResource<{}> {
    private pets: Pet[] = [{ id: 1, name: 'Pet 1' }]

    public async getPets(): Promise<GetPetsResponse> {
        return this.pets
    }

    public async getPetById(params: GetPetByIdParams): Promise<GetPetByIdResponse> {
        return this.pets.filter(pet => pet.id === params.petId)[0]
    }

    public async createPet(params: CreatePetParams): Promise<CreatePetResponse> {
        const pet: CreatePetResponse = {
            id: this.pets.length + 1,
            ...params.requestBody,
        }
        this.pets.push(pet)
        return pet
    }

    public async uploadPetPicture(_params: UploadPetPictureParams, _context: SlushyContext<{}>): Promise<undefined> {
        return undefined
    }
}
