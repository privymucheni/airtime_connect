const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const name = process.argv[2] || 'System Admin';
    const email = process.argv[3] || 'admin@airflow.com';
    const password = process.argv[4] || 'Admin@123';

    console.log(`Creating admin: ${name} (${email})...`);

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role: 'ADMIN',
                status: 'ACTIVE',
            },
            create: {
                name,
                email,
                password: hashedPassword,
                role: 'ADMIN',
                status: 'ACTIVE',
            },
        });

        console.log('✅ Admin user created/updated successfully:', user.email);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
