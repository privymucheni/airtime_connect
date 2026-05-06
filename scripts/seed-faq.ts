import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding FAQs...');
    const faqPath = path.join(process.cwd(), 'data/faq.json');
    const faqData = JSON.parse(fs.readFileSync(faqPath, 'utf-8'));

    // Clear existing questions first
    await prisma.chatBotQuestion.deleteMany();

    // Group by category
    const categories = Array.from(new Set(faqData.map((item: any) => item.category)));

    for (const category of categories) {
        // Create category (top level question)
        const parentQuestion = await prisma.chatBotQuestion.create({
            data: {
                question: category as string,
                answer: 'Please select a topic:', // A generic answer for a category
            }
        });

        const categoryQuestions = faqData.filter((item: any) => item.category === category);

        // Add sub questions
        for (const item of categoryQuestions) {
            await prisma.chatBotQuestion.create({
                data: {
                    question: item.customer_question,
                    answer: item.chatbot_answer,
                    parentId: parentQuestion.id,
                }
            });
        }
    }

    console.log('Successfully seeded FAQs!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
