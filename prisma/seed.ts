const { PrismaClient, UserRole, UserStatus } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const adminPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@telecom.com' },
        update: {},
        create: {
            email: 'admin@telecom.com',
            name: 'System Administrator',
            password: adminPassword,
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
            balance: 0,
        },
    });

    console.log({ admin });

    // Create a mock company
    const companyPassword = await bcrypt.hash('company123', 10);
    const company = await prisma.user.upsert({
        where: { email: 'finance@acme.com' },
        update: {},
        create: {
            email: 'finance@acme.com',
            name: 'Acme Finance',
            companyName: 'Acme Corporation',
            password: companyPassword,
            role: UserRole.COMPANY,
            status: UserStatus.ACTIVE,
            balance: 25000,
        },
    });

    console.log({ company });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
