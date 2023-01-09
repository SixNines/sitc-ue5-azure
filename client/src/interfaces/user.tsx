export interface User {
    id?: number
    userName: string
    role: string
}

export interface NewUser extends User {
    password: string
}

export interface UpdatedUser extends NewUser {
    updatedUserName: string
}

export interface AuthorizingUser {
    userName: string
    password: string
}