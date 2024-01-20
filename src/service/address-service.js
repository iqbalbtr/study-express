import { prisma } from "../../prisma/index.js"
import { ResponseError } from "../errors/response-error.js"
import { createAddresValidation, updateAddresValidation } from "../validation/address-validation.js"
import { getContactValidation } from "../validation/contact-validation.js"
import { validate } from "../validation/index.js"

const existingContact = async (userData, req) => {
    const contactId = validate(getContactValidation, req)

    const queryContact = await prisma.contact.findFirst({
        where: {
            id: contactId,
            userId: userData.userId
        }
    })

    if (!queryContact) {
        throw new ResponseError(404, "Contact is not found")
    }

    return queryContact
}

const create = async (userData, contactId, req) => {

    const address = validate(createAddresValidation, req)
    const contact = await existingContact(userData, contactId)

    address.postal_code = +address.postal_code
    address.contactId = contact.id

    const createContact = await prisma.address.create({
        data: address,
        select: {
            city: true,
            province: true,
            postal_code: true,
            street: true,
            country: true,
            id: true
        }
    })


    return createContact
}

const update = async (contactId, req) => {

    const address = validate(updateAddresValidation, req)
    const contact = await existingContact(req.id, contactId)

    const countAddress = await prisma.address.count({
        where: {
            id: address.id
        }
    })

    if (countAddress < 1) {
        throw new ResponseError(404, "Address not found")
    }

    const updateAddress = await prisma.address.update({
        where: {
            id: req.id,
            contactId: contact.id
        },
        data: {
            city: address.city,
            country: address.country,
            postal_code: +address.postal_code,
            province: address.province,
            street: address.street
        }
    })

    return updateAddress
}

const remove = async (contactId, addresId) => {
    
    const address = validate(getContactValidation, addresId)
    const contact = validate(getContactValidation, contactId)

    const countAddress = await prisma.address.count({
        where: {
            id: address,
            contactId: contact
        }
    })

    if (countAddress < 1) {
        throw new ResponseError(404, "Address not found")
    }

    await prisma.address.delete({
        where: {
            id: address
        }
    })

    return
}

const list = async(req) => {
    const contactId = validate(getContactValidation, req)
    
    return prisma.contact.findFirst({
        where: {
            id: contactId
        },
        select: {
            email: true,
            first_name: true,
            last_name: true,
            phone: true,
            address: true
        }
    })
}


export default {
    create,
    update,
    remove,
    list
}