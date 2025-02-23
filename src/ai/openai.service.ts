import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import * as process from "node:process";

@Injectable()
export class OpenAiService {
    private readonly openai: OpenAI;
    private readonly logger = new Logger(OpenAiService.name);

    constructor() {
      this.openai =  new OpenAI({
        apiKey: process.env.OPEN_AI_KEY
      })
    }

    /**
     * Llama al modelo de Chat (ej: GPT-3.5 o GPT-4) con un prompt en español
     * @param messages Mensajes estilo ChatGPT
     * @param model
     */
    async callChatCompletion(messages: any[], model = 'gpt-3.5-turbo'): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model,
                messages,
                temperature: 0.7,
            });

            return response.choices[0]?.message?.content || '';
        } catch (error) {
            this.logger.error(error.response?.data || error.message);
            throw new Error('Error calling OpenAI API');
        }
    }
  }