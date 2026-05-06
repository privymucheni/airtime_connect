import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_FROM_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

interface RecipientSMS {
    name: string;
    phoneNumber: string;
    amount: number;
}

/**
 * Send individual SMS to each recipient with their specific airtime amount.
 * On a Twilio trial account, only verified phone numbers will receive the SMS.
 * As you verify more numbers in Twilio, those recipients will also get notified.
 */
export async function sendRecipientNotifications(
    recipients: RecipientSMS[],
    companyName: string,
    transactionId: string
) {
    if (!client || !fromPhoneNumber) {
        console.warn('Twilio not configured. Skipping SMS notifications.');
        return;
    }

    // Send SMS to each recipient in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        const results = await Promise.allSettled(
            batch.map(async (recipient) => {
                const message = await client.messages.create({
                    body: `Airtime Connect: Hi ${recipient.name}, you have received $${recipient.amount.toFixed(2)} airtime from ${companyName}. Transaction ID: ${transactionId}. Thank you!`,
                    from: fromPhoneNumber,
                    to: recipient.phoneNumber,
                });
                return message;
            })
        );

        results.forEach((result, index) => {
            const recipient = batch[index];
            if (result.status === 'fulfilled') {
                console.log(`SMS sent to ${recipient.name} (${recipient.phoneNumber}): ${result.value.sid}`);
            } else {
                console.error(`Failed to send SMS to ${recipient.name} (${recipient.phoneNumber}): ${result.reason}`);
            }
        });
    }
}



