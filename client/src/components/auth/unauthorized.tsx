
import { SignIn } from './sign-in'


export const Unauthorized = () => {

    return (
        <div>
            <SignIn />
            <h4 className='unauthorizedText'>
                {
                    `Oops! It looks like you don't have those permissions!
                    Please sign in or contact an administrator.`
                }
            </h4> 
        </div>
    )
}
