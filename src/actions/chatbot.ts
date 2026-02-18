"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getChatQuestions(parentId: string | null = null) {
    try {
        const questions = await prisma.chatBotQuestion.findMany({
            where: {
                parentId: parentId,
            },
            include: {
                _count: {
                    select: { subQuestions: true },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });
        return questions;
    } catch (error) {
        console.error("Error fetching chat questions:", error);
        return [];
    }
}

export async function addChatQuestion(data: {
    question: string;
    answer?: string;
    parentId?: string | null;
}) {
    try {
        const newQuestion = await prisma.chatBotQuestion.create({
            data: {
                question: data.question,
                answer: data.answer,
                parentId: data.parentId,
            },
        });
        revalidatePath("/admin/chatbot");
        return { success: true, data: newQuestion };
    } catch (error) {
        console.error("Error adding chat question:", error);
        return { success: false, error: "Failed to add question" };
    }
}

export async function updateChatQuestion(
    id: string,
    data: {
        question: string;
        answer?: string;
    }
) {
    try {
        const updated = await prisma.chatBotQuestion.update({
            where: { id },
            data: {
                question: data.question,
                answer: data.answer,
            },
        });
        revalidatePath("/admin/chatbot");
        return { success: true, data: updated };
    } catch (error) {
        console.error("Error updating chat question:", error);
        return { success: false, error: "Failed to update question" };
    }
}

export async function deleteChatQuestion(id: string) {
    try {
        await prisma.chatBotQuestion.delete({
            where: { id },
        });
        revalidatePath("/admin/chatbot");
        return { success: true };
    } catch (error) {
        console.error("Error deleting chat question:", error);
        return { success: false, error: "Failed to delete question" };
    }
}

export async function getQuestionWithDetails(id: string) {
    try {
        const question = await prisma.chatBotQuestion.findUnique({
            where: { id },
            include: {
                subQuestions: true,
            },
        });
        return question;
    } catch (error) {
        console.error("Error fetching question details:", error);
        return null;
    }
}
