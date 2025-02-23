import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private HF_TOKEN = process.env.HF_TOKEN || ''; // tu token aquí o desde .env
  private MODEL_URL = 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-1B';

  async queryModel(prompt: string): Promise<string> {
    const structuredPrompt = `Usuario: ${prompt}\nAsistente:`;
    try {
      const response = await axios.post(
        this.MODEL_URL,
        { inputs: structuredPrompt },
        {
          headers: {
            Authorization: `Bearer ${this.HF_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const data = response.data;
      console.log('Response from HF:', data);
      return JSON.stringify(data); 
    } catch (error) {
      console.error(error);
      throw new HttpException('Error in AI Service', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}