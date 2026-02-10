import { Card, Tooltip } from 'antd';
import { ShoppingOutlined, UserOutlined, DollarOutlined } from '@ant-design/icons';
import CountUp from 'react-countup';

interface RevenueGrowth {
    currentMonth: number;
    currentYear: number;
    previousMonthRevenue: number;
    twoMonthsAgoRevenue: number;
    growthAmount: number;
    growthPercentage: number;
}

interface StatsCardsProps {
    productCount: number | null;
    activeUsers: number | null;
    revenueGrowth: RevenueGrowth | null;
    totalStock: number | null;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN');

const StatsCards = ({ productCount, activeUsers, revenueGrowth, totalStock }: StatsCardsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="animate-slideup-fade h-full">
                <Card
                    className="stat-card shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-blue-500"
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

            <div className="animate-slideup-fade h-full" style={{ animationDelay: '0.1s' }}>
                <Card
                    className="stat-card shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-green-500"
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

            <div className="animate-slideup-fade h-full" style={{ animationDelay: '0.2s' }}>
                <Tooltip
                    title={
                        revenueGrowth ? (
                            <div className="text-sm">
                                <div className="mb-1">
                                    <strong>Doanh thu tháng trước:</strong>{' '}
                                    {CURRENCY_FORMATTER.format(revenueGrowth.previousMonthRevenue)} VND
                                </div>
                                <div>
                                    <strong>Doanh thu tháng trước nữa:</strong>{' '}
                                    {CURRENCY_FORMATTER.format(revenueGrowth.twoMonthsAgoRevenue)} VND
                                </div>
                            </div>
                        ) : null
                    }
                    placement="bottom"
                >
                    <Card
                        className="stat-card shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-orange-500"
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

            <div className="animate-slideup-fade h-full" style={{ animationDelay: '0.3s' }}>
                <Card
                    className="stat-card shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-purple-500"
                    hoverable
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Tổng Tồn Kho</p>
                            <p className="text-3xl font-bold text-purple-600 mt-2">
                                {totalStock !== null && (
                                    <CountUp
                                        end={totalStock}
                                        duration={2}
                                        separator=","
                                    />
                                )}
                            </p>
                        </div>
                        <div className="bg-purple-100 p-4 rounded-full">
                            <ShoppingOutlined className="text-2xl text-purple-600" />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default StatsCards;
