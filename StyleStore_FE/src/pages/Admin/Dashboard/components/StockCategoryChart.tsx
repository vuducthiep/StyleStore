import { Card } from 'antd';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface StockCategoryItem {
    name: string;
    value: number;
    [key: string]: string | number;
}

interface StockCategoryChartProps {
    stockCategoryData: StockCategoryItem[];
    totalStock: number | null;
}

const STOCK_COLORS = ['#8b5cf6', '#22c55e', '#0ea5e9', '#f59e0b', '#ef4444', '#14b8a6'];
const REVENUE_FORMATTER = new Intl.NumberFormat('vi-VN');

const StockCategoryChart = ({ stockCategoryData, totalStock }: StockCategoryChartProps) => {
    return (
        <Card title="Tồn Kho Theo Danh Mục" className="shadow-lg">
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <RechartsTooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value: number | string | undefined, _name, props) => {
                                const num = typeof value === 'number'
                                    ? value
                                    : (typeof value === 'string' ? Number(value) : 0);
                                return [
                                    REVENUE_FORMATTER.format(num),
                                    props?.payload?.name ?? ''
                                ] as [string, string];
                            }}
                        />
                        <Legend />
                        <Pie
                            data={stockCategoryData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius="70%"
                            paddingAngle={2}
                            labelLine={false}
                        >
                            {stockCategoryData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={STOCK_COLORS[index % STOCK_COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
                Tổng tồn kho: {REVENUE_FORMATTER.format(totalStock ?? 0)}
            </div>
        </Card>
    );
};

export default StockCategoryChart;
