import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { db } from "../prisma/db.js";
import { CustomerCreationDto } from "./dto/createCustomer.dto.js";
import { CustomerUpdateDto } from "./dto/updateCustomer.dto.js";



@Injectable()
export class CustomerService {


    // The Customer table has no unique constraint, so duplicates are checked here:
    // two customers can't share the same email or the same phone number.
    // `exceptId` skips the customer being edited (it may keep its own email / phone).
    private async assertNotTaken ( email?: string, phoneNumber?: string, exceptId?: number ) {
        if (email !== undefined) {
            const sameEmail = await db.orm.public.Customer.where({ email }).first();
            if (sameEmail && sameEmail.id !== exceptId) {
                throw new ConflictException(`A customer with this email already exists !`);
            }
        }

        if (phoneNumber !== undefined) {
            const samePhone = await db.orm.public.Customer.where({ phoneNumber }).first();
            if (samePhone && samePhone.id !== exceptId) {
                throw new ConflictException(`A customer with this phone number already exists !`);
            }
        }
    }


    async createCustomer ( data: CustomerCreationDto ) {
        const email = data.email.trim().toLowerCase();
        const phoneNumber = data.phoneNumber.trim();

        await this.assertNotTaken(email, phoneNumber);

        const customer = await db.orm.public.Customer.create({
            fullName: data.fullName.trim(),
            email,
            phoneNumber,
            address: data.address.trim(),
        });

        return customer;
    }


    // Always returns an array (empty when there is no customer yet), newest first.
    async listCustomers ( ) {
        const customers = await db.orm.public.Customer.all();

        return [...customers].sort((a, b) => b.id - a.id);
    }


    async retrieveById ( customerId: number ) {
        const customer = await db.orm.public.Customer.where({
            id: customerId
        }).first();

        if (!customer) {
            throw new NotFoundException(`Customer Not Found !`);
        }

        return customer;
    }


    async modifyCustomer ( customerId: number, data: CustomerUpdateDto ) {
        const customer = await this.retrieveById(customerId);

        const email = data.email?.trim().toLowerCase();
        const phoneNumber = data.phoneNumber?.trim();

        // Only keep the fields that were sent AND are different from what is stored.
        const updatedObject = {
            ...(data.fullName !== undefined && data.fullName.trim() !== customer.fullName && {
                fullName: data.fullName.trim(),
            }),
            ...(email !== undefined && email !== customer.email && {
                email,
            }),
            ...(phoneNumber !== undefined && phoneNumber !== customer.phoneNumber && {
                phoneNumber,
            }),
            ...(data.address !== undefined && data.address.trim() !== customer.address && {
                address: data.address.trim(),
            }),
            ...(data.isActive !== undefined && data.isActive !== customer.isActive && {
                isActive: data.isActive,
            }),
        };

        if ( !Object.keys(updatedObject).length ) {
            return customer;
        }

        await this.assertNotTaken(updatedObject.email, updatedObject.phoneNumber, customerId);

        const updatedCustomer = await db.orm.public.Customer.where({
            id: customerId
        }).update(updatedObject);

        return updatedCustomer;
    }

}
