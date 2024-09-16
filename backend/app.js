// app.js
const postgres = require('postgres');
const http = require("http")
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
const {Server} = require("socket.io")
require('dotenv').config();



let { PGHOST, PGUSER, PGPASSWORD, PGDATABASE, ENDPOINT_ID } = process.env;

const app = express()

// socket IO
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: 'https://chat-app-l6fb.onrender.com', // Erlaubter Ursprung
        methods: ['GET', 'POST'], // Erlaubte Methoden
    },
});

const pool = new Pool({
    host: PGHOST,
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: { rejectUnauthorized: false },  // SSL korrekt konfiguriert
    // Optional: max. Verbindungen im Pool festlegen
    max: 10, // Max. Verbindungen im Pool
});


app.use(bodyParser.json())
app.use(cors())

app.get("/",  (req, res) => {
    res.json({ message: "Updated" })
})

//Signup route
app.post("/signup", async (req, res) => {
    const { username, password } = req.body
    console.log("userame: ", username)
    console.log("password: ", password)

    //Die Daten werden nur empfangen wenn sie im frontend kontrolliert sind
    try {
        // Überprüfen ob der User bereits existiert
        const checkUsername = "SELECT * FROM users WHERE username = $1"
        const checkUsernameResult = await pool.query(checkUsername, [username])

        if (checkUsernameResult.rows.length > 0) {
            return res.status(400).json({ message: "Username bereits vergeben" })
        }

        //Kein Nutzer vorhanden , jetzt wird der User erstellt
        const insertQuery = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *';
        const values = [username, password];

        const result = await pool.query(insertQuery, values);
        return res.status(200).json({ message: "Nutzer erfolgreich erstellt  " })
    }

    catch (error) {
        console.error(error)
    }


    res.json({ message: "Fehöer aufgetreten" })
})

//login route
app.post("/login", async (req, res) => {
    console.log(req.body)
    const { username, password } = req.body

    try {
        const checkInput = "SELECT * FROM users WHERE username = $1 AND password = $2"
        const checkInputResult = await pool.query(checkInput, [username, password])

        if (checkInputResult.rows.length > 0) {
            console.log(checkInputResult.rows[0].id)
            console.log("Login erfolgreich")
            return res.status(200).json({ message: "Login erfolgreich", id: checkInputResult.rows[0].id, username: checkInputResult.rows[0].username })
        }

        else {
            return res.status(401).json({ message: "Falsche Eingabe" })
        }
    }

    catch (error) {
        console.error(error)
        res.status(401).json({ message: error })
    }


})

//alle Users werden zurückgegegebn
app.get("/allUsers", async (req, res) => {

    try {
        const getUsers = "SELECT * FROM users"
        const getUsersQuery = await pool.query(getUsers)

        // Entferne das Passwort-Feld aus jedem Benutzerobjekt
        const usersWithoutPassword = getUsersQuery.rows.map(user => {
            const { password, ...userWithoutPassword } = user; // Entferne 'password' aus dem Objekt
            return userWithoutPassword;
        });

        res.status(200).json({ data: usersWithoutPassword });

    }

    catch (error) {
        console.error(error)
        res.status(401).json({ message: error })
    }
})

// Hier ist die FUnktion die den Chat ohne Socket IO im Backend speichert
app.post("/newChat", async (req, res) => {
    
    const {senderid, senderusername, receiverid, receiverusername, time_stamp, message} = req.body
    console.log(senderid)
    console.log(senderusername)
    console.log(receiverid)
    console.log(receiverusername)
    console.log(time_stamp);
    console.log(message);


    //NEuer Eintrag im Chat

    try {
        const query = `INSERT INTO allchats 
        (senderid, senderusername, receiverid, receiverusername, time_stamp, message)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`
        const values = [senderid, senderusername, receiverid, receiverusername, time_stamp, message]

        const result = await pool.query(query, values)

        if(result && result.rows.length > 0) {
            return res.status(200).json({message: "Chat erfolgreich erstellt"})
        }
        else {
            return res.status(500).json({message: "Fehler aufgetreten"})
        }

    }

    catch(error) {
        console.log(error)
        return res.status(500).json({message: error})
    }
    
    

    



    return res.status(200).json({"message":"Updatet Chat"})

})


// Hier ist funktionalität mit socket io
io.on("connection", (socket) => {
    console.log("User connected: ", socket.id)

    // Listening vom Frontend nach neuen Chats

    socket.on("chat message", async (msg) => {
        console.log("Nachricht erhalten: ", msg)

        //TODO speichern im SQL
        try {
            io.emit("chat message", msg)

            const query = `INSERT INTO chat  
            (senderid, senderusername, receiverid, receiverusername, time_stamp, message)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`
            const values = [msg.senderid, msg.senderusername, msg.receiverid, msg.receiverusername, msg.time_stamp, msg.message]
    
            const result = await pool.query(query, values)
            console.log(result.rows[0])
    
            
    
        }
    
        catch(error) {
            console.log(error)
            
        }

    

    })

    socket.on("disconnect", ()=> {
        console.log("User disconnected")
    })

})

app.post("/openChat", async (req, res) => {
    console.log(req.body)
    const {recID, userID} = req.body

    try {
        
        const query = `SELECT * FROM chat WHERE 
        (senderid = $1 AND receiverid = $2) OR (senderid = $2 AND receiverid =$1)`
        const result = await pool.query(query, [recID, userID] )

        return res.status(200).json({message: result.rows})
    }

    catch(err) {
        console.log("Fehler aufgetreten: ", err)
        return res.status(500).json({message: error})
    }
})



const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
});