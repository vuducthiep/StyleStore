import { Card } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface UserRegistrationItem {
    name: string;
    'Người dùng': number;
}

interface UserRegistrationChartProps {
    userChartData: UserRegistrationItem[];
}

const UserRegistrationChart = ({ userChartData }: UserRegistrationChartProps) => {
    return (
        <Card title="Biểu Đồ Đăng Ký Người Dùng" className="shadow-lg">
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={userChartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                        />
                        <RechartsTooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="Người dùng"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorUsers)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default UserRegistrationChart;
