import { Card } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface RevenueItem {
    name: string;
    'Doanh thu': number;
}

interface RevenueChartProps {
    revenueChartData: RevenueItem[];
}

const RevenueChart = ({ revenueChartData }: RevenueChartProps) => {
    return (
        <Card title="Biểu Đồ Doanh Thu" className="shadow-lg">
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={revenueChartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                        />
                        <RechartsTooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value: number | string | undefined) => {
                                const num = typeof value === 'number'
                                    ? value
                                    : (typeof value === 'string' ? Number(value) : 0);
                                return [
                                    new Intl.NumberFormat('vi-VN').format(num) + ' VND',
                                    'Doanh thu'
                                ] as [string, 'Doanh thu'];
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="Doanh thu"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default RevenueChart;
