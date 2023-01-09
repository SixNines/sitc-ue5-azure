
import { IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const UserCardButton = ({ icon, userIdx, onClick }: {
    icon: IconDefinition,
    userIdx: number,
    onClick(): void
}) => {

    const onCardButtonClick = () => {
        let element =  document.getElementById(`user-card-hook-${userIdx}`)
        if (element){
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest', 
                inline: 'start'
            })
        }
        else {
            element =  document.getElementById(`user-card-btn-${userIdx}`)
            element?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest', 
                inline: 'start'
            })
        }
        

        onClick()
    }

    return (
        <button 
            id={`user-card-btn-${userIdx}`}
            onClick={onCardButtonClick} 
            className="userBtn btn btn-secondary"
        >
            <FontAwesomeIcon icon={icon} />
        </button>
    )
}