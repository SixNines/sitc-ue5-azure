import { authorize, checkAuthToken } from "services/http-service";
import { Form, Card } from "react-bootstrap";
import { useState, useContext, FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "components/auth/auth-context";
import { Footer } from "components/footer";

const Login = () => {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const [userName, updateUserName] = useState("");
  const [password, updatePassword] = useState("");
  const [loginStatus, updateLoginStatus] = useState({
    state: "INITIALIZED",
    message: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { authorized } = await checkAuthToken();
      if (authorized) {
        router.push("/");
      } else {
        updateLoginStatus({
          state: "READY",
          message: "",
        });
      }
    };

    checkAuth();
  }, [router]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity()) {
      updateLoginStatus({
        state: "WAITING",
        message: "Please wait...",
      });

      const authorizationResponse = await authorize({
        userName,
        password,
      });

      if (authorizationResponse.authorized === false) {
        updateLoginStatus({
          state: "FAILED",
          message: authorizationResponse.message as string,
        });
      } else {
        authContext.setAuthToken({});
        updateLoginStatus({
          state: "SUCCEEDED",
          message: `Welcome ${userName}!`,
        });

        router.push("/");
      }
    }
  };

  return loginStatus.state === "INITIALIZED" ? (
    <div></div>
  ) : (
    <div className="loginPage">
      <Form className="login-container container" onSubmit={login}>
        <div className="main-title row">
          <h1>Studio in the Cloud with Unreal Engine 5</h1>
          <h3>Game Development Demo</h3>
        </div>
        <div className="row">
          <Card className="card shadow-sm bg-dark text-color auth-card col-md-8 mx-auto">
            <div className="card-header auth-card-header">
              <h2>Log into your account</h2>
            </div>
            <div className="card-body">
              <label>Username</label>
              <Form.Control
                type="text"
                name="userName"
                className="form-control background-color"
                id="userName"
                aria-describedby="userNameHelp"
                placeholder="Enter your username"
                required={true}
                value={userName}
                disabled={loginStatus.state === "WAITING"}
                onChange={(e: { target: { value: string } }) =>
                  updateUserName(e.target.value)
                }
              />
              <label>Password</label>
              <Form.Control
                type="password"
                name="password"
                className="form-control background-color"
                id="password"
                aria-describedby="passwordHelp"
                placeholder="Enter your password"
                required={true}
                value={password}
                disabled={loginStatus.state === "WAITING"}
                onChange={(e: { target: { value: string } }) =>
                  updatePassword(e.target.value)
                }
              />
            </div>
            <button
              type="submit"
              className="btn btn-success"
              disabled={loginStatus.state === "WAITING"}
            >
              Login
            </button>
            {loginStatus.state !== "READY" ? (
              <div className="loginStatusText">{`${loginStatus.message}`}</div>
            ) : null}
          </Card>
        </div>
      </Form>
      <Footer></Footer>
    </div>
  );
};

export default Login;
