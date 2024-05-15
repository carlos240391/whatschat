const { Client,LocalAuth, List } = require('whatsapp-web.js');
// const qrcode = require('qrcode-terminal');
const bodyParser = require("body-parser");
const { entryMessage } = require('./bot/messages/messages');
const { firstOrder, initOrder, getFile, cancelOrder, continueProcess } = require('./bot/messages/orderMessages');
const fs = require('fs');
const express = require("express");


// Create a new client instance
global.client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true,args: ['--no-sandbox', '--disable-setuid-sandbox'] },
 
    webVersionCache: {
        type: "remote",
        remotePath:
          "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
    },
})

global.authed = false;

const app = express();

const port = 8082;
//Set Request Size Limit 50 MB
app.use(bodyParser.json({ limit: "50mb" }));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


client.on('qr', qr => {
    // console.log("RESULTADO QR", qr);
    fs.writeFileSync("./components/last.qr", qr);
    // qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('El bot esta liso, desde ahora respondera con mensajes automaticos.');
});

client.on("message", async(msg) =>{
    
    if(getFile(msg) && msg.body.toLocaleLowerCase() !== 'cancelar'){
        
        return continueProcess(client, msg);
    }
    
    switch (msg.body.toLowerCase()) {
        case "pedido":
            return initOrder(client, msg);
    
        case "estatus":
            return client.sendMessage(msg.from, "No se como va tu pedido bro, zorry");

        case "cancelar":
            return cancelOrder(client, msg);
    
        case "mensaje":
            return client.sendMessage(msg.from, "Enseguida escirbe tu mensaje y No. de contacto, y nosotros te contactamos.");
        
        default:
            return client.sendMessage(msg.from, entryMessage);
            break;
    }
})


client.initialize();

const authRoute = require("./components/auth")

app.use("/auth", authRoute);
app.listen(port, () => {
    console.log("Server Running Live on Port : " + port);
});
