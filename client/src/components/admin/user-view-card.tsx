import { User } from "interfaces"

export const UserViewCard = ({ user, userIdx }: {user: User, userIdx: number}) => {
    return (
        <div className="userViewCard" id={`user-card-title-${userIdx}`}>
            <h2 className="userNameHeader">{user.userName}</h2>
            <p className="userRole">{user.role}</p>
        </div>
    )
}