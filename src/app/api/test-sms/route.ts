import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_FROM_PHONE_NUMBER;

export async function POST(request: NextRequest) {
    try {
        // Validate Twilio credentials
        if (!accountSid || !authToken || !fromPhoneNumber) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Twilio credentials not configured',
                    details: {
                        accountSid: !!accountSid,
                        authToken: !!authToken,
                        fromPhoneNumber: !!fromPhoneNumber,
                    }
                },
                { status: 400 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { toPhoneNumber, message } = body;

        // Validate input
        if (!toPhoneNumber || !message) {
            return NextResponse.json(
                { success: false, error: 'Missing toPhoneNumber or message' },
                { status: 400 }
            );
        }

        // Create Twilio client
        const client = twilio(accountSid, authToken);

        // Send SMS
        console.log(`Sending SMS to ${toPhoneNumber}: ${message}`);
        const result = await client.messages.create({
            body: message,
            from: fromPhoneNumber,
            to: toPhoneNumber,
        });

        return NextResponse.json({
            success: true,
            message: 'SMS sent successfully',
            data: {
                messageSid: result.sid,
                status: result.status,
                to: result.to,
                from: result.from,
                body: result.body,
                dateCreated: result.dateCreated,
            }
        });

    } catch (error: any) {
        console.error('SMS sending error:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message,
                details: error.toString()
            },
            { status: 500 }
        );
    }
}

// GET endpoint to check Twilio configuration
export async function GET() {
    const configured = !!(accountSid && authToken && fromPhoneNumber);
    
    return NextResponse.json({
        twilioConfigured: configured,
        credentials: {
            accountSid: accountSid ? '✓ Set' : '✗ Not set',
            authToken: authToken ? '✓ Set' : '✗ Not set',
            fromPhoneNumber: fromPhoneNumber ? `✓ ${fromPhoneNumber}` : '✗ Not set',
        },
        instructions: configured ? 'Ready to send SMS' : 'Configure Twilio environment variables'
    });
}
