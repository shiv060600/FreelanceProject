'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import barColorsMap from './barColorsMap';

interface ClientSalesData {
  name: string;
  value: number;
}

interface ClientSalesPieChartProps {
  data: ClientSalesData[];
  totalSales: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: ClientSalesData;
  }>;
  totalSales: number;
}

const CustomTooltip = ({ active, payload, totalSales }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = totalSales > 0 ? ((data.value / totalSales) * 100).toFixed(1) : '0.0';
    
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          ${data.value.toLocaleString()} ({percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

interface CustomLegendProps {
  payload?: Array<{
    value: string;
    color: string;
    payload: ClientSalesData;
  }>;
  totalSales: number;
}

const CustomLegend = ({ payload, totalSales }: CustomLegendProps) => {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => {
        const percentage = totalSales > 0 ? ((entry.payload.value / totalSales) * 100).toFixed(1) : '0.0';
        
        return (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">{entry.value}</span>
            <span className="text-muted-foreground">
              (${entry.payload.value.toLocaleString()} - {percentage}%)
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function ClientSalesPieChart({ data, totalSales }: ClientSalesPieChartProps) {
  const colors = Object.values(barColorsMap);
  
  // Filter out clients with zero sales
  const filteredData = data.filter(client => client.value > 0);
  
  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        <p>No client sales data available</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <ResponsiveContainer width="100%" height={500}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) => 
              `${name}: ${(percent * 100).toFixed(1)}%`
            }
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {filteredData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            content={<CustomTooltip totalSales={totalSales} />}
          />
          <Legend 
            content={<CustomLegend totalSales={totalSales} />}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
