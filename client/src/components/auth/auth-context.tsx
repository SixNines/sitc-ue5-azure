import { createContext, useState } from "react";
import { AuthorizationStatus } from "interfaces";

const AuthContext = createContext({
    authState: { 
        token: "",
        status: AuthorizationStatus.UNAUTHORIZED, 
    },
    setAuthToken: ({ token, refreshToken }: {token?: string, refreshToken?: string}) => ({
      token,
      refreshToken
    }),
    setAuthStatus: ({ status }: {status: AuthorizationStatus}) => status,
    resetToken: (): void => undefined,
});

const { Provider } = AuthContext;

const AuthProvider = ({ children }: {children: JSX.Element}) => {

    const [authToken, setToken] = useState<{token: string, refreshToken: string }>({ token: "", refreshToken: "" });
    const [authState, setAuthState] = useState<AuthorizationStatus>(AuthorizationStatus.UNAUTHORIZED);

    const setAuthToken = ({ token, refreshToken }: {token?: string, refreshToken?: string}) => {
        token = sessionStorage.getItem("X-Auth-Token") ?? token ?? "";
        refreshToken = sessionStorage.getItem("X-Refresh-Token") ?? token ?? "";
        setToken({ token, refreshToken });

        return ({
          token,
          refreshToken
        })
    };

    const setAuthStatus = ({ status }: {status: AuthorizationStatus}) => {
      setAuthState(status) 
      return status
    }

    const resetToken = () => {
      sessionStorage.removeItem('X-Auth-Token')
      sessionStorage.removeItem('X-Refresh-Token')
      setToken({token: "", refreshToken: ""})
    }

 return (
   <Provider
     value={{
      authState: {
        ...authToken,
        status: authState
      },
      resetToken,
      setAuthToken,
      setAuthStatus
    }}
   >
    {children}
   </Provider>
 );
};

export { AuthContext, AuthProvider };