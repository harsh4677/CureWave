// utils/parseCsv.ts
import csv from 'csv-parser';
import fs from 'fs';

interface DiseaseRecord {
  month: string;
  monthNumber: number;
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  diseases: string;
}

export async function parseCsv(filePath: string): Promise<DiseaseRecord[]> {
  const results: DiseaseRecord[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Convert string data to proper types
        results.push({
          month: data.month,
          monthNumber: parseInt(data.monthNumber),
          tempMin: parseFloat(data.tempMin),
          tempMax: parseFloat(data.tempMax),
          humidityMin: parseFloat(data.humidityMin),
          humidityMax: parseFloat(data.humidityMax),
          diseases: data.diseases
        });
      })
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}