import { useRouter } from "next/router"
import { ErrorPage } from "components/errors/error-page"
import { useEffect } from "react";


const Error = () => {

    const router = useRouter();
    const { error, message } = router.query;

    console.log(router.query)

    useEffect(() => {
        if (!error){

            router.push("/")
        }
    }, [router])

    return (
        <div>
            <ErrorPage error={message as string} />
        </div>
    )

}

export default Error