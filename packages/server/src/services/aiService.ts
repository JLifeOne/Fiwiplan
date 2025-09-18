import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface KnowledgeBase {
    dishes: string[];
    beverages: string[];
    equipment: string[];
    portioning_rules: string[];
}

function getKnowledgeBase(culture: string, eventType: string): KnowledgeBase | null {
    const filePath = path.join(__dirname, `../data/${culture}_${eventType}.yaml`);
    if (fs.existsSync(filePath)) {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        return yaml.load(fileContents) as KnowledgeBase;
    }
    return null;
}

export async function generateMenuPlan(promptData: any): Promise<any> {
    const { culture, eventType } = promptData;
    const knowledgeBase = getKnowledgeBase(culture, eventType);

    let prompt = `Generate a menu plan with the following details:\n${JSON.stringify(promptData, null, 2)}`;

    if (knowledgeBase) {
        prompt += `\n\nUse the following knowledge base to inform your suggestions:\n${JSON.stringify(knowledgeBase, null, 2)}`;
    }

    prompt += "\n\nReturn the response in the JSON format specified in the product spec.";

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    if (response.choices[0].message.content) {
      return JSON.parse(response.choices[0].message.content);
    } else {
      throw new Error('Failed to generate menu plan');
    }
  } catch (error) {
    console.error('Error generating menu plan:', error);
    throw new Error('Failed to generate menu plan');
  }
}
