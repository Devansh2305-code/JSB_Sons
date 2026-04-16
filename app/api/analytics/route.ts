import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req.headers.get('authorization'));
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const range = req.nextUrl.searchParams.get('range') || '30'; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(range));

    const orders = await Order.find({ createdAt: { $gte: daysAgo } });

    // Revenue by day
    const revenueMap: Record<string, number> = {};
    const ordersMap: Record<string, number> = {};
    let totalRevenue = 0;
    let totalOrders = 0;
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};

    for (const order of orders) {
      if (order.status === 'cancelled') continue;
      const date = new Date(order.createdAt).toLocaleDateString('en-IN');
      revenueMap[date] = (revenueMap[date] || 0) + order.totalAmount;
      ordersMap[date] = (ordersMap[date] || 0) + 1;
      totalRevenue += order.totalAmount;
      totalOrders++;

      for (const item of order.items) {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.name, qty: 0, revenue: 0 };
        }
        productSales[item.productId].qty += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      }
    }

    const dailyRevenue = Object.entries(revenueMap).map(([date, revenue]) => ({
      date,
      revenue,
      orders: ordersMap[date] || 0,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const statusCounts = {
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      dailyRevenue,
      topProducts,
      statusCounts,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
