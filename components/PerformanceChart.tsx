
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  data: {
    ytd: string;
    threeMonth: string;
    sixMonth: string;
    oneYear: string;
  };
}

export const PerformanceChart: React.FC<Props> = ({ data }) => {
  const parseVal = (v: string) => parseFloat(v.replace(/[+%]/g, '')) || 0;

  const chartData = [
    { name: '3M', value: parseVal(data.threeMonth) },
    { name: '6M', value: parseVal(data.sixMonth) },
    { name: 'YTD', value: parseVal(data.ytd) },
    { name: '1Y', value: parseVal(data.oneYear) },
  ];

  return (
    <div className="h-[200px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.1)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 10, fontWeight: 700, opacity: 0.5}} 
          />
          <YAxis hide />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              padding: '8px 12px'
            }}
            formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
          />
          <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={32}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#34c759' : '#ff3b30'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
