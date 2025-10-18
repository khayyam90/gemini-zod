import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv'
import fs from 'node:fs'
import { ZodError } from 'zod';
import * as z from "zod/mini"

const zCaloriesEstimation = z.object({ 
  calories: z.number(),
  name: z.string()
});

export type CaloriesEstimation = z.infer<typeof zCaloriesEstimation>;

export class CaloriesEstimator{
    public static async get(filename: string): Promise<CaloriesEstimation | undefined>{
        const ai = new GoogleGenAI({apiKey: dotenv.config().parsed!['GEMINI_KEY']});

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: {
                parts: [
                { 
                    text: 'Estimate the amount of calories in the meal in the photo. Output as a JSON object with a calories property and a property named name with the guessed name of the meal'
                },
                { 
                    inlineData: {
                        data: new Buffer(fs.readFileSync(filename)).toString('base64'),
                        mimeType: "image/jpg"
                    }
                }
                ]
            }
        });
        const json = response.text!.replace('```json', '').replace('```', '');
        const result = JSON.parse(json);

        const r =  zCaloriesEstimation.safeParse(result); 
        if (r.success){
            return r.data;
        }else{
            console.error(r.error.message);
            return undefined;
        }
    }
}