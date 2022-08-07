import { Injectable } from '@nestjs/common';

import { PokeRespose } from './interface/poke-respose.interface';
// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { Pokemon } from '../pokemon/entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name) private readonly PokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}
  async executeSeed() {
    await this.PokemonModel.deleteMany({});
    const data = await this.http.get<PokeRespose>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );
    const pokemonToInsert: { name: string; no: number }[] = [];
    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];

      pokemonToInsert.push({ name, no });
    });

    await this.PokemonModel.insertMany(pokemonToInsert);

    return 'Seed excute';
  }
}
