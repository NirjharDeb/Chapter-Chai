import './SignInPage.css';

function SignInPage() {
  return (
    <div className="page">
        <div className='content'>
            <div className="titleCard">
                <h1 id="title">Chapter & Chai</h1>
                <p id="slogan">Discover, Read, Relax, Repeat</p>
            </div>
            <div className="form">
                <div className='enterFields'>
                    <p>Username</p>
                    <input />
                </div>
                <div className='enterFields'>
                    <p>Password</p>
                    <input />
                </div>
                <div><button>Sign In</button></div>
                <div><a href="https://www.freepik.com/free-vector/flat-world-book-day-background_23671585.htm#fromView=keyword&page=1&position=5&uuid=3b603e91-81cd-4c36-b532-0969b994bed0">New User?</a></div>
            </div>
        </div>
    </div>
  );
}

export default SignInPage;
