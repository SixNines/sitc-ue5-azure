import { useRouter } from "next/router";

export const SignIn = () =>  {
    const router = useRouter();
    const login = () => router.push("/auth/login")

    return (
        <div className="signInBtnContainer">
            <button 
                className="signInBtn btn btn-secondary"
                onClick={login}
            >
                Sign In
            </button>
        </div>
    )
}