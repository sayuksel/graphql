export async function signIn (email: string, password: string) {
    const response = await fetch("api//auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    }); 

    if (!response.ok) {
        throw new Error("Invalid credentials");
    }
    const { token } = await response.json();
    localStorage.setItem("jwt", token);
}

export function signOut () {
    localStorage.removeItem("jwt");
}

export function getToken () {
    return localStorage.getItem("jwt");
}