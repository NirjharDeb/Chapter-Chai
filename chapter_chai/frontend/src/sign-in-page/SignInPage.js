import { useState } from 'react';
import './SignInPage.css';
import { redirect } from 'react-router-dom';

function SignInPage() {

    // toggle for sign-in/create account
    // true: signing in
    // false: creating account
    const [sign_in, setSignIn] = useState(true);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const checkAuth = async () => {
        const response = await fetch("/auth/check", {
            credentials: "include",
            method: "GET",
            headers: {"Content-Type": "application/json"}
        });
        const data = await response.json();
        if (response.ok) {
            console.log("Authenticated:", data);
        } else {
            console.error("NOT authenticated:", data);
        }
    };

    const handleSubmit = async () => {

        const apiURL = sign_in ? "/auth/login" : "/auth/register";
        
        const response = await fetch(apiURL, {
            credentials: "include",
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password})
        });

        const data = await response.json();
        if (response.ok) {
            console.log(data);
            // alert(sign_in ? "Sign-in successful!" : "Account created!");

            await checkAuth();
            const resp = redirect("/map");
            console.log(resp);
        } else {
            console.error(data);
            alert("Error: " + data.message);
        }
    };

    return (
        <div className="sign-in-page">
            <div className='sign-in-content'>
                <div id="title-card">
                    <h1 id="title">Chapter & Chai</h1>
                    <p id="slogan">Discover, Read, Relax, Repeat</p>
                </div>
                <div className="form">
                    <div className='enter-fields'>
                        <p className='enter-text'>Username</p>
                        <input id='username-field'
                            placeholder='Username'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className='enter-fields'>
                        <p className='enter-text'>Password</p>
                        <input id='password-field'
                        type='password'
                            placeholder='Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button id='submit-button' onClick={handleSubmit}>{sign_in ? "Sign In" : "Create Account"}</button>
                    <div>
                        <button id='toggle-button' onClick={() => setSignIn(!sign_in)}>{sign_in ? "New User?" : "Returning User?"}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignInPage;
