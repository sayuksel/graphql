import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    console.log("Received request for sign-in");
    const { email, password } = await request.json();

    if (email === "user@example.com" && password === "password123") {
        const token = "jwt-token";
        return NextResponse.json({ token });
    }

    return NextResponse.json(
        { error : "Invalid credentials" },
        { status: 401 }
    );
}