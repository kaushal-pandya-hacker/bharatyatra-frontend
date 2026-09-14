import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ExperimentsService, Experiment, ExperimentDecision } from './experiments.service';

@Controller('api/v1/experiments')
export class ExperimentsController {
  constructor(private readonly experimentsService: ExperimentsService) {}

  @Get()
  listExperiments() {
    return this.experimentsService.listExperiments();
  }

  @Get(':id')
  getExperiment(@Param('id') id: string) {
    return this.experimentsService.getExperiment(id);
  }

  @Post()
  registerExperiment(@Body() experiment: Experiment) {
    return this.experimentsService.registerExperiment(experiment);
  }

  @Get(':id/assign')
  assignUser(@Param('id') id: string, @Query('userId') userId: string) {
    return this.experimentsService.assignUserVariant(userId || 'anonymous-user', id);
  }

  @Post(':id/conclude')
  concludeExperiment(@Param('id') id: string, @Body('decision') decision: ExperimentDecision) {
    return this.experimentsService.concludeExperiment(id, decision);
  }
}
