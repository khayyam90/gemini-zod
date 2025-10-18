import fs from 'node:fs'
import { CaloriesEstimator } from './calories-estimator';

const files = fs.readdirSync('./input');
files.forEach(async file => {
    const r = await CaloriesEstimator.get('./input/' + file);
    console.warn(r);
});





