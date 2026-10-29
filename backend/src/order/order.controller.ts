import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { AuthGuard } from "../Auth/auth.guard.js";
import { OrderCreationDto } from "./dto/createOrder.dto.js";
import { DecantOperationQueryDto, OrderListQueryDto } from "./dto/listOrders.dto.js";
import { InventoryService } from "./inventory.service.js";
import { DashboardService } from "./dashboard.service.js";
import { OrderService, type ActingUser } from "./order.service.js";


interface AuthenticatedRequest extends Request {
    user: ActingUser;
}


// Both OWNER and EMPLOYEE can create, confirm, deliver and cancel PENDING orders.
// Cancelling a COMFIRMED order (which puts used stock back) is OWNER-only: enforced in OrderService.
@Controller('api/order')
@UseGuards(AuthGuard)
export class OrderController {


    constructor (
        private readonly orderService: OrderService
    ) { }

    // GET /api/order/session — who is logged in (id, username, role), so the UI can show the right actions.
    @Get('session')
    session ( @Req() request: AuthenticatedRequest ) {

        return request.user;
    }

    // GET /api/order/availability — per active perfume: sealed bottles and millilitres available to sell now
    // (physical minus reserved). Informative for the order form; the backend re-checks on creation.
    @Get('availability')
    async availability ( ) {

        return await this.orderService.availability();
    }

    // POST /api/order — creates an order and reserves ALL its stock in one transaction.
    // 409 "Insufficient Stock" with one message per line that can't be covered; nothing is reserved then.
    @Post()
    async createOrder ( @Body() data: OrderCreationDto, @Req() request: AuthenticatedRequest ) {

        return await this.orderService.createOrder(data, request.user);
    }

    // GET /api/order — every order, newest first, with customer, creator and total.
    // Filters (query string): status, from, to (ISO dates), search (order id, customer name or phone).
    @Get()
    async listOrders ( @Query() query: OrderListQueryDto ) {

        return await this.orderService.listOrders(query);
    }

    // GET /api/order/:id — one order with its items, reservations (stock source + amount) and decant operations.
    @Get(':id')
    async getOrder ( @Param('id', ParseIntPipe) id: number ) {

        return await this.orderService.getOrder(id);
    }

    // POST /api/order/:id/confirm — PENDING → COMFIRMED: deducts the reserved stock exactly once
    // and records one CONSUMPTION operation per decant bottle used. 409 if not PENDING.
    @Post(':id/confirm')
    @HttpCode(200)
    async confirmOrder ( @Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest ) {

        return await this.orderService.confirmOrder(id, request.user);
    }

    // POST /api/order/:id/cancel — PENDING: releases the reservations.
    // COMFIRMED (owner only): returns the stock and records REVERSAL operations. 409 otherwise.
    @Post(':id/cancel')
    @HttpCode(200)
    async cancelOrder ( @Param('id', ParseIntPipe) id: number, @Req() request: AuthenticatedRequest ) {

        return await this.orderService.cancelOrder(id, request.user);
    }

    // POST /api/order/:id/deliver — COMFIRMED → DELIVERD. Stock is NOT deducted again. 409 otherwise.
    @Post(':id/deliver')
    @HttpCode(200)
    async deliverOrder ( @Param('id', ParseIntPipe) id: number ) {

        return await this.orderService.deliverOrder(id);
    }

}


@Controller('api')
@UseGuards(AuthGuard)
export class InventoryController {


    constructor (
        private readonly inventoryService: InventoryService,
        private readonly dashboardService: DashboardService,
    ) { }

    // GET /api/dashboard/stats — the dashboard home figures, computed from live data:
    // catalog counts, stock (sealed / reserved / available, decant ml), orders by status,
    // revenue (confirmed + delivered), customers, perfumes out of stock and the 5 latest orders.
    @Get('dashboard/stats')
    async dashboardStats ( ) {

        return await this.dashboardService.stats();
    }

    // GET /api/inventory — batches (original / sealed / reserved / available bottles) and opened bottles
    // (initial / remaining / reserved / available ml) with their active reservations and latest operations.
    @Get('inventory')
    async overview ( ) {

        return await this.inventoryService.overview();
    }

    // GET /api/inventory/reservations — every reservation still holding stock (status RESERVED).
    @Get('inventory/reservations')
    async activeReservations ( ) {

        return await this.inventoryService.activeReservations();
    }

    // GET /api/decant-operation — decant operation history, newest first.
    // Filters: type (CONSUMPTION / REVERSAL), bottleId, orderId, parfumId. Operations are created by
    // order confirmation / cancellation only: there is no manual "create operation" endpoint.
    @Get('decant-operation')
    async decantOperations ( @Query() query: DecantOperationQueryDto ) {

        return await this.inventoryService.decantOperations(query);
    }

}
