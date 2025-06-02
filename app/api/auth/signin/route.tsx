import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return NextResponse.json(
                { error: "Missing authorization header" },
                { status: 401 }
            );
        }

        const base64Credentials = authHeader.substring(6);
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [identifier, password] = credentials.split(':');

        if (!identifier || !password) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Authenticate with platform
        const platformResponse = await fetch('https://learn.reboot01.com/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${base64Credentials}`,
                'Content-Type': 'application/json'
            }
        });

        if (!platformResponse.ok) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Get JWT token
        let token: string;
        
        try {
            const responseData = await platformResponse.json();
            
            if (typeof responseData === 'string') {
                token = responseData.trim();
            } else if (responseData.token) {
                token = responseData.token.trim();
            } else if (responseData.access_token) {
                token = responseData.access_token.trim();
            } else {
                return NextResponse.json(
                    { error: "Unexpected response format" },
                    { status: 500 }
                );
            }
        } catch (jsonError) {
            const responseText = await platformResponse.text();
            token = responseText.trim();
        }
        
        if (!token) {
            return NextResponse.json(
                { error: "No token received" },
                { status: 500 }
            );
        }

        // Validate JWT format
        const jwtParts = token.split('.');
        if (jwtParts.length !== 3) {
            return NextResponse.json(
                { error: "Invalid token format" },
                { status: 500 }
            );
        }

        return NextResponse.json({ token });

    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json(
            { error: "Authentication failed" },
            { status: 500 }
        );
    }
}