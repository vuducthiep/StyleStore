import { useEffect, useState } from 'react';
import { Card, DatePicker, Radio } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { getAuthToken } from '../../../../services/auth';

interface StatsResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

const REVENUE_FORMATTER = new Intl.NumberFormat('vi-VN');

const RevenueTimeCard = () => {
    const [revenueMode, setRevenueMode] = useState<'day' | 'month' | 'year'>('day');
    const [revenueDate, setRevenueDate] = useState<Dayjs | null>(dayjs());
    const [revenueMonth, setRevenueMonth] = useState<Dayjs | null>(dayjs());
    const [revenueYear, setRevenueYear] = useState<Dayjs | null>(dayjs());
    const [revenueValue, setRevenueValue] = useState<number | null>(null);
    const [revenueLoading, setRevenueLoading] = useState(false);
    const [revenueError, setRevenueError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                setRevenueLoading(true);
                setRevenueError(null);

                const token = getAuthToken();
                if (!token) {
                    throw new Error('No authentication token found. Please log in again.');
                }

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                };

                let url = '';
                if (revenueMode === 'day') {
                    if (!revenueDate) return;
                    url = `http://localhost:8080/api/admin/stats/revenue/by-date?date=${revenueDate.format('YYYY-MM-DD')}`;
                }

                if (revenueMode === 'month') {
                    if (!revenueMonth) return;
                    url = `http://localhost:8080/api/admin/stats/revenue/by-month?year=${revenueMonth.year()}&month=${revenueMonth.month() + 1}`;
                }

                if (revenueMode === 'year') {
                    if (!revenueYear) return;
                    url = `http://localhost:8080/api/admin/stats/revenue/by-year?year=${revenueYear.year()}`;
                }

                const response = await fetch(url, { headers });
                if (!response.ok) {
                    throw new Error(`Failed to fetch revenue: ${response.status}`);
                }

                const revenueData = (await response.json()) as StatsResponse<number>;
                setRevenueValue(revenueData.data);
            } catch (err) {
                setRevenueError(err instanceof Error ? err.message : 'An error occurred');
                setRevenueValue(null);
            } finally {
                setRevenueLoading(false);
            }
        };

        fetchRevenue();
    }, [revenueMode, revenueDate, revenueMonth, revenueYear]);

    return (
        <Card title="Doanh Thu Theo Thời Gian" className="shadow-lg">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <Radio.Group
                    value={revenueMode}
                    onChange={(event) => setRevenueMode(event.target.value)}
                >
                    <Radio.Button value="day">Ngày</Radio.Button>
                    <Radio.Button value="month">Tháng</Radio.Button>
                    <Radio.Button value="year">Năm</Radio.Button>
                </Radio.Group>

                <div className="flex flex-wrap items-center gap-3">
                    {revenueMode === 'day' && (
                        <DatePicker
                            value={revenueDate}
                            onChange={setRevenueDate}
                            format="DD/MM/YYYY"
                        />
                    )}

                    {revenueMode === 'month' && (
                        <DatePicker
                            picker="month"
                            value={revenueMonth}
                            onChange={setRevenueMonth}
                            format="MM/YYYY"
                        />
                    )}

                    {revenueMode === 'year' && (
                        <DatePicker
                            picker="year"
                            value={revenueYear}
                            onChange={setRevenueYear}
                            format="YYYY"
                        />
                    )}
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
                <div className="text-sm text-gray-500">Doanh thu</div>
                <div className="text-3xl font-semibold text-emerald-600">
                    {revenueLoading && <span>Dang tai...</span>}
                    {!revenueLoading && revenueError && <span className="text-red-600">{revenueError}</span>}
                    {!revenueLoading && !revenueError && (
                        <span>{REVENUE_FORMATTER.format(revenueValue ?? 0)} VND</span>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default RevenueTimeCard;
