import { InferGetServerSidePropsType } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import 'swagger-ui-react/swagger-ui.css';
import * as httpService from "../services/http-service";
import { useContext, useEffect } from 'react';
import { AuthContext } from 'components/auth/auth-context';
import { AuthorizationStatus } from 'interfaces';

const SwaggerUI = dynamic<{
    spec: any;
  }>(import('swagger-ui-react') as any, { ssr: false });


function ApiDoc({ apiSpec }: InferGetServerSidePropsType<typeof getServerSideProps>) {

  const router = useRouter();
  const authContext = useContext(AuthContext);
  const authState = authContext.authState.status;

  useEffect(() => {
    if (apiSpec.error){
      router.push({
        pathname: "/error/docs",
        query: {
          message: apiSpec.context as string
        }
      })
    }

    else if (authState !== AuthorizationStatus.DOCS){
      authContext.setAuthStatus({
        status: AuthorizationStatus.DOCS
      })
    }
  }, [])

  return (
    <div className="docsContainer">
      <SwaggerUI spec={apiSpec} />
    </div>
  )
}
  

export async function getServerSideProps() {
    const apiSpec = await httpService.getOpenApiSpec() 

    return {
      props: {
        apiSpec,
      },
    };
  };

export default ApiDoc