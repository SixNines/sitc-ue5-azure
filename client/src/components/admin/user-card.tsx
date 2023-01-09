import { User } from 'interfaces'
import { useState } from 'react'
import { UserEditCard } from './user-edit-card'
import { UserViewCard } from './user-view-card'
import { faPencil, faEye } from '@fortawesome/free-solid-svg-icons'
import { UserCardButton } from './user-card-button'
import { UserDeleteButton } from './user-delete-button'
import { Card } from 'react-bootstrap'
import { UserDashboardStatus } from 'interfaces'


export const UserCard = ({ 
    user, 
    userIdx, 
    dashboardStatus, 
    setDashboardStatus, 
    onUpdate, 
    onDelete
}: {
    user: User, 
    userIdx: number,
    dashboardStatus: UserDashboardStatus, 
    onUpdate(updatedUser: User, userIdx: number): void,
    onDelete(userIdx: number): void,
    setDashboardStatus(dashboardStatus: UserDashboardStatus): void,
}) => {

    const [cardType, setCardType] = useState("VIEW")
    return (
        <Card className="card shadow-sm bg-dark text-color userCard">
            <div className="userCardContainer">
                <div className='row userCardButtons'>
                    <div className='container userCardButtonsRow'>
                    {
                        cardType === "VIEW" ? 
                        <UserCardButton 
                            icon={faPencil} 
                            userIdx={userIdx}
                            onClick={() => setCardType("EDIT")}
                        /> 
                        : 
                        <UserCardButton 
                            icon={faEye}
                            userIdx={userIdx}
                            onClick={() => setCardType("VIEW")}
                        />
                    }
                    {
                        user.id === null || user.id === undefined ? 
                        null
                        :
                        <UserDeleteButton 
                            userName={user.userName}
                            userIdx={userIdx}
                            onDelete={onDelete}
                        /> 
                    }
                    </div>
                </div>
                <div className='row userCardRow'>
                {
                    cardType === "VIEW" ?
                    <UserViewCard 
                        user={user} 
                        userIdx={userIdx}
                    />
                    :
                    <UserEditCard 
                        user={user}
                        userIdx={userIdx}
                        dashboardStatus={dashboardStatus} 
                        setDashboardStatus={setDashboardStatus}
                        onSubmit={(updatedUser: User, userIdx: number) => {
                            onUpdate(updatedUser, userIdx)
                            setCardType("VIEW")
                            setDashboardStatus(UserDashboardStatus.READY)
                        }} 
                    />
                }
                <div id={`user-card-hook-${userIdx}`}></div>
                </div>
            </div>
        </Card>
    )
}