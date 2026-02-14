import React, { useMemo } from 'react';
import { useSalesStore } from '../store/useSalesStore';
import { useProductStore } from '../store/useProductStore';
import { DollarSign, ShoppingBag, TrendingUp, Package } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Dashboard: React.FC = () => {
    const { sales } = useSalesStore();
    const { products } = useProductStore();

    const stats = useMemo(() => {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalSales = sales.length;
        const totalProducts = products.length;
        const lowStock = products.filter(p => p.stock < 10).length;

        return { totalRevenue, totalSales, totalProducts, lowStock };
    }, [sales, products]);

    const recentSales = sales.slice(0, 5);

    const chartData = useMemo(() => {
        // Group sales by date (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => {
            const daySales = sales.filter(s => s.date.startsWith(date));
            return {
                date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                revenue: daySales.reduce((sum, s) => sum + s.total, 0),
                sales: daySales.length
            };
        });
    }, [sales]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500">Overview of your supermarket performance.</p>
                </div>
                <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">${stats.totalRevenue.toFixed(2)}</h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <DollarSign size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Sales</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalSales}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShoppingBag size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-purple-200 transition-all">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Total Products</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalProducts}</h3>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Package size={24} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-amber-200 transition-all">
                    <div>
                        <p className="text-slate-500 text-sm font-medium">Low Stock Items</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.lowStock}</h3>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TrendingUp size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Overview</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Sales</h3>
                    <div className="space-y-4">
                        {recentSales.map((sale) => (
                            <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                                        ${Math.floor(sale.total)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        <p className="text-xs text-slate-500">{sale.items.length} items</p>
                                    </div>
                                </div>
                                <span className="font-bold text-emerald-600">+${sale.total.toFixed(2)}</span>
                            </div>
                        ))}
                        {recentSales.length === 0 && (
                            <div className="text-center py-8 text-slate-400">
                                No recent sales
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
