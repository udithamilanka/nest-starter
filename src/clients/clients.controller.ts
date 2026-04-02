import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  findAll(): Promise<Client[]> {
    return this.clientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Client | null> {
    return this.clientsService.findOne(id);
  }

  @Post()
  create(@Body() clientData: Partial<Client>): Promise<Client> {
    return this.clientsService.create(clientData);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() clientData: Partial<Client>,
  ): Promise<Client | null> {
    return this.clientsService.update(id, clientData);
  }
}
