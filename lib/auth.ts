export async function signIn(email: string, password: string) {
    // Fix: Remove double slash and use correct endpoint
    const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            // Use Basic authentication as specified in the requirements
            "Authorization": `Basic ${btoa(`${email}:${password}`)}`
        },
        // Remove body since we're using Basic auth
    }); 

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Invalid credentials");
    }
    
    const { token } = await response.json();
    localStorage.setItem("jwt", token);
}

export function signOut() {
    localStorage.removeItem("jwt");
}

export function getToken() {
    return localStorage.getItem("jwt");
}