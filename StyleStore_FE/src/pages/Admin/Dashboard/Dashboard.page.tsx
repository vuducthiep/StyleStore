import { useEffect, useState, useMemo, memo } from 'react';
import { Spin, Empty } from 'antd';
import './Dashboard.css';
import { getAuthToken } from '../../../services/auth';
import RevenueTimeCard from './components/RevenueTimeCard';
import StockCategoryChart from './components/StockCategoryChart';
import UserRegistrationChart from './components/UserRegistrationChart';
import RevenueChart from './components/RevenueChart';
import StatsCards from './components/StatsCards';

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

interface StockCategory {
    categoryId: number;
    categoryName: string;
    totalStock: number;
}

interface TotalStockResponse {
    totalStock: number;
    categories: StockCategory[];
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
    const [totalStock, setTotalStock] = useState<TotalStockResponse | null>(null);
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
                const [productsRes, usersRes, revenueRes, userRegRes, monthlyRevRes, totalStockRes] = await Promise.all([
                    fetch('http://localhost:8080/api/admin/stats/products/count', { headers }),
                    fetch('http://localhost:8080/api/admin/stats/users/active-count', { headers }),
                    fetch('http://localhost:8080/api/admin/stats/revenue/recent-month-growth', { headers }),
                    fetch('http://localhost:8080/api/admin/stats/monthly-user-registrations', { headers }),
                    fetch('http://localhost:8080/api/admin/stats/revenue/monthly-recent', { headers }),
                    fetch('http://localhost:8080/api/admin/stats/products/total-stock', { headers }),
                ]);

                console.log('Response status:', productsRes.status, usersRes.status, revenueRes.status, userRegRes.status, monthlyRevRes.status, totalStockRes.status);

                if (!productsRes.ok || !usersRes.ok || !revenueRes.ok || !userRegRes.ok || !monthlyRevRes.ok || !totalStockRes.ok) {
                    const errorMessages = [];
                    if (!productsRes.ok) errorMessages.push(`Products: ${productsRes.status}`);
                    if (!usersRes.ok) errorMessages.push(`Users: ${usersRes.status}`);
                    if (!revenueRes.ok) errorMessages.push(`Revenue: ${revenueRes.status}`);
                    if (!userRegRes.ok) errorMessages.push(`UserReg: ${userRegRes.status}`);
                    if (!monthlyRevRes.ok) errorMessages.push(`MonthlyRev: ${monthlyRevRes.status}`);
                    if (!totalStockRes.ok) errorMessages.push(`TotalStock: ${totalStockRes.status}`);
                    throw new Error(`Failed to fetch statistics: ${errorMessages.join(', ')}`);
                }

                const productsData = (await productsRes.json()) as StatsResponse<ProductCount>;
                const usersData = (await usersRes.json()) as StatsResponse<UserCount>;
                const revenueData = (await revenueRes.json()) as StatsResponse<RevenueGrowth>;
                const userRegData = (await userRegRes.json()) as StatsResponse<MonthlyUser[]>;
                const monthlyRevData = (await monthlyRevRes.json()) as StatsResponse<MonthlyRevenue[]>;
                const totalStockData = (await totalStockRes.json()) as StatsResponse<TotalStockResponse>;

                setProductCount(productsData.data.totalProducts);
                setActiveUsers(usersData.data.activeUsers);
                setRevenueGrowth(revenueData.data);
                setUserRegistrations(userRegData.data);
                setMonthlyRevenue(monthlyRevData.data);
                setTotalStock(totalStockData.data);
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

    const stockCategoryData = useMemo(() =>
        totalStock?.categories.map(item => ({
            name: item.categoryName,
            value: item.totalStock
        })) ?? [],
        [totalStock]
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
            <StatsCards
                productCount={productCount}
                activeUsers={activeUsers}
                revenueGrowth={revenueGrowth}
                totalStock={totalStock?.totalStock ?? null}
            />

            {/* Main Content Area (for future charts) */}
            <div className="grid grid-cols-1 gap-6">
                <StockCategoryChart
                    stockCategoryData={stockCategoryData}
                    totalStock={totalStock?.totalStock ?? null}
                />

                <RevenueTimeCard />

                <UserRegistrationChart userChartData={userChartData} />

                <RevenueChart revenueChartData={revenueChartData} />
            </div>
        </div>
    );
};

export default memo(DashboardPage);