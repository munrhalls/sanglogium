"use server"

export async function processMockCheckout() {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { success: true }
}