'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import barColorsMap from "./barColorsMap";
import { useMemo } from 'react';

interface ClientYearlySales {
  x: Array<string>;
  y: Array<number>;
  name: string;
  type: 'bar';
}

type RechartsDataItem = { month: string } & { [client: string]: number };


interface SalesBarChartProps {
  rechartsData: RechartsDataItem[];
  clientsYearlySalesData: Map<string, ClientYearlySales>;
}



export default function SalesBarChart({rechartsData,clientsYearlySalesData}:SalesBarChartProps){
    // Use color:hex mapping from barColorsMap
    const clientSalesObjects: ClientYearlySales[] = Array.from(clientsYearlySalesData.values());
    const colors: string[] = Object.values(barColorsMap);
    const bars = useMemo(() => {
        const res: JSX.Element[] = [];
        for (let i = 0; i < clientSalesObjects.length; i++) {
            res.push(
                <Bar
                    key={clientSalesObjects[i].name}
                    dataKey={clientSalesObjects[i].name}
                    stackId="a"
                    fill={colors[i % colors.length]}
                />
            );
        }
        return res;
    }, [clientsYearlySalesData])
   
    return (
        <ResponsiveContainer width="80%" height={600}>
            <BarChart data={rechartsData} margin={{ top: 40, right: 20, left: 40, bottom: 80 }}>
                <XAxis dataKey="month" />
                <YAxis/>
                <Tooltip />
                <Legend />
                {bars}
            </BarChart>
        </ResponsiveContainer>
    );

}