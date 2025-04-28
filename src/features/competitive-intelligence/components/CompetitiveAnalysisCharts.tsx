import React from 'react';
import {
  Bar,
  Line,
  Radar,
  Scatter,
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompetitiveAnalysisData } from '../types';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

interface CompetitiveAnalysisChartsProps {
  data: CompetitiveAnalysisData;
  peerGroup: string[];
  timeRange: '1M' | '3M' | '6M' | '1Y' | '3Y';
}

export function CompetitiveAnalysisCharts({ 
  data,
  peerGroup,
  timeRange 
}: CompetitiveAnalysisChartsProps) {
  // Benchmarking Chart Data
  const benchmarkData = {
    labels: peerGroup,
    datasets: [
      {
        label: 'Revenue Growth %',
        data: peerGroup.map(peer => data.benchmarks[peer]?.revenueGrowth || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Profit Margin %',
        data: peerGroup.map(peer => data.benchmarks[peer]?.profitMargin || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Market Share %',
        data: peerGroup.map(peer => data.benchmarks[peer]?.marketShare || 0),
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
      }
    ]
  };

  // Short Interest Chart Data
  const shortInterestData = {
    labels: data.shortInterest.timeline,
    datasets: [
      {
        label: 'Short Interest %',
        data: data.shortInterest.percentages,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1
      }
    ]
  };

  // Competitive Advantage Radar Data
  const radarData = {
    labels: [
      'Innovation',
      'Cost Leadership', 
      'Brand Strength',
      'Customer Loyalty',
      'Supply Chain',
      'Digital Presence'
    ],
    datasets: [
      {
        label: 'Your Company',
        data: data.advantageScores.company,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Industry Average',
        data: data.advantageScores.industryAvg,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  // Market Position Scatter Plot
  const marketPositionData = {
    datasets: [
      {
        label: 'Market Position',
        data: peerGroup.map(peer => ({
          x: data.benchmarks[peer]?.marketShare || 0,
          y: data.benchmarks[peer]?.revenueGrowth || 0
        })),
        backgroundColor: peerGroup.map((_, i) => 
          i === 0 ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 99, 132, 0.5)'
        ),
      }
    ]
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Competitive Intelligence Visualizations</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="benchmarking">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="benchmarking">Benchmarking</TabsTrigger>
            <TabsTrigger value="shortInterest">Short Interest</TabsTrigger>
            <TabsTrigger value="advantage">Competitive Advantage</TabsTrigger>
            <TabsTrigger value="position">Market Position</TabsTrigger>
          </TabsList>

          <TabsContent value="benchmarking">
            <div className="h-96">
              <Chart 
                type="bar" 
                data={benchmarkData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="shortInterest">
            <div className="h-96">
              <Chart 
                type="line" 
                data={shortInterestData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="advantage">
            <div className="h-96">
              <Chart 
                type="radar" 
                data={radarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      angleLines: {
                        display: true
                      },
                      suggestedMin: 0,
                      suggestedMax: 100
                    }
                  }
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="position">
            <div className="h-96">
              <Chart 
                type="scatter" 
                data={marketPositionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Market Share %'
                      }
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Revenue Growth %'
                      }
                    }
                  }
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
