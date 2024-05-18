const entryMessage = `🤖 Bienvenido al BOT de KARSO.
🚀 Para comenzar escribe cualquiera de los siguientes comandos:
\n
✅ *pedido*: _Crear un pedido_
✅ *estatus*: _Revisar estatus de pedido_
✅ *cancelar*: _Cancelar la operacion_
💬 *mensaje*: _Envianos un mensaje_
\n
🚨 Sigue atentamente las instrucciones, de lo contrario el pedido no se realizará correctamente
`

const continueProcessMsg = `> Continua con el proceso, o escribe  ~CANCELAR~ para empezar de nuevo.\n \n`

module.exports = {
    entryMessage,
    continueProcessMsg
}