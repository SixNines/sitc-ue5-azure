import { faAdd } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { User } from 'interfaces'

export const UserCreateButton = ({ usersCount, onCreate }: {usersCount: number, onCreate(newUser: User): void}) => {

    const createUser = async () => onCreate({
        userName: `NewUser${usersCount}`,
        role: "DEV"
    })

    return (
        <button onClick={createUser} className="userCreateBtn btn btn-secondary">
            Add User <FontAwesomeIcon icon={faAdd} />
        </button>
    )
} 