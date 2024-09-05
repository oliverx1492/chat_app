import { Link } from "react-router-dom";
import logo from "/logo.webp"
import { SubmitHandler, useForm } from "react-hook-form"


type FormFields = {
    username: string;
    password: string;
}


const Login = () => {

    const { register, handleSubmit, formState: { errors } } = useForm<FormFields>()


    //Submit Login Form
    const onSubmit: SubmitHandler<FormFields> = (data) => {
        console.log(data)
        // Ans Backend senden und was damit tun
    }


    return (
        <div className="flex justify-center items-center h-screen" >
            <div className="border rounded-md shadow-lg  md:h-2/3 md:w-2/3 flex md:flex-row flex-col ">
                {/* INPUT FÜR LOGIN */}
                <form onSubmit={handleSubmit(onSubmit)} className="md:w-1/2 w-screen md:h-auto h-screen text-center flex flex-col items-center justify-center ">
                    <p className="text-4xl p-4">Login</p>


                    <input {...register("username", {
                        required: "Username darf nicht leer sein"
                    })} type="text"
                        className="shadow-md border  w-2/3 p-4 m-4 rounded-md focus:outline-none focus:border-none
                        focus:ring focus:ring-customPink" placeholder="Username" />
                    {errors.username && <p className="text-sm text-customRed">{errors.username.message}</p>}

                    <input {...register("password", {
                        required: "Passwort darf nicht leer sein"
                    })} type="password"
                        className="shadow-md border w-2/3 p-4 m-4 rounded-md focus:outline-none focus:border-none
                        focus:ring focus:ring-customPink    "
                        placeholder="Passwort" />
                    {errors.password && <p className="text-sm text-customRed">{errors.password.message}</p>}

                    <button type="submit" className="p-4 m-4 rounded-md bg-customPink"> <p className="text-customWhite">Anmelden</p> </button>
                    <Link to="/signup"><p className="text-sm">Konto erstellen</p></Link>

                </form>
                {/* LOGO */}
                <div className=" w-1/2 text-center bg-red-100 ">
                    <img className="hidden md:block  w-full h-full object-cover" src={logo} />
                </div>
            </div>
        </div>
    )

}

export default Login