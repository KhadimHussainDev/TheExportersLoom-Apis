import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
const Groq = require('groq-sdk');

@Injectable()
export class CostEstimationService {
  private readonly groq = new Groq();
  private readonly systemContent: string;

  constructor() {
    // Load system content from a file
    const filePath = path.join(process.cwd(), 'src', 'cost-estimation', 'system-content.txt');
    this.systemContent = fs.readFileSync(filePath, 'utf8');

  }

  async getCostEstimation(userContent: string): Promise<any> {
    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: this.systemContent,
          },
          {
            role: 'user',
            content: userContent,
          },
        ],
        model: 'gemma2-9b-it',
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
        response_format: {
          type: 'json_object',
        },
        stop: null,
      });

      return chatCompletion.choices[0].message.content;
    } catch (error) {
      return error.error.error.failed_generation;
    }
  }
}