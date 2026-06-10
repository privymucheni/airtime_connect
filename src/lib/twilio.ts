import twilio from 'twilio';

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
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhoneNumber = process.env.TWILIO_FROM_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhoneNumber) {
        console.warn('⚠️ Twilio not configured. Skipping SMS notifications.');
        console.warn(`Missing: ${!accountSid ? 'TWILIO_ACCOUNT_SID ' : ''}${!authToken ? 'TWILIO_AUTH_TOKEN ' : ''}${!fromPhoneNumber ? 'TWILIO_FROM_PHONE_NUMBER' : ''}`);
        return { successCount: 0, failureCount: recipients.length, total: recipients.length };
    }

    const client = twilio(accountSid, authToken);

    console.log(`📱 Starting SMS batch send: ${recipients.length} recipients, Transaction: ${transactionId}`);

    // Send SMS to each recipient in batches to avoid rate limits
    const batchSize = 10;
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        console.log(`📤 Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(recipients.length / batchSize)}: Sending to ${batch.length} recipients`);

        const results = await Promise.allSettled(
            batch.map(async (recipient) => {
                const message = await client.messages.create({
                    body: `Airtime Connect: Hi ${recipient.name}, ${companyName} has sent you monthly airtime amounting to ${recipient.amount.toFixed(2)} american dollars. Ref ${transactionId}`,
                    from: fromPhoneNumber,
                    to: recipient.phoneNumber,
                });
                return message;
            })
        );

        results.forEach((result, index) => {
            const recipient = batch[index];
            if (result.status === 'fulfilled') {
                successCount++;
                console.log(`✓ SMS sent to ${recipient.name} (${recipient.phoneNumber}) - SID: ${result.value.sid}`);
            } else {
                failureCount++;
                const error = result.reason;
                console.error(`✗ Failed to send SMS to ${recipient.name} (${recipient.phoneNumber})`);
                console.error(`  Error: ${error.message || error}`);
                if (error.code) console.error(`  Code: ${error.code}`);
            }
        });
    }

    console.log(`📊 SMS batch complete: ${successCount} sent, ${failureCount} failed out of ${recipients.length} total`);
    return { successCount, failureCount, total: recipients.length };
}



