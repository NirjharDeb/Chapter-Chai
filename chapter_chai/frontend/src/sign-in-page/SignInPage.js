import { useState } from 'react';
import './SignInPage.css';

function SignInPage() {

    const [sign_in, setSignIn] = useState(true); // toggle for sign-in/create account
    // TODO: toggle button and link values based on sign_in

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = () => {
        // (console logs used in debugging for now)

        // TODO: take username and password and send to backend?
        console.log("username:", username)
        console.log("password:", password)

        // TODO: also send whether its sign-in or create account?
        if (sign_in) {
            console.log("signing in");
        } else {
            console.log("create new account");
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
