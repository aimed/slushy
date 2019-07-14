import { SlushyContext } from '@slushy/server'
import { Context } from './Context'
import {
    CreatePetOK,
    CreatePetParams,
    CreatePetResponse,
    DefaultResponsesDefault,
    DefaultResponsesParams,
    GetPetByIdBadRequest,
    GetPetByIdOK,
    GetPetByIdParams,
    GetPetByIdResponse,
    GetPetsOK,
    GetPetsResponse,
    PetsResource,
    UploadPetPictureOK,
    UploadPetPictureParams,
    UploadPetPictureResponse,
} from './generated/resources/PetsResource'
import { Pet } from './generated/types'

export class PetsResourceImpl implements PetsResource<Context> {
    private pets: Pet[] = [{ id: 1, name: 'Pet 1' }]

    public async getPets(): Promise<GetPetsResponse> {
        return new GetPetsOK(this.pets)
    }

    public async getPetById(params: GetPetByIdParams): Promise<GetPetByIdResponse> {
        const pet = this.pets.filter(_pet => _pet.id === params.petId)[0]
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
        _context: SlushyContext<Context>,
    ): Promise<UploadPetPictureResponse> {
        return new UploadPetPictureOK()
    }

    public async defaultResponses(
        _params: DefaultResponsesParams,
        _context: SlushyContext<Context>,
    ): Promise<DefaultResponsesDefault> {
        throw new DefaultResponsesDefault(401, { errors: [{ message: 'This is a generic error' }] })
    }
}
