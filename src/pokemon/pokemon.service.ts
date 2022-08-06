import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) private readonly PokemonModel: Model<Pokemon>,
  ) {}
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.PokemonModel.create(createPokemonDto);

      return pokemon;
    } catch (error) {
      console.log(error);
      const { code, keyValue } = error;
      if (code === 11000) {
        throw new BadRequestException(
          `Pokemon exists in db ${JSON.stringify(keyValue)}`,
        );
      }
      console.log(error);
      throw new InternalServerErrorException(
        `Can t create Pokemon -Check server log`,
      );
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    try {
      if (!isNaN(+term)) {
        pokemon = await this.PokemonModel.findOne({ no: term });
      }

      if (isValidObjectId(term)) {
        pokemon = await this.PokemonModel.findById(term);
      }
      if (!pokemon) {
        pokemon = await this.PokemonModel.findOne({
          name: term.toLowerCase().trim(),
        });
      }

      if (!pokemon) {
        throw new NotFoundException(
          `Pokemon with,id,name of no ${term} not found`,
        );
      }

      return pokemon;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(`Not Found: ${error.message}`);
    }
  }

  update(id: string, updatePokemonDto: UpdatePokemonDto) {
    return `This action updates a #${id} pokemon`;
  }

  remove(id: string) {
    return `This action removes a #${id} pokemon`;
  }
}
