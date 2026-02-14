import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Settings, LogOut } from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: ShoppingCart, label: 'POS', path: '/pos' },
        { icon: Package, label: 'Inventory', path: '/inventory' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    SuperMarket
                </h1>
                <p className="text-slate-400 text-sm mt-1">Management System</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={clsx(
                            'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                            location.pathname === item.path
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        )}
                    >
                        <item.icon
                            size={20}
                            className={clsx(
                                'transition-colors duration-200',
                                location.pathname === item.path ? 'text-emerald-400' : 'group-hover:text-white'
                            )}
                        />
                        <span className="font-medium">{item.label}</span>
                        {location.pathname === item.path && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                        )}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group">
                    <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
