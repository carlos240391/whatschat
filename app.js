const { entryMessage } = require('./bot/messages/messages');
const { Client,LocalAuth, List } = require('whatsapp-web.js');
const {  initOrder, getFile, cancelOrder, continueProcess } = require('./bot/messages/orderMessages');
const fs = require('fs');
const express = require("express");
const bodyParser = require("body-parser");
// const qrcode = require('qrcode-terminal');

const app = express();

const port = process.env.PORT || 3000;
//Set Request Size Limit 50 MB
app.use(bodyParser.json({ limit: "50mb" }));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const inicializarBot = () =>{
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
    client.on('qr', qr => {
        console.log("Generado QR nuevo: ", qr);
        fs.writeFileSync("./components/last.qr", qr);
        // qrcode.generate(qr, {small: true});
    });
    
    client.on("authenticated", () => {
        console.log("Sesion iniciada.");
        authed = true;
      
        try {
          fs.unlinkSync("./components/last.qr");
        } catch (err) {}
      });
    
    
      client.on("auth_failure", () => {
        console.log("AUTH Failed !");
        process.exit();
      });
    
    
    client.on('ready', () => {
        console.log('El bot esta listo, desde ahora respondera con mensajes automaticos.');
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
    
    client.on("disconnected", () => {
        console.log("El bot termino la sesión, preparandose para reiniciar.");
        setTimeout(()=>{
            inicializarBot();
        }, 3000)
    });
    
    client.initialize();
}
inicializarBot();


const authRoute = require("./components/auth")

app.use("/api", authRoute);
app.use(express.static('./public'));
app.listen(port,"0.0.0.0", () => {
    console.log("Server Running Live on Port : " + port);
});
