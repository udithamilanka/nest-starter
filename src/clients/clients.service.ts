import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
  ) {}

  async findAll(): Promise<Client[]> {
    return this.clientsRepository.find();
  }

  async findOne(id: string): Promise<Client | null> {
    return this.clientsRepository.findOneBy({ id });
  }

  async findBySlug(slug: string): Promise<Client | null> {
    return this.clientsRepository.findOneBy({ slug });
  }

  async create(clientData: Partial<Client>): Promise<Client> {
    if (clientData.name && !clientData.slug) {
      clientData.slug = clientData.name.toLowerCase().replace(/\s+/g, '-');
    }
    const client = this.clientsRepository.create(clientData);
    return this.clientsRepository.save(client);
  }

  async update(
    id: string,
    clientData: Partial<Client>,
  ): Promise<Client | null> {
    await this.clientsRepository.update(id, clientData);
    return this.findOne(id);
  }
}
