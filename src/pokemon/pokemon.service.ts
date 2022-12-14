import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  private defailtLimit: number;
  constructor(
    @InjectModel(Pokemon.name) private readonly PokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    this.defailtLimit = this.configService.get<number>('defaul_limit');
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.PokemonModel.create(createPokemonDto);

      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = this.defailtLimit, offset = 0 } = paginationDto;

    return await this.PokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({ no: 1 })
      .select('-__v');
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    try {
      if (!isNaN(+term)) {
        pokemon = await this.PokemonModel.findOne({ no: term });
      }

      if (!pokemon && isValidObjectId(term)) {
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

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    try {
      if (updatePokemonDto.name) {
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
      }
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(_id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    //await this.PokemonModel.findByIdAndDelete(id);
    // const results = await this.PokemonModel.findByIdAndDelete(id);
    // if (!results) {
    //   throw new BadRequestException(`No se encontro un pokemon con el id`);
    // }
    // return results;
    const { deletedCount } = await this.PokemonModel.deleteOne({ _id });
    if (deletedCount === 0) {
      throw new BadRequestException(`No se encontro un pokemon con el id`);
    }
    return;
  }

  private handleExceptions(error: any) {
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
