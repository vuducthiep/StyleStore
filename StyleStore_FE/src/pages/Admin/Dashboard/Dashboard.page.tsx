import { useEffect, useState, useMemo, memo } from 'react';
import { Card, Spin, Empty, Tooltip } from 'antd';
import { ShoppingOutlined, UserOutlined, DollarOutlined } from '@ant-design/icons';
import CountUp from 'react-countup';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';
import { getAuthToken } from '../../../services/auth';

interface StatsResponse<T> {
    success: boolean;
    message: string;
    data: T;
}


interface ProductCount {
    totalProducts: number;
}

interface UserCount {
    activeUsers: number;
}

interface RevenueGrowth {
    currentMonth: number;
    currentYear: number;
    previousMonthRevenue: number;
    twoMonthsAgoRevenue: number;
    growthAmount: number;
    growthPercentage: number;
}

interface MonthlyUser {
    year: number;
    month: number;
    count: number;
}

interface MonthlyRevenue {
    year: number;
    month: number;
    revenue: number;
}

const DashboardPage = () => {
    const [productCount, setProductCount] = useState<number | null>(null);
    const [activeUsers, setActiveUsers] = useState<number | null>(null);
    const [revenueGrowth, setRevenueGrowth] = useState<RevenueGrowth | null>(null);
    const [userRegistrations, setUserRegistrations] = useState<MonthlyUser[]>([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // const [isFirstLoad, setIsFirstLoad] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const token = getAuthToken();

                if (!token) {
                    throw new Error('No authentication token found. Please log in again.');
                }

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                };

                console.log('Fetching stats with token:', token.substring(0, 20) + '...');

                // Fetch all stats in parallel
                const [productsRes, usersRes, revenueRes, userRegRes, monthlyRevRes] = await Promise.all([
                    fetch('http://localhost:8080/api/admin/stats/products/count', { headers }),
                    fetch('http://localhost:8080/api/admin/stats/users/active-count', { headers }),
                    fetch('http://localhost:8080/api/admin/stats/revenue/recent-month-growth', { headers }),
                    fetch('http://localhost:8080/api/admin/stats/monthly-user-registrations', { headers }),
                    fetch('http://localhost:8080/api/admin/stats/revenue/monthly-recent', { headers }),
                ]);

                console.log('Response status:', productsRes.status, usersRes.status, revenueRes.status, userRegRes.status, monthlyRevRes.status);

                if (!productsRes.ok || !usersRes.ok || !revenueRes.ok || !userRegRes.ok || !monthlyRevRes.ok) {
                    const errorMessages = [];
                    if (!productsRes.ok) errorMessages.push(`Products: ${productsRes.status}`);
                    if (!usersRes.ok) errorMessages.push(`Users: ${usersRes.status}`);
                    if (!revenueRes.ok) errorMessages.push(`Revenue: ${revenueRes.status}`);
                    if (!userRegRes.ok) errorMessages.push(`UserReg: ${userRegRes.status}`);
                    if (!monthlyRevRes.ok) errorMessages.push(`MonthlyRev: ${monthlyRevRes.status}`);
                    throw new Error(`Failed to fetch statistics: ${errorMessages.join(', ')}`);
                }

                const productsData = (await productsRes.json()) as StatsResponse<ProductCount>;
                const usersData = (await usersRes.json()) as StatsResponse<UserCount>;
                const revenueData = (await revenueRes.json()) as StatsResponse<RevenueGrowth>;
                const userRegData = (await userRegRes.json()) as StatsResponse<MonthlyUser[]>;
                const monthlyRevData = (await monthlyRevRes.json()) as StatsResponse<MonthlyRevenue[]>;

                setProductCount(productsData.data.totalProducts);
                setActiveUsers(usersData.data.activeUsers);
                setRevenueGrowth(revenueData.data);
                setUserRegistrations(userRegData.data);
                setMonthlyRevenue(monthlyRevData.data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
                // setIsFirstLoad(false);
            }
        };

        fetchStats();
    }, []);

    // Memoize chart data transformations (must be before early returns)
    const userChartData = useMemo(() =>
        userRegistrations.map(item => ({
            name: `T${item.month}/${item.year}`,
            'Người dùng': item.count
        })),
        [userRegistrations]
    );

    const revenueChartData = useMemo(() =>
        monthlyRevenue.map(item => ({
            name: `T${item.month}/${item.year}`,
            'Doanh thu': item.revenue
        })),
        [monthlyRevenue]
    );

    if (loading) {
        return (
            <Spin fullscreen size="large" tip="Đang tải dữ liệu..." />
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Empty
                    description={`Lỗi: ${error}`}
                    style={{ marginTop: 50, marginBottom: 50 }}
                />
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Products Card */}
                <div className="animate-slideup-fade">
                    <Card
                        className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-blue-500"
                        hoverable
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Tổng Sản Phẩm</p>
                                <p className="text-3xl font-bold text-blue-600 mt-2">
                                    {productCount !== null && (
                                        <CountUp
                                            end={productCount}
                                            duration={2}
                                            separator=","
                                        />
                                    )}
                                </p>
                            </div>
                            <div className="bg-blue-100 p-4 rounded-full">
                                <ShoppingOutlined className="text-2xl text-blue-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Active Users Card */}
                <div className="animate-slideup-fade" style={{ animationDelay: '0.1s' }}>
                    <Card
                        className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-green-500"
                        hoverable
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Người Dùng Hoạt Động</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    {activeUsers !== null && (
                                        <CountUp
                                            end={activeUsers}
                                            duration={2}
                                            separator=","
                                        />
                                    )}
                                </p>
                            </div>
                            <div className="bg-green-100 p-4 rounded-full">
                                <UserOutlined className="text-2xl text-green-600" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Revenue Growth Card */}
                <div className="animate-slideup-fade" style={{ animationDelay: '0.2s' }}>
                    <Tooltip
                        title={
                            revenueGrowth ? (
                                <div className="text-sm">
                                    <div className="mb-1">
                                        <strong>Doanh thu tháng trước:</strong>{' '}
                                        {new Intl.NumberFormat('vi-VN').format(revenueGrowth.previousMonthRevenue)} VND
                                    </div>
                                    <div>
                                        <strong>Doanh thu tháng trước nữa:</strong>{' '}
                                        {new Intl.NumberFormat('vi-VN').format(revenueGrowth.twoMonthsAgoRevenue)} VND
                                    </div>
                                </div>
                            ) : null
                        }
                        placement="bottom"
                    >
                        <Card
                            className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-orange-500"
                            hoverable
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Tăng Trưởng Doanh Thu</p>
                                    <p className="text-3xl font-bold mt-2">
                                        {revenueGrowth && (
                                            <span
                                                className={
                                                    revenueGrowth.growthPercentage >= 0
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                }
                                            >
                                                <CountUp
                                                    end={revenueGrowth.growthPercentage}
                                                    duration={2}
                                                    decimals={2}
                                                    suffix="%"
                                                />
                                            </span>
                                        )}
                                    </p>

                                </div>
                                <div className="bg-orange-100 p-4 rounded-full">
                                    <DollarOutlined className="text-2xl text-orange-600" />
                                </div>
                            </div>
                        </Card>
                    </Tooltip>
                </div>
            </div>

            {/* Main Content Area (for future charts) */}
            <div className="grid grid-cols-1 gap-6">
                {/* User Registration Chart */}
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

                {/* Revenue Chart */}
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
            </div>
        </div>
    );
};

export default memo(DashboardPage);