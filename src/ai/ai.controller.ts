import {Body, Controller, HttpException, Post} from '@nestjs/common';
import {OpenAiService} from './openai.service';
import {CarsService} from '../cars/cars.service';
import {MoreThan} from "typeorm";

@Controller('ai')
export class AiController {
  constructor(
    private readonly openAiService: OpenAiService,
    private readonly carsService: CarsService,
  ) {
  }

  @Post('ask')
  async ask(@Body('prompt') prompt: string) {
    const SYSTEM_PROMPT = `
Eres un asistente que ayuda a manejar la base de datos "cars":
- Cada "car" tiene: id, modelo, placa, precio (p.ej. 10000).
- Puedes crear, listar, editar (actualizar) o eliminar autos.
- El usuario hablará en español y te pedirá acciones en la BD.
- Tu respuesta final **SIEMPRE** debe ser un JSON con la siguiente estructura:
  {
    "action": "<nombre de la acción>",
    ...campos necesarios...
  }

Ejemplos de acción:

1) Crear autos:
Usuario: "Créame 2 autos de marca Toyota con placas aleatorias."
Respuesta (JSON):
{
  "action": "createCars",
  "data": [
    { "modelo": "Toyota", "placa": "ABC123", "precio": 10000 },
    { "modelo": "Toyota", "placa": "XYZ987", "precio": 9500 }
  ]
}

2) Mostrar autos según condición:
Usuario: "Muestre los autos con precio mayor a 5000."
Respuesta (JSON):
{
  "action": "findCars",
  "conditions": { "precio": ">5000" }
}

3) Actualizar ciertos autos:
Usuario: "Actualice el precio de todos los autos Toyota a 12000."
Respuesta (JSON):
{
  "action": "updateCars",
  "conditions": { "modelo": "Toyota" },
  "data": { "precio": 12000 }
}

4) Eliminar autos según condición:
Usuario: "Elimine 2 autos de marca Toyota."
Respuesta (JSON):
{
  "action": "removeCars",
  "conditions": { "modelo": "Toyota" },
  "limit": 2
}

5) Si la petición no corresponde a BD:
{
  "action": "none",
  "message": "No corresponde a ninguna acción de BD."
}

- NO incluyas texto adicional fuera del JSON.
`;

    const messages = [
      {role: 'system', content: SYSTEM_PROMPT},
      {role: 'user', content: prompt},
    ];

    const completion = await this.openAiService.callChatCompletion(messages);

    let jsonResponse: any;
    try {
      jsonResponse = JSON.parse(completion.trim());
    } catch (error) {
      throw new HttpException(
        `La IA no devolvió JSON válido: ${completion}`,
        400,
      );
    }

    const action = jsonResponse.action;

    switch (action) {
      case 'createCars':
        if (!jsonResponse.data || !Array.isArray(jsonResponse.data)) {
          throw new HttpException(
            'La IA no devolvió un array de autos en "data".',
            400,
          );
        }

        for (const carData of jsonResponse.data) {
          await this.carsService.create(carData);
        }
        return {message: `Se han creado ${jsonResponse.data.length} autos.`};

      case 'findCars':

        return await this._findCarsWithConditions(jsonResponse.conditions);
      case 'updateCars':
        return await this.handleUpdateCars(jsonResponse);

      case 'removeCars':
        return await this.handleRemoveCars(jsonResponse);
      case 'none':

        return {message: jsonResponse.message || 'Sin acción de BD.'};

      default:
        return {message: 'Acción no reconocida.'};
    }
  }

  private async _findCarsWithConditions(conditions: any) {
    if (conditions?.precio?.startsWith('>')) {
      const min = parseInt(conditions.precio.replace('>', ''), 10);
      return this.carsService.findWithPriceGreaterThan(min);
    }
    return this.carsService.findAll();
  }

  private async handleUpdateCars(jsonResponse: any) {
    const { conditions, data } = jsonResponse;
    if (!data || typeof data !== 'object') {
      throw new HttpException('Faltan datos para updateCars.', 400);
    }

    const carsToUpdate = await this._findCars(conditions);

    for (const car of carsToUpdate) {
      await this.carsService.update(car.id, data);
    }
    return { message: `Se han actualizado ${carsToUpdate.length} autos.` };
  }

  private async handleRemoveCars(jsonResponse: any) {

    const { conditions, limit } = jsonResponse;

    const carsToRemove = await this._findCars(conditions);

    const selected = limit ? carsToRemove.slice(0, limit) : carsToRemove;

    for (const car of selected) {
      await this.carsService.remove(car.id);
    }
    return { message: `Se han eliminado ${selected.length} autos.` };
  }

  private async _findCars(conditions?: any) {
    if (!conditions) {
      return this.carsService.findAll();
    }
    const query: any = {};

    if (conditions.precio?.startsWith('>')) {
      const min = parseInt(conditions.precio.replace('>', ''), 10);
      query.precio = MoreThan(min);
    } else if (conditions.precio) {
      query.precio = parseInt(conditions.precio, 10);
    }

    if (conditions.modelo) {
      query.modelo = conditions.modelo;
    }
    return this.carsService.findBy(query);
  }
}