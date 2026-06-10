'use client';

import React, { useState } from 'react';

export default function TestSMSUIPage() {
    const [toPhoneNumber, setToPhoneNumber] = useState('+263787279158');
    const [message, setMessage] = useState('Test SMS from Airtime Connect');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/test-sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ toPhoneNumber, message }),
            });

            const data = await res.json();
            setResult({
                status: res.status,
                ok: res.ok,
                data,
            });
        } catch (error: any) {
            setResult({
                error: error.message || error,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2>Twilio SMS Tester</h2>
            <p>Use this form to test sending SMS and diagnose connection/account issues.</p>
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>To Phone Number:</label>
                    <input
                        type="text"
                        value={toPhoneNumber}
                        onChange={(e) => setToPhoneNumber(e.target.value)}
                        style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
                        required
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Message:</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '100px' }}
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '12px',
                        fontSize: '16px',
                        backgroundColor: '#4C6EF5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                    }}
                >
                    {loading ? 'Sending...' : 'Send Test SMS'}
                </button>
            </form>

            {result && (
                <div style={{ marginTop: '30px' }}>
                    <h3>Result:</h3>
                    <pre
                        style={{
                            background: '#f4f4f4',
                            padding: '15px',
                            borderRadius: '4px',
                            overflowX: 'auto',
                            border: result.ok ? '1px solid #d4edda' : '1px solid #f8d7da',
                            color: result.ok ? '#155724' : '#721c24',
                        }}
                    >
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
