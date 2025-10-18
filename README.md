# Using ZOD with Gemini AI results

Protect your app from incoming raw data even if they are coming from Gemini AI.

In this short article I will present an easy way to stongify your TypeScript objects built from Gemini AI results.

### Usage : 
* store meat pictures in JPG files in the input directory
* fill your GEMINI_KEY in a .env file such as GEMINI_KEY="mykey" 
 
```
npm i
npx tsx src/main.ts
```

## Requesting data from Gemini AI 

When prompting with Gemini AI, you can ask for a specific result type such as JSON with named properties. But even with AIs you must keep focused on never trusting the incoming data. This truth is correct for user-input but also for external inputs such as AI powered inputs.

In this specific case Zod is your friend : this TypeScript package is dedicated to the type validation : ensuring an object effectively respects a given shape.

## Example App : guessing calories from meat pictures

To illustrate the communication with Gemini and the validation of its results, I will propose a short calories estimator running this flow : 

![image](assets/flow.png)


The first point is to decide the shape of the JSON result. I propose something like : 

```
import * as z from "zod/mini"

const zCaloriesEstimation = z.object({ 
  calories: z.number(),
  name: z.string()
});

export type CaloriesEstimation = z.infer<typeof zCaloriesEstimation>;
```

This way the calories estimator will have the following signature

```
export class CaloriesEstimator{
    public static async get(filename: string): Promise<CaloriesEstimation>{
    ...
    }
}
```

The next point is to forge the Gemini request :

```
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
```

Then the Zod validation :

```
const json = response.text!.replace('```json', '').replace('```', '');
const result = JSON.parse(json);

const r =  zCaloriesEstimation.safeParse(result); 
if (r.success){
    return r.data;
}else{
    console.error(r.error.message);
    return undefined;
}
```


The result :

```
{ calories: 950, name: 'Raclette with Potatoes and Cured Meats' }
{ calories: 550, name: 'Tofu and Noodle Bowl' }
{ calories: 450, name: 'Avocado, Mango, Tomato, and Egg Salad' }
{ calories: 600, name: 'Sausage and Potato Salad' }
```