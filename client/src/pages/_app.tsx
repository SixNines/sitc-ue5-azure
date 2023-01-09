import "bootstrap/dist/css/bootstrap.css";
import "../../styles/globals.scss";
import type { AppProps } from "next/app";
import { AuthProvider } from "components/auth/auth-context";
import { NavBar } from "components/navbar";
import { ErrorBoundary } from "components/errors";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NavBar>
          <Component {...pageProps} />
        </NavBar>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
