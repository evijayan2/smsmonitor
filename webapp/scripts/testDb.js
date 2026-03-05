const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function main() {
    try {
        console.log("Connecting database...");
        const users = await prisma.user.findMany({ take: 1 });
        console.log("Users:", users);

        const messages = await prisma.smsMessage.findMany({ take: 1 });
        console.log("Messages:", messages);
    } catch (e) {
        console.error("DB Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
