// components/BarChart.js
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 4780 },
  { name: "May", sales: 5890 },
  { name: "Jun", sales: 6390 },
  { name: "Jul", sales: 7490 },
];

export default function CustomBarChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="sales" fill="#3E57A7" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}