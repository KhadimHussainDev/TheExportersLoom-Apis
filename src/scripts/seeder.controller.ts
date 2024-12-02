import { Controller, Post } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('seeder')
export class SeederController {
  constructor(private readonly seederService: SeederService) { }

  @Post('populate')
  async populateData() {
    try{
      await this.seederService.populateData();
      return "Data populated successfully";
    }catch(e){
      return e;
    }
  }
}