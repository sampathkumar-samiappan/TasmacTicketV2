import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const GradientDoughnutChart = ({ dataSource }) => {
  const gradients = [
    { from: "#ff8d03", to: "#ffd699" },  // IT
    { from: "#03a9f4", to: "#b3e5fc" },  // NON IT
    // Add more gradients if you have more categories
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <defs>
          {dataSource.map((_, index) => (
            <linearGradient
              key={index}
              id={`gradient${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={gradients[index % gradients.length].from}
                stopOpacity={0.9}
              />
              <stop
                offset="100%"
                stopColor={gradients[index % gradients.length].to}
                stopOpacity={0.7}
              />
            </linearGradient>
          ))}
        </defs>

        <Pie
          data={dataSource}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          startAngle={90}
          endAngle={450}
          label
        >
          {dataSource.map((_, index) => (
            <Cell key={`cell-${index}`} fill={`url(#gradient${index})`} />
          ))}
        </Pie>

        <Tooltip />
        <Legend verticalAlign="bottom" iconType="circle" layout="horizontal" />
      </PieChart>
    </ResponsiveContainer>
  );
};


export default GradientDoughnutChart;
