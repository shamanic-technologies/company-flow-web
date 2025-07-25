import { User } from "@clerk/nextjs/server";

export function getUserEmail(user: User): string {
    const userEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId)?.emailAddress;
    if (!userEmail) {
        throw new Error('User email not found');
    }
    return userEmail;
}

export function getUserName(user: User): string {
    const userName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    if (!userName) {
        throw new Error('User name not found');
    }
    return userName;
}