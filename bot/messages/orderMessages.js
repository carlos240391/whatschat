const fs = require('fs');
const { cancelMessage } = require('./cancelMessages');
const { continueProcessMsg } = require('./messages');

const objProducs =  {
    100:{
        descripcion:"Tarjetas couche 4x1, 130g. (Color al frente, escala de grises en el reverso).",
        sku:"70000413",
        precio:65
    },
    101:{
        descripcion:" Tarjetas couche 4x0, 130g. (Color al frente, reverso en blanco).",
        sku:"70000414",
        precio:80
    },
    102:{
        descripcion:"Tarjetas cartulina sulfatada 4x4, 14pts. (Color ambos lados).",
        sku:"70000415",
        precio:100
    }
}

const orderProducts = () =>{
    let productList = [];
    Object.keys(objProducs).forEach((key) =>{
        productList = [...productList, `* *\`ID: ${key}\`* = ${objProducs[key].descripcion} _Precio: $${objProducs[key].precio}_`]
    })
    return `🟢 Por favor, escribe el ID (el numero que esta a la izquierda) del producto que deseas ordenar:
\n
${productList.join('\n\n')}`
}


const selectCant = `🔢 Las tarjetas se imprimen por *\`millares\`*, por favor indicanos, la cantidad de millares que deseas ordenar.`
const pedirNombre = `👩🏻‍💻 👨🏻‍💻Ya casi terminamos! por favor escribe tu nombre y apellidos. \n
> Si tienes una cuenta en nuestro sitio, escribe tu ID de cliente, si aun no tienes cuenta, puedes crear una en \`https://www.karsopublicidad.com\` \n
⚠️ Por favor asegurate de que sean datos correctos, de no serlo, no podremos entregarte tu pedido.
`;
const seleccionarPuntoRecoleccion = `📦 Indicanos en que sucursal (el número a la izquierda), quieres recoger tu pedido:
\n
- *\`ID: 1\`* = Karso
- *\`ID: 2\`* = Taller
- *\`ID: 3\`* = Green
`

const desglocePedido = (data) =>{
    const desgloce = `✍️ Estos son los detalles del pedido:\n
- \`CLIENTE\`: ${data.cliente} \n
- \`PRODUCTO\`: ${data.product.descripcion}\n
- \`CANTIDAD\`: ${data.cantidad}\n
- \`TOTAL\`: $${data.product.precio * data.cantidad}\n
- \`ANTICIPO:\`: $${(data.product.precio * data.cantidad) / 2}\n
💳 Para poder continuar con tu compra, adjunta el comprobante de pago por $${(data.product.precio * data.cantidad) / 2}, posterior, adjunta tus archivos y te confirmaremos tu pedido.
\n`
    return desgloce;
}

const initOrder = async(client, msg) =>{
    try {
        // fs.writeFileSync(`./chats/${msg.from}.txt`, `step:1;\nidClient:${msg.from};`);
        fs.writeFileSync(`./chats/${msg.from}.txt`, `{"step":"1","idClient":"${msg.from}"}`);
        await timerWait();
        return client.sendMessage(msg.from, orderProducts())
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
            return client.sendMessage(msg.from, desglocePedido(dataObject));
        }


        
        switch (Number(dataObject.step)) {
            case 1:
            return client.sendMessage(msg.from,continueProcessMsg + orderProducts());

            case 2:
            return client.sendMessage(msg.from,continueProcessMsg + selectCant);
            
            case 3:
            return client.sendMessage(msg.from,continueProcessMsg + pedirNombre);

            case 4:
            return client.sendMessage(msg.from,continueProcessMsg + seleccionarPuntoRecoleccion);

            case 5:
            return client.sendMessage(msg.from,continueProcessMsg + desglocePedido(dataObject));
            

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
    orderProducts,
    initOrder,
    getFile,
    cancelOrder,
    continueProcess
}