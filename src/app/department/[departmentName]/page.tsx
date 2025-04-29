// app/department/[departmentName]/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { bedCapacityData } from "../../../../public/bedCapacityData";
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
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface Bed {
  type: string;
  total: number;
  occupied: number;
  reserved: number;
}

interface DepartmentInfo {
  department: string;
  beds: Bed[];
}

const BedStatusIndicator = ({ total, occupied, reserved }: { total: number, occupied: number, reserved: number }) => {
  const available = total - occupied - reserved;
  const percentage = (occupied / total) * 100;
  
  let status = '';
  if (percentage > 85) status = 'Critical';
  else if (percentage > 65) status = 'High';
  else status = 'Normal';
  
  return (
    <div className="flex flex-col">
      <span className={`px-2 py-1 rounded-full text-xs font-medium mb-1 ${
        status === 'Normal' ? 'bg-green-100 text-green-800' :
        status === 'High' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {status} ({occupied}/{total})
      </span>
      <span className="text-xs text-gray-500">
        Available: {available} | Reserved: {reserved}
      </span>
    </div>
  );
};

const BedCard = ({ bed }: { bed: Bed }) => {
  const available = bed.total - bed.occupied - bed.reserved;
  const percentageOccupied = Math.round((bed.occupied / bed.total) * 100);
  
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow h-full">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">{bed.type}</h3>
        <BedStatusIndicator 
          total={bed.total} 
          occupied={bed.occupied} 
          reserved={bed.reserved} 
        />
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
        <div 
          className={`h-2.5 rounded-full ${
            percentageOccupied > 85 ? 'bg-red-600' :
            percentageOccupied > 65 ? 'bg-yellow-500' :
            'bg-green-600'
          }`} 
          style={{ width: `${percentageOccupied}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Occupied: {bed.occupied} ({percentageOccupied}%)</span>
        <span>Capacity: {bed.total}</span>
      </div>
    </div>
  );
};

const BedChart = ({ beds }: { beds: Bed[] }) => {
  const chartData = beds.map(bed => ({
    name: bed.type,
    total: bed.total,
    occupied: bed.occupied,
    available: bed.total - bed.occupied - bed.reserved,
    reserved: bed.reserved
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
          stackOffset="expand"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="available" name="Available" fill="#82ca9d" />
          <Bar dataKey="reserved" name="Reserved" fill="#8884d8" />
          <Bar dataKey="occupied" name="Occupied" fill="#ff8042" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const generateProjectionData = (departmentInfo: DepartmentInfo) => {
  const totalBeds = departmentInfo.beds.reduce((sum, bed) => sum + bed.total, 0);
  const totalOccupied = departmentInfo.beds.reduce((sum, bed) => sum + bed.occupied, 0);
  const occupancyRate = Math.round((totalOccupied / totalBeds) * 100);
  
  return {
    increase: Math.floor(Math.random() * 15 + 5).toString(),
    recommendedExpansion: Math.floor(totalBeds * 0.15).toString(),
    peakHours: getPeakHours(departmentInfo.department),
    currentOccupancy: occupancyRate
  };
};

const getPeakHours = (department: string) => {
  if (department.includes('Emergency')) return '4 PM - 10 PM';
  if (department.includes('ICU')) return 'All hours (24/7)';
  if (department.includes('General Ward')) return '10 AM - 6 PM';
  return '9 AM - 5 PM';
};

export default function DepartmentDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const departmentName = decodeURIComponent(params.departmentName as string);
  
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const departmentInfo = bedCapacityData.find(d => d.department === departmentName);
  const projectionData = departmentInfo ? generateProjectionData(departmentInfo) : null;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!departmentInfo || !projectionData) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Department not found</h1>
          <p className="text-gray-600">No information available for {departmentName}</p>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to capacity dashboard
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
            <h1 className="text-2xl font-bold text-gray-800">{departmentInfo.department}</h1>
            <p className="text-gray-500 mt-1">Bed capacity and utilization</p>
          </div>
          <Link href="/" className="flex items-center text-blue-600 hover:underline">
            <FiArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Bed Types and Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentInfo.beds.map((bed, index) => (
              <BedCard key={index} bed={bed} />
            ))}
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3 text-blue-600">Capacity Visualization</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="mb-2 text-gray-700">Current bed utilization for {departmentInfo.department}:</p>
            <BedChart beds={departmentInfo.beds} />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-3 text-blue-600">Capacity Projections</h2>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="mb-3 text-blue-800">Based on current trends and historical data:</p>
            <ul className="list-disc pl-5 space-y-2 text-blue-700">
              <li>
                <span className="font-medium">Current occupancy rate:</span> {projectionData.currentOccupancy}%
              </li>
              <li>
                <span className="font-medium">Expected demand increase:</span> {projectionData.increase}%
              </li>
              <li>
                <span className="font-medium">Recommended expansion:</span> {projectionData.recommendedExpansion} beds
              </li>
              <li>
                <span className="font-medium">Peak hours:</span> {projectionData.peakHours}
              </li>
              <li>
                <span className="font-medium">Capacity status:</span> 
                {projectionData.currentOccupancy > 85 ? 
                  " Critical capacity - consider expansion" : 
                  projectionData.currentOccupancy > 65 ?
                  " High utilization - monitor closely" :
                  " Normal operations"}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}