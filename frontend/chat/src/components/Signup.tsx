import { Link } from "react-router-dom";
import logo from "/logo.webp"
import { SubmitHandler, useForm } from "react-hook-form"


type FormFields = {
    username: string;
    password: string;
    rep_password: string;
}


const Signup = () => {

    const { register, watch ,handleSubmit, formState: { errors } } = useForm<FormFields>()


    //Submit Login Form
    const onSubmit: SubmitHandler<FormFields> = (data) => {
        console.log(data)
        // Ans Backend senden und was damit tun
    }


    return (
        <div className="flex justify-center items-center h-screen" >
            <div className="border rounded-md shadow-lg  md:h-2/3 md:w-2/3 flex md:flex-row flex-col ">
                
                {/* LOGO */}
                <div className=" w-1/2 text-center bg-red-100 ">
                    <img className="hidden md:block  w-full h-full object-cover" src={logo} />
                </div>
                
                {/* INPUT FÜR LOGIN */}
                <form onSubmit={handleSubmit(onSubmit)} className="md:w-1/2 w-screen md:h-auto h-screen text-center flex flex-col items-center justify-center ">
                    <p className="text-4xl p-4">Konto erstellen</p>

                    {/* USERNAME */}
                    <input {...register("username", {
                        required: "Username darf nicht leer sein"
                    })} type="text"
                        className="shadow-md border  w-2/3 p-4 m-2 rounded-md focus:outline-none focus:border-none
                        focus:ring focus:ring-customPink" placeholder="Username" />
                    {errors.username && <p className="text-sm text-customRed">{errors.username.message}</p>}

                    {/* PASSWORT */}
                    <input {...register("password", {
                        required: "Passwort darf nicht leer sein",
                        minLength: {
                            value: 6,
                            message: "Passwort muss mindestens aus 6 Zeichen bestehen"
                        }
                    })} type="password"
                        className="shadow-md border w-2/3 p-4 m-2 rounded-md focus:outline-none focus:border-none
                        focus:ring focus:ring-customPink    "
                        placeholder="Passwort" />
                    {errors.password && <p className="text-sm text-customRed">{errors.password.message}</p>}

                    {/* PASSWORT WIEDERHOLEN */}
                    <input {...register("rep_password", {
                        required: "Passwort darf nicht leer sein",
                        validate: value => value === watch("password") || "Passwörter stimmen nicht überein"
                    })} type="password"
                        className="shadow-md border w-2/3 p-4 m-2 rounded-md focus:outline-none focus:border-none
                        focus:ring focus:ring-customPink    "
                        placeholder="Passwort wiederholen" />
                    {errors.rep_password && <p className="text-sm text-customRed">{errors.rep_password.message}</p>}


                    <button type="submit" className="p-4 m-4 rounded-md bg-customPink"> <p className="text-customWhite">Erstellen</p> </button>
                    <Link to="/login"><p className="text-sm">Zum Login</p></Link>

                </form>
                
            </div>
        </div>
    )

}

export default Signup