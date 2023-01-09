import { FormInput, FormSelect } from "components/forms";
import { UpdatedUser, User } from "interfaces";
import { FormEvent, useState } from "react";
import { Form } from "react-bootstrap";
import { updateUser, createUser, isError } from "services/http-service";
import { UserDashboardStatus } from "interfaces";


export const UserEditCard = ({ 
    user, 
    userIdx, 
    dashboardStatus, 
    setDashboardStatus,
    onSubmit 
}: {
    user: User, 
    userIdx: number,
    dashboardStatus: UserDashboardStatus, 
    setDashboardStatus(dashboardStatus: UserDashboardStatus): void,
    onSubmit(updatedUser: User, userIdx: number): void
}) => {

    const roleOptions = [{
        label: "Administrator",
        value: "ADMIN",
        description: "Administrator"
    }, {
        label: "Developer",
        value: "DEV",
        description: "Developer"
    }]
    const [selectedUser, updateSelectedUser] = useState<UpdatedUser>({
        ...user,
        role: user.role,
        password: "",
        updatedUserName: user.userName
    })

    const submitUpdatedUser = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;

        setDashboardStatus(UserDashboardStatus.PROCESSING)
        
        if (form.checkValidity()){
            let userData: User = {
                userName: selectedUser.updatedUserName,
                role: selectedUser.role
            }
            if (!user.id) {
                const response = await createUser({
                    userName: selectedUser.updatedUserName,
                    password: selectedUser.password,
                    role: selectedUser.role
                })

                if (!isError(response)){
                    userData.id = response.id
                }
    
            }
            else {
                await updateUser(selectedUser)
            }
    
            onSubmit({
                id: userData.id,
                userName: userData.userName,
                role: userData.role
            }, userIdx)  
        }      
    }

    return (
        <div className="container userEditCard">
            <Form onSubmit={submitUpdatedUser} className="userEditForm">
                <div className="card-body userCardBody">
                    <div className="row">
                        <FormInput 
                            inputType="text"
                            value={selectedUser.updatedUserName}
                            name="username"
                            onChange={(value) => updateSelectedUser({
                                ...selectedUser,
                                updatedUserName: value
                            })}
                            options={{
                                className: "form-control",
                                disabled: dashboardStatus === UserDashboardStatus.PROCESSING
                            }}
                        />
                    </div>
                    <div className="row">
                        <FormInput 
                            inputType="password"
                            value={selectedUser.password}
                            name="password"
                            onChange={(value) => updateSelectedUser({
                                ...selectedUser,
                                password: value
                            })}
                            options={{
                                className: "form-control",
                                disabled: dashboardStatus === UserDashboardStatus.PROCESSING
                            }}
                        />
                    </div>
                    <div className="row">
                        <FormSelect 
                            value={selectedUser.role}
                            selectOptions={roleOptions}
                            name="role"
                            onChange={(value) => updateSelectedUser({
                                ...selectedUser,
                                role: value
                            })}
                            options={{
                                className: "form-control",
                                disabled: dashboardStatus === UserDashboardStatus.PROCESSING
                            }}
                        />
                    </div>
                    <div className="row saveUserBtnContainer">
                        <button 
                            id={`user-card-save-${userIdx}`}
                            type="submit" 
                            className="btn btn-success saveUserBtn"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </Form>
        </div>
    )
}