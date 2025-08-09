'use client'

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SalesBarChart from '@/components/ui/client-sales-barchart';
import ClientSalesPieChart from '../ui/client-sales-piechart';

interface ClientInfo {
  name: string | null;
  lifetime_client_earnings?: number | 0;
}

interface ClientYearlySales {
  x: Array<string>;
  y: Array<number>;
  name: string;
  type: 'bar';
}

type RechartsDataItem = { month: string } & { [client: string]: number };

interface AnalyticsSectionProps {
  rechartsData: RechartsDataItem[];
  clientsYearlySalesData: Map<string, ClientYearlySales>;
}

export default function AnalyticsSection({ 
  rechartsData, 
  clientsYearlySalesData 
}: AnalyticsSectionProps) {
  const [isChartsLoaded, setIsChartsLoaded] = useState(false);

  const handleAccordionChange = (value: string) => {
    if (value && !isChartsLoaded) {
      setIsChartsLoaded(true);
    }
  };

  // Prepare data for pie chart - calculate total sales per client
  const clientSalesData = Array.from(clientsYearlySalesData.values()).map(client => {
    //reduce y array(sales) to a single value
    const totalSales = client.y.reduce((sum, monthSales) => sum + monthSales, 0);
    return {
      name: client.name,
      value: totalSales,
    };
  });

  // Calculate total for percentages
  const totalSales = clientSalesData.reduce((sum, client) => sum + client.value, 0);

  return (
    <section className="w-full mt-8">
      <Accordion 
        type="single" 
        collapsible 
        className="w-full"
        onValueChange={handleAccordionChange}
      >
        <AccordionItem value="analytics" className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Sales Analytics</h2>
              <span className="text-sm text-muted-foreground">
                View detailed charts and insights
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            {isChartsLoaded ? (
              <div className="space-y-8">
                {/* Bar Chart Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Monthly Sales Breakdown (Last 12 Months)</h3>
                  <div className="flex justify-center">
                    <SalesBarChart 
                      rechartsData={rechartsData} 
                      clientsYearlySalesData={clientsYearlySalesData}
                    />
                  </div>
                </div>

                {/* Pie Chart Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Client Sales Distribution</h3>
                  <div className="flex justify-center">
                    <ClientSalesPieChart 
                      data={clientSalesData}
                      totalSales={totalSales}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading analytics...</p>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
