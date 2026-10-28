import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../Auth/auth.guard.js";
import { CustomerService } from "./customer.service.js";
import { CustomerCreationDto } from "./dto/createCustomer.dto.js";
import { CustomerUpdateDto } from "./dto/updateCustomer.dto.js";



@Controller('api/customer')
export class CustomerController {


    constructor (
        private readonly customerService: CustomerService
    ) { }

    // POST /api/customer — creates a customer from { fullName, email, phoneNumber, address }.
    // Requires a logged-in user; email or phone already used by another customer → 409.
    @UseGuards(AuthGuard)
    @Post()
    async createCustomer ( @Body() data: CustomerCreationDto ) {

        return await this.customerService.createCustomer(data);
    }

    // GET /api/customer — returns every customer (active and inactive), newest first.
    // Always an array: [] when there is no customer yet.
    @UseGuards(AuthGuard)
    @Get()
    async retrieveCustomers ( ) {

        return await this.customerService.listCustomers();
    }

    // GET /api/customer/:id — returns one customer (used by the customer edit page).
    // 404 if the id doesn't exist; must stay below the fixed GET routes.
    @UseGuards(AuthGuard)
    @Get(':id')
    async retrieveCustomer ( @Param('id', ParseIntPipe) id: number ) {

        return await this.customerService.retrieveById(id);
    }

    // PATCH /api/customer/:id — partial update: only the fields sent change (incl. isActive).
    // Also used by the on/off button in the customers list; returns the customer unchanged if nothing changed.
    @UseGuards(AuthGuard)
    @Patch(':id')
    async modifyCustomer ( @Param('id', ParseIntPipe) id: number, @Body() data: CustomerUpdateDto ) {

        return await this.customerService.modifyCustomer(id, data);
    }

}
