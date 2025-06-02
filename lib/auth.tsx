export async function signIn(email: string, password: string) {
    const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Basic ${btoa(`${email}:${password}`)}`
        },
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