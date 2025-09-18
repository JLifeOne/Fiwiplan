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

export async function parseChat(chatMessage: string): Promise<any> {
  const prompt = `
    You are an intelligent event planning assistant. A user has sent the following message to start planning an event.
    Your task is to parse the message and extract the key details into a structured JSON object.

    The user's message is: "${chatMessage}"

    Extract the following fields:
    - eventName: A suitable name for the event (e.g., "John's Birthday Party").
    - eventType: The type of event (e.g., "birthday", "cookout", "dinner party").
    - culture: The cultural context if mentioned (e.g., "jamaican", "italian").
    - adults: The number of adults attending.
    - kids: The number of kids attending.
    - mealStyle: The style of the meal (e.g., "buffet", "family-style", "plated").
    - eventDate: The date of the event in ISO 8601 format (YYYY-MM-DD).

    If a field is not mentioned, use a reasonable default or leave it null.
    Return ONLY the JSON object.

    Example output:
    {
      "eventName": "Mom's 60th Birthday",
      "eventType": "birthday",
      "culture": "jamaican",
      "adults": 50,
      "kids": 10,
      "mealStyle": "buffet",
      "eventDate": "2025-12-25"
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    if (response.choices[0].message.content) {
      return JSON.parse(response.choices[0].message.content);
    } else {
      throw new Error('Failed to parse chat message');
    }
  } catch (error) {
    console.error('Error parsing chat message:', error);
    throw new Error('Failed to parse chat message');
  }
}

export async function balanceBudget(plan: any, budget: number): Promise<any> {
  const prompt = `
    You are an expert event planner and budget optimizer.
    A user wants to adjust their event plan to fit a specific budget.

    Current Plan:
    ${JSON.stringify(plan, null, 2)}

    Target Budget: ${budget} ${plan.costRange.currency}

    Your task is to analyze the plan and provide a list of actionable suggestions to reduce the cost and meet the target budget.
    For each suggestion, provide a clear description and an estimated cost saving.

    The suggestions should be practical and maintain the overall quality and spirit of the event.
    Consider things like:
    - Substituting ingredients (e.g., "Use chicken thighs instead of breasts").
    - Changing beverage options (e.g., "Make a large batch of punch instead of buying individual sodas").
    - Reducing quantities where appropriate, based on the number of guests.
    - DIY options for decorations or equipment.

    Return a JSON object with a single key, "suggestions", which is an array of objects. Each object should have two keys: "suggestion" (a string) and "estimatedSaving" (a number).

    Example output:
    {
      "suggestions": [
        {
          "suggestion": "Switch from beef tenderloin to a high-quality sirloin for the main course.",
          "estimatedSaving": 5000
        },
        {
          "suggestion": "Reduce the number of appetizer options from five to three.",
          "estimatedSaving": 3000
        }
      ]
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    if (response.choices[0].message.content) {
      return JSON.parse(response.choices[0].message.content);
    } else {
      throw new Error('Failed to generate budget suggestions');
    }
  } catch (error) {
    console.error('Error generating budget suggestions:', error);
    throw new Error('Failed to generate budget suggestions');
  }
}
