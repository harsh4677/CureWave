// app/disease/[diseaseName]/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { medicineData } from "../../../../public/medicinedata";
import { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface Medicine {
  name: string;
  description: string;
  currentStock: number;
  futureStockReq: string;
  lastUsed?: string;
}

interface DiseaseInfo {
  disease: string;
  medicines: Medicine[];
}

const StockIndicator = ({ stock }: { stock: number }) => {
  let status = '';
  if (stock > 50) status = 'Good';
  else if (stock > 20) status = 'Low';
  else status = 'Critical';
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      status === 'Good' ? 'bg-green-100 text-green-800' :
      status === 'Low' ? 'bg-yellow-100 text-yellow-800' :
      'bg-red-100 text-red-800'
    }`}>
      {status} ({stock})
    </span>
  );
};

const MedicineCard = ({ medicine }: { medicine: Medicine }) => (
  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow h-full">
    <div className="flex justify-between items-start mb-2">
      <h3 className="font-bold text-lg">{medicine.name}</h3>
      <StockIndicator stock={medicine.currentStock} />
    </div>
    <p className="text-gray-600 mb-3 text-sm">{medicine.description}</p>
    <div className="flex justify-between text-xs text-gray-500">
      <span>Last updated: {medicine.lastUsed || new Date().toLocaleDateString()}</span>
      <span>Reorder: {medicine.currentStock < 30 ? 'Yes' : 'No'}</span>
    </div>
  </div>
);

const StockChart = ({ medicines }: { medicines: Medicine[] }) => {
  // Transform medicine data for the chart
  const chartData = medicines.map(medicine => ({
    name: medicine.name,
    currentStock: medicine.currentStock,
    recommendedStock: Math.floor(medicine.currentStock * 1.3), // 30% more than current
    difference: Math.floor(medicine.currentStock * 1.3) - medicine.currentStock
  }));

  return (
    <div className="h-80 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" /> {/* Changed to show names on X-axis */}
          <YAxis /> {/* Changed to show values on Y-axis */}
          <Tooltip />
          <Legend />
          <ReferenceLine y={0} stroke="#000" /> {/* Changed to y for vertical chart */}
          <Bar dataKey="currentStock" name="Current Stock" fill="#8884d8" />
          <Bar dataKey="difference" name="Recommended Additional" fill="#82ca9d">
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.difference > 0 ? '#82ca9d' : '#ff8042'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-500 mt-2">
        * Green bars show additional stock needed to meet recommended levels
      </p>
    </div>
  );
};

// Helper function to generate projection data based on disease and medicines
const generateProjectionData = (diseaseInfo: DiseaseInfo) => {
  const totalStock = diseaseInfo.medicines.reduce((sum, med) => sum + med.currentStock, 0);
  const avgStock = totalStock / diseaseInfo.medicines.length;
  
  return {
    increase: Math.floor(Math.random() * 20 + 10).toString(),
    recommendedStock: Math.floor(avgStock * 1.3).toString(),
    peakSeason: getPeakSeason(diseaseInfo.disease)
  };
};

const getPeakSeason = (disease: string) => {
  if (disease.includes('Flu') || disease.includes('Cold')) return 'Winter';
  if (disease.includes('Allergy')) return 'Spring';
  if (disease.includes('Heat')) return 'Summer';
  return 'Fall';
};

export default function DiseaseDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const diseaseName = decodeURIComponent(params.diseaseName as string);
  
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const diseaseInfo = medicineData.find(d => d.disease === diseaseName);
  const projectionData = diseaseInfo ? generateProjectionData(diseaseInfo) : null;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!diseaseInfo || !projectionData) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Disease not found</h1>
          <p className="text-gray-600">No information available for {diseaseName}</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to health advisory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{diseaseInfo.disease}</h1>
            <p className="text-gray-500 mt-1">Health advisory and treatment options</p>
          </div>
          <Link href="/" className="flex items-center text-blue-600 hover:underline">
            <FiArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Recommended Medicines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {diseaseInfo.medicines.map((medicine, index) => (
              <MedicineCard key={index} medicine={medicine} />
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-blue-600">Stock Analysis</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="mb-2 text-gray-700">Current stock vs recommended levels for {diseaseInfo.disease}:</p>
            <StockChart medicines={diseaseInfo.medicines} />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3 text-blue-600">Inventory Projections</h2>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="mb-3 text-blue-800">Based on current trends and weather forecasts:</p>
            <ul className="list-disc pl-5 space-y-2 text-blue-700">
              <li>
                <span className="font-medium">Expected demand increase:</span> {projectionData.increase}%
              </li>
              <li>
                <span className="font-medium">Recommended stock level:</span> {projectionData.recommendedStock} units
              </li>
              <li>
                <span className="font-medium">Peak season:</span> {projectionData.peakSeason}
              </li>
              <li>
                <span className="font-medium">Current inventory status:</span> 
                {diseaseInfo.medicines.some(m => m.currentStock < 20) ? 
                  " Critical items need reorder" : " All items adequately stocked"}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}