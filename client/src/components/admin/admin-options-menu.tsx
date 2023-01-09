import { AdminMenuOptions } from "interfaces"
import { useRouter } from "next/router"

export const AdminOptionsMenu = ({ 
    selectedOption, 
    setAdminOptions 
}: { 
    selectedOption: AdminMenuOptions,
    setAdminOptions(option: AdminMenuOptions): void
}) => {

    const router = useRouter()

    return (
        <div className="adminOptionsMenu">
            <button 
                className={`btn btn-secondary adminMenuBtn ${AdminMenuOptions.USER_MENU === selectedOption ? 'adminMenuBtnSelected' : ''}`}
                onClick={() => setAdminOptions(AdminMenuOptions.USER_MENU)}
            >
                Users
            </button>
            <button 
                className={`btn btn-secondary adminMenuBtn ${AdminMenuOptions.HOME === selectedOption ? 'adminMenuBtnSelected' : ''}`}
                onClick={() => {
                    setAdminOptions(AdminMenuOptions.HOME)
                    router.push("/")
                }}
            >
                Back
            </button>
        </div>
    )
}