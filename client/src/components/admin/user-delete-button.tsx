import { deleteUser } from "services/http-service"
import { faCancel } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const UserDeleteButton = ({ userName, userIdx, onDelete }: {
    userName: string, 
    userIdx: number,
    onDelete(userIdx: number): void
}) => {


    const deleteSelectedUser = async () => {
        await deleteUser(userName)
        onDelete(userIdx)
    }

    return (
        <button
            className="deleteBtn btn btn-secondary"
            onClick={deleteSelectedUser}
        >   
            <p className="deleteBtnTxt">Delete User</p>
            <FontAwesomeIcon icon={faCancel} />
        </button>
    )
}