// components/AreaChart.js
"use client";
import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", users: 400 },
  { month: "Feb", users: 300 },
  { month: "Mar", users: 200 },
  { month: "Apr", users: 278 },
  { month: "May", users: 189 },
  { month: "Jun", users: 239 },
];

export default function AreaChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ReAreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3E57A7" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3E57A7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="users"
          stroke="#3E57A7"
          fillOpacity={1}
          fill="url(#colorUsers)"
        />
      </ReAreaChart>
    </ResponsiveContainer>
  );
}
