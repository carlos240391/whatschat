const fs = require('fs');
const { cancelMessage } = require('./cancelMessages');
const { continueProcessMsg } = require('./messages');

const firstOrder = `🟢 Por favor, escribe el ID (el numero que esta a la izquierda) del producto que deseas ordenar:
\n
➤ 100 - Tarjetas couche 4x1
➤ 101 - Tarjetas couche 4x0
➤ 102 - Tarjetas sulfatadas 4x4
`

const selectCant = `🔰 Escriba la cantidad en número, de impresiones que necesitas de este producto, recuerda que son *millares (1000)* 🔢`
const pedirNombre = `Ya casi terminamos! 👩🏻‍💻 👨🏻‍💻 por favor escribe tu nombre y apellidos.
⚠️ por favor asegurate de que sean datos correctos, de no serlo, no podremos entregarte tu pedido.
`;
const seleccionarPuntoRecoleccion = `📦 Indicanos en que sucursal quieres recoger tu pedido:
\n
➤ 1 - Karso
➤ 2 - Taller
➤ 3 - Green
`

const initOrder = async(client, msg) =>{
    try {
        // fs.writeFileSync(`./chats/${msg.from}.txt`, `step:1;\nidClient:${msg.from};`);
        fs.writeFileSync(`./chats/${msg.from}.txt`, `{"step":"1","idClient":"${msg.from}"}`);
        await timerWait();
        return client.sendMessage(msg.from, firstOrder)
    } catch (error) {
        console.log(error);
        return client.sendMessage(msg.from, "Ups! Algo salio mal")
    }
}

const getFile = (msg)=>{
    return fs.existsSync(`./chats/${msg.from}.txt`);
}

const cancelOrder = (client, msg) =>{
    try {
        fs.unlink(`./chats/${msg.from}.txt`, (err) => {
            if (err) {
              console.error(`Error removing file: ${err}`);
              return;
            }
            return client.sendMessage(msg.from, cancelMessage);
          });
    } catch (error) {
        console.log(error);
        return client.sendMessage(msg.from, "Ups! Algo salio mal") 
    }
}

const objProducs =  {
        100:{
            descripcion:"Tarjetas couche 4x1",
            sku:"70000413",
            precio:65
        },
        101:{
            descripcion:"Tarjetas couche 4x0",
            sku:"70000414",
            precio:80
        },
        102:{
            descripcion:"tarjetas sulfatadas 4x4",
            sku:"70000415",
            precio:100
        }
    }

const continueProcess = async(client, msg) =>{
    try {
        const data = fs.readFileSync(`./chats/${msg.from}.txt`, 'utf8');
        const dataObject = JSON.parse(data)

        if(Number(dataObject.step) === 1 && Object.keys(objProducs).includes(msg.body)){
            const productoSeleccionado = objProducs[Number(msg.body)];
            const actualizarObjeto = {...dataObject, step:2, product:productoSeleccionado}
            fs.writeFileSync(`./chats/${msg.from}.txt`, `${JSON.stringify(actualizarObjeto)}`);
            await timerWait();
            return client.sendMessage(msg.from, selectCant);
        }

        if(Number(dataObject.step) === 2 && Boolean(Number(msg.body))){
            const actualizarObjetoCatidad = {...dataObject, step:3, cantidad:msg.body};
            fs.writeFileSync(`./chats/${msg.from}.txt`, `${JSON.stringify(actualizarObjetoCatidad)}`);
            await timerWait();
            return client.sendMessage(msg.from, pedirNombre);
        }

        if(Number(dataObject.step) === 3 && msg.body !== ''){
            const actualizarObjetoNombre = {...dataObject, step:4, cliente:msg.body};
            fs.writeFileSync(`./chats/${msg.from}.txt`, `${JSON.stringify(actualizarObjetoNombre)}`);
            await timerWait();
            return client.sendMessage(msg.from, seleccionarPuntoRecoleccion);
        }

        if(Number(dataObject.step) === 4 && [1,2,3].includes(Number(msg.body))){
            const actualizarObjetoTienda = {...dataObject, step:5, tienda:msg.body};
            fs.writeFileSync(`./chats/${msg.from}.txt`, `${JSON.stringify(actualizarObjetoTienda)}`);
            await timerWait();
            return client.sendMessage(msg.from, "Estamos casi listos!");
        }

        
        switch (Number(dataObject.step)) {
            case 1:
            return client.sendMessage(msg.from,continueProcessMsg + firstOrder);

            case 2:
            return client.sendMessage(msg.from,continueProcessMsg + selectCant);
            
            case 3:
            return client.sendMessage(msg.from,continueProcessMsg + pedirNombre);

            case 4:
            return client.sendMessage(msg.from,continueProcessMsg + seleccionarPuntoRecoleccion);
            

            default:
                return client.sendMessage(msg.from, continueProcessMsg)
        }
   
        
    } catch (error) {
        console.log(error);
        return client.sendMessage(msg.from, "Ups! Algo salio mal") 
    }
}

const timerWait = async() =>{
    return new Promise((resolve, reject) => {
        setTimeout(()=>{
            resolve("timer!")
        },1000)
    })
}



module.exports = {
    firstOrder,
    initOrder,
    getFile,
    cancelOrder,
    continueProcess
}