'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription as CardDescriptionComponent } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface LineChartProps {
  data: any[]
  title: string
  description?: string
  dataKey: string
  xAxisKey: string
  color?: string
}

export function TrendChart({ data, title, description, dataKey, xAxisKey, color = 'hsl(var(--primary))' }: LineChartProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescriptionComponent>{description}</CardDescriptionComponent>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface BarChartProps {
  data: any[]
  title: string
  description?: string
  dataKey: string
  xAxisKey: string
  color?: string
}

export function BarChartComponent({ data, title, description, dataKey, xAxisKey, color = 'hsl(var(--primary))' }: BarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescriptionComponent>{description}</CardDescriptionComponent>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
              className="fill-muted-foreground"
            />
            <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface PieChartProps {
  data: any[]
  title: string
  description?: string
  dataKey: string
  nameKey: string
  colors?: string[]
}

const DEFAULT_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(263, 70%, 50%)',
  'hsl(217, 91%, 60%)',
  'hsl(346, 77%, 60%)',
  'hsl(25, 95%, 53%)',
  'hsl(142, 76%, 36%)',
]

export function PieChartComponent({ data, title, description, dataKey, nameKey, colors = DEFAULT_COLORS }: PieChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescriptionComponent>{description}</CardDescriptionComponent>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={60}
              label={(entry) => `${entry[nameKey]}: ${Math.round(entry[dataKey])}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
