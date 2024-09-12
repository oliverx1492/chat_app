import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { SubmitHandler, useForm } from "react-hook-form"


const Home = () => {

    //Für Typescript User interface
    interface User  {
        username: string;
        password: string;
    }

    interface Chat {
        id: number;
        username: string;
    }

    type FormFields = {
        id: number,
        message: string
    }


    const navigate = useNavigate()
    const link:string = "http://localhost:3000"

    const [allUsers, setAllUsers] = useState<User[]>([])
    const [chat, setChat] = useState<Chat>()

    const { register, handleSubmit } = useForm<FormFields>()

    // useeffect chekt beim laden der seite ob eine id vorhanden ist (dh ob ein user angemeldet ist)
    // falls nicht wird zum login weitergeleitet
    useEffect(() => {

        const id = localStorage.getItem("id")

        if (id) {
            console.log("User ist bereits angemeldet, userID: ", id)

            //UserData werden geladen
            getUserData()
        }

        else {
            navigate("/login")
        }

    }, [])

    //funktion um den benutzer abzumelden
    const logout = () => {
        localStorage.removeItem("id")
        window.location.reload()
    }

    //Alle Userdaten bekommen
    const getUserData = async () => {
        try {
            const response = await fetch(`${link}/allUsers`)
            const data = await response.json()
            
            const filteredUserData = data.data.filter((user: any) => user.id != parseInt(localStorage.getItem("id") || "0"))
          
            setAllUsers(filteredUserData)
        }   

        catch(error) {
            console.error(error)
        }
    }

    //Nachricht senden
    const onSubmit = async (data: any) => {

        console.log(data)
        console.log("Nachricht: ", data.message)
        console.log("Sender ID: ", parseInt(localStorage.getItem("id") || "0"))
        console.log("Sender Username: ", localStorage.getItem("username"))
        console.log("Receiver ID: ", chat?.id )
        console.log("Receiver Username: ", chat?.username)
        const timestampISO = new Date().toISOString();
        console.log("TIMEstamp :", timestampISO); 

        const chatObject = {
            "senderid": parseInt(localStorage.getItem("id") || "0"),
            "senderusername": localStorage.getItem("username"),
            "receiverid": chat?.id,
            "receiverusername": chat?.username,
            "time_stamp": timestampISO,
            "message": data.message
        }

        console.log(chatObject)

         // Eine neue ChatID wird erstellt falls kein Chat zwischen den beiden Nuztern angezeigt wird
        // id wird zurückgegeben

        try {
            const response = await fetch(`${link}/newChat`, {
                method: "POST",
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(chatObject)
            })

            const data = await response.json();

            if (response.ok) {
                
                console.log( data.message)


            }
            else {
                console.log("Fehler aufgetreten: ", data.message)
                

            }
        }

        catch(error) {
            console.error(error)
        }

    }

    //chat öffnen und in data sind die userinfos erhalten
    const openChat = async (data: any) => {

       
        console.log(data)
        setChat(data)

        //Hier wird dann eine Funktion kommen die die Nachrichten aus dem Backend fultern kann damit nur
        //die jenigen angezeig werden die mit dem User interagiert haben
    }

    useEffect( ()=> {
        console.log("CHAT: ", chat)
    },[chat] )



    return (




        <div className="flex h-screen">

            <div className="w-1/5 flex flex-col items-center">
                
                <button onClick={logout} className="bg-customPink m-4 p-4 rounded-md">Log out</button>
                    <ul>
                        {allUsers && allUsers.map( (item, index) => (
                            <p onClick={()=>openChat(item)} className="pp-4 m-4 cursor-pointer" key={index}>{item.username}</p>
                        ) )}
                    </ul>
            </div >
            <div className="w-4/5 ">
                {/* NACHRICHTEN */}
             
                <div className="h-5/6 border m-4 p-4 overflow-y-scroll">
                        {chat && <p>Alle Nachrichten an {chat.username} mit der userID {chat.id}</p>}
                </div>
                {/* INPUT */}
                {chat && <form onSubmit={handleSubmit(onSubmit)} className="flex flex-row w-full justify-center items-center">
                    <input {...register("message", {
                        required: true
                    })} className="shadow-md border w-2/3 p-4 m-2 rounded-md focus:outline-none focus:border-none
                        focus:ring focus:ring-customPink" type="text" placeholder="Nachricht eingeben" />
                    <button type="submit" className="bg-customPink m-4 p-4 rounded-md">Senden</button>
                </form>}
            </div>


        </div>

    )

}


export default Home