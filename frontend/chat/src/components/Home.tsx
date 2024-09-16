import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { io, Socket } from "socket.io-client"



const Home = () => {


    const link: string = "https://chat-app-backend-q7zq.onrender.com"
    const socket: Socket = io("https://chat-app-backend-q7zq.onrender.com")

    //Für Typescript User interface
    interface User {
        username: string;
        password: string;
    }

    interface Chat {
        id: number;
        username: string;
    }

    // Nachrichtentyp
    interface ChatMessage {
        message: string;
        senderid: number;
        senderusername: string;
        receiverid: number;
        receiverusername: string;
        time_stamp: string;
    }

    type FormFields = {
        id: number,
        message: string
    }


    const navigate = useNavigate()


    const [allUsers, setAllUsers] = useState<User[]>([])
    const [chat, setChat] = useState<Chat>()

    const { register, handleSubmit } = useForm<FormFields>()

    //const [message, setMessage] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [allChat, setAllChat] = useState<ChatMessage[]>([])
    const chatEndRef = useRef<HTMLDivElement | null>(null);  // Referenz für das Ende des Chat-Verlaufs



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

        //Nachrichten vom Backend hören
        socket.on("chat message", (msg) => {
            setChatHistory((prevHistory) => [...prevHistory, msg])
        })

        // Cleanup: Event-Listener entfernen, wenn die Komponente unmounted wird
        return () => {
            socket.off('chat message');
        };



    }, [])

    //  // Scrollt automatisch ans Ende des Chat-Verlaufs, wenn sich chatHistory ändert
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    //funktion um den benutzer abzumelden
    const logout = () => {
        localStorage.removeItem("id")
        localStorage.removeItem("username")
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

        catch (error) {
            console.error(error)
        }
    }

    //Nachricht senden
    const onSubmit = async (data: any) => {

        console.log(data)
        console.log("Nachricht: ", data.message)
        console.log("Sender ID: ", parseInt(localStorage.getItem("id") || "0"))
        console.log("Sender Username: ", localStorage.getItem("username"))
        console.log("Receiver ID: ", chat?.id)
        console.log("Receiver Username: ", chat?.username)

        const ts = Date.now()
        const date = new Date(ts)
        const timestampISO = date.toLocaleString()
        console.log("TIMEstamp :", timestampISO);
        console.log(typeof (timestampISO))

        const chatObject = {
            "senderid": parseInt(localStorage.getItem("id") || "0"),
            "senderusername": localStorage.getItem("username"),
            "receiverid": chat?.id,
            "receiverusername": chat?.username,
            "time_stamp": timestampISO,
            "message": data.message
        }

        console.log(chatObject)

        //mit socket io gesendet
        console.log("Socket io gesendet")


        if (data.message) {


            const msg: ChatMessage = {
                message: data.message,
                senderid: parseInt(localStorage.getItem("id") || "0"),
                senderusername: localStorage.getItem("username") || "unbekannter user",
                receiverid: chat?.id || 0,
                receiverusername: chat?.username || "unbekannter user",
                time_stamp: timestampISO
            }

            socket.emit("chat message", msg)

        }



    }

    //chat öffnen und in data sind die userinfos erhalten
    const openChat = async (data: any) => {

        setView("hidden md:block")
        setChatHistory([])
        console.log(data)
        setChat(data)
        const recID = data.id
        const userID = parseInt(localStorage.getItem("id") || "0")
        //Hier wird dann eine Funktion kommen die die Nachrichten aus dem Backend fultern kann damit nur
        //die jenigen angezeig werden die mit dem User interagiert haben
        console.log(recID, userID)

        try {
            const response = await fetch(`${link}/openChat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ recID, userID })
            })

            const data = await response.json()
            if (response.ok) {
                console.log("DMD: ", data.message)
                setAllChat(data.message)
            }

            else {
                console.log("Fehler aufgetreten: ", data)
            }
        }

        catch (error) {
            console.log(error)
        }


    }

    useEffect(() => {
        console.log("CHAT: ", chat)
    }, [chat])


    //Ändert die ansicht wenn Mobile
    const [view, setView] = useState("hidden md:block")

    const changeView = () => {
        if (view == "hidden md:block") {
            setView("block md:block")
        }
        else {
            setView("hidden md:block")
        }
    }


    return (




        <div className="flex flex-col md:flex-row h-screen">

            <div className="md:w-1/5 flex flex-col items-center md:border rounded-md m-4 p-4">
                <svg onClick={changeView} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"
                    className="size-6 block md:hidden">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                <button onClick={logout} className="bg-customPink m-4 p-4 rounded-md shadow-md">Abmelden</button>
                <ul className={view}>
                    {allUsers && allUsers.map((item, index) => (
                        <div key={index}>
                            <p onClick={() => openChat(item)} className="p-4 m-4 cursor-pointer rounded-md" >{item.username}</p>
                            <hr />
                        </div>
                    ))}
                </ul>
            </div >

            <div className="w-4/5 ">
                {/* NACHRICHTEN */}


                <div className="md:h-5/6 md:w-auto w-screen md:m-4 md:p-4 overflow-y-scroll ">
                    {chat && <p className="text-3xl p-2 shadow-md flex justify-center items-center">{chat.username}</p>}

                    {allChat && allChat.map((item, index) => (



                        <div className="" key={index}>

                            {/* Wenn chat id ungleich receiver id ist, ist die nachricht von mir und somit rechts  */}
                            {chat?.id == item.receiverid

                                ?
                                <div className="flex flex-col items-end justify-center ">


                                    <div className=
                                        "p-4 mt-4 mr-4 ml-4 bg-customPink w-1/2 flex flex-col justify-center rounded-md max-w-100 break-words max-w-full"

                                    >
                                        <p className="">{item.message}</p>

                                    </div>
                                    <p className="text-xs pl-8 pr-8">{item.time_stamp}</p>
                                </div>

                                // Dieser Chat ist von meinem Chatpartner und somir links zu finde
                                :
                                <div key={index} className="flex flex-col justify-center items-start">
                                    <div className=
                                        "p-4 mt-4 mr-4 ml-4 bg-customPink w-1/2 flex flex-col justify-center rounded-md max-w-100 break-words max-w-full"

                                    >

                                        <p className="">{item.message}</p>


                                    </div>
                                    <p className="text-xs pl-8 pr-8">{item.time_stamp}</p>
                                </div>}


                        </div>
                    ))}

                    {chatHistory.map((item, index) => (
                        <div key={index}>

                            {chat?.id == item.receiverid 
                            ?
                            <div key={index} className="flex flex-col justify-center items-end">



                            <div className="p-4 mr-4 ml-4 mt-4 bg-customPink w-1/2 flex flex-col justify-center rounded-md max-w-100 break-words max-w-full" >
                                <p className="">{item.message}</p>

                            </div>
                            <p className="text-xs pr-8">{item.time_stamp}</p>
                        </div>

                        :
                        <div key={index} className="flex flex-col justify-center items-start">



                        <div className="p-4 mr-4 ml-4 mt-4 bg-customPink w-1/2 flex flex-col justify-center rounded-md max-w-100 break-words max-w-full" >
                            <p className="">{item.message}</p>

                        </div>
                        <p className="text-xs pr-8">{item.time_stamp}</p>
                    </div>
                        }
                           

                        </div>
                    ))}

                    <div ref={chatEndRef}>

                    </div>
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