import { Injectable } from "@nestjs/common";
import { db } from "../prisma/db.js";


// Low stock: no sealed bottle to sell and not even one 20 ml decant left.
const LOW_DECANT_ML = 20;

// Figures for the dashboard home page, all computed from the live data.
@Injectable()
export class DashboardService {


    async stats ( ) {
        const [parfums, brands, customers, orders, recentOrders] = await Promise.all([
            db.orm.public.Parfum
                .include('brand', (brand) => brand.select('name', 'image'))
                .include('stockBatch', (batches) => batches.select('unusedQuantity', 'reservedQuantity'))
                .include('decantBottles', (bottles) => bottles
                    .where((bottle) => bottle.isActive.eq(true))
                    .select('remainingVolumeMl', 'reservedVolumeMl'))
                .all(),
            db.orm.public.Brand.select('id', 'isActive').all(),
            db.orm.public.Customer.select('id', 'isActive').all(),
            db.orm.public.Order
                .select('id', 'status', 'deliveryPrice', 'verifiedAt')
                .include('orderItems', (items) => items.sum('totalPrice'))
                .all(),
            db.orm.public.Order
                .select('id', 'status', 'deliveryPrice', 'pendingAt')
                .include('customer', (customer) => customer.select('fullName'))
                .include('orderItems', (items) => items.sum('totalPrice'))
                .orderBy((order) => order.id.desc())
                .limit(5)
                .all(),
        ]);

        // ── Stock, per perfume then summed ──
        const perPerfume = parfums.map((parfum) => {
            const sealed = parfum.stockBatch.reduce((sum, batch) => sum + batch.unusedQuantity, 0);
            const reservedBottles = parfum.stockBatch.reduce((sum, batch) => sum + batch.reservedQuantity, 0);
            const remainingMl = parfum.decantBottles.reduce((sum, bottle) => sum + bottle.remainingVolumeMl, 0);
            const reservedMl = parfum.decantBottles.reduce((sum, bottle) => sum + bottle.reservedVolumeMl, 0);
            return {
                id: parfum.id,
                name: parfum.name,
                isActive: parfum.isActive,
                brand: parfum.brand,
                sealed,
                reservedBottles,
                availableBottles: Math.max(sealed - reservedBottles, 0),
                remainingMl,
                availableMl: Math.max(remainingMl - reservedMl, 0),
                openBottles: parfum.decantBottles.length,
            };
        });

        const sum = <K extends keyof (typeof perPerfume)[number]>(key: K) =>
            perPerfume.reduce((total, row) => total + (row[key] as number), 0);

        // ── Orders + revenue (confirmed or delivered orders, items + delivery fee) ──
        const orderTotal = (order: { deliveryPrice: number | null; orderItems: number | null }) =>
            (order.orderItems ?? 0) + (order.deliveryPrice ?? 0);

        const byStatus = { PENDING: 0, COMFIRMED: 0, DELIVERD: 0, CANCELLED: 0 } as Record<string, number>;
        let revenue = 0;
        let revenueThisMonth = 0;
        let pendingValue = 0;

        const now = new Date();
        const monthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);

        for (const order of orders) {
            byStatus[order.status] = (byStatus[order.status] ?? 0) + 1;
            const total = orderTotal(order);

            if (order.status === 'PENDING') pendingValue += total;
            if (order.status === 'COMFIRMED' || order.status === 'DELIVERD') {
                revenue += total;
                if (order.verifiedAt && new Date(String(order.verifiedAt)).getTime() >= monthStart) {
                    revenueThisMonth += total;
                }
            }
        }

        // Active perfumes that can't be sold right now (neither as a bottle nor as a 20 ml decant).
        const lowStock = perPerfume
            .filter((row) => row.isActive && row.availableBottles === 0 && row.availableMl < LOW_DECANT_ML)
            .map(({ id, name, brand, availableBottles, availableMl }) => ({ id, name, brand, availableBottles, availableMl }))
            .slice(0, 6);

        return {
            catalog: {
                perfumes: parfums.length,
                activePerfumes: parfums.filter((parfum) => parfum.isActive).length,
                brands: brands.length,
                activeBrands: brands.filter((brand) => brand.isActive).length,
            },
            stock: {
                sealedBottles: sum('sealed'),
                reservedBottles: sum('reservedBottles'),
                availableBottles: sum('availableBottles'),
                openBottles: sum('openBottles'),
                remainingMl: sum('remainingMl'),
                availableMl: sum('availableMl'),
            },
            orders: {
                total: orders.length,
                byStatus,
                pendingValue,
            },
            revenue: {
                total: revenue,
                thisMonth: revenueThisMonth,
            },
            customers: {
                total: customers.length,
                active: customers.filter((customer) => customer.isActive).length,
            },
            lowStock,
            recentOrders: recentOrders.map((order) => ({
                id: order.id,
                status: order.status,
                pendingAt: order.pendingAt,
                customer: order.customer?.fullName ?? null,
                total: orderTotal(order),
            })),
        };
    }

}
