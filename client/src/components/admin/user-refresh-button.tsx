import { AuthorizationStatus, User } from "interfaces"
import { useRouter } from "next/router"
import { getUsers, isError } from "services/http-service"
import { faRefresh } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext } from "react"
import { AuthContext } from "components/auth/auth-context"

export const UserRefreshButton = ({ limit, onRefresh }: {
    limit: number, onRefresh(users: User[]): void
}) => {

    const router = useRouter();
    const authContext = useContext(AuthContext);

    const refreshUsers = async () => {
        const response = await getUsers(limit)
        
        if (isError(response)){
            if(response.authorized === false) {
                authContext.setAuthStatus({ status: AuthorizationStatus.UNAUTHORIZED })
                router.push('/auth/login')
            }

        }else {
            onRefresh(response.map((user: User) => ({...user, password: ""})))
        }

    }

    return (
        <button onClick={refreshUsers} className="userBtn btn btn-secondary">
            <FontAwesomeIcon icon={faRefresh} />
        </button>
    )
}