const router = require("express").Router();
const fs = require("fs");

router.get("/checkauth", async (req, res) => {
  client
    .getState()
    .then((data) => {
      console.log(data);
      res.send(data);
    })
    .catch((err) => {
      if (err) {
        res.send("DISCONNECTED");
      }
    });
});

router.get("/sesion", async (req, res) => {
  client
    .getState()
    .then((data) => {
      if (data) {
        res.write("<html><body><h2><a href='/'>Home</a><br/> Already Authenticated</h2></body></html>");
        res.end();
      } else sendQr(res);
    })
    .catch(() => sendQr(res));
});

router.post("/send", async(req, res)=>{
  // req.body
  client.sendMessage(`521${req.body.numero}@c.us`, req.body.mensaje).then((res)=>{
    console.log(res)
  })
  res.json({mensaje:"ok"})
})

function sendQr(res) {
  fs.readFile("components/last.qr", (err, last_qr) => {
    if (!err && last_qr) {
      var page = `
                    <html>
                    <head>
                      <style>
                        *{
                          padding:0px;
                          margin:0px;
                          box-sizing:border-box;
                          font-family:'Courier New', Courier, monospace;
                        }
                      </style>
                    </head>
                        <body>
                            <script type="module">
                            </script>
                            <a href='/'>Home</a><br/>
                            <div id="qrcode"></div>
                            <script type="module">
                                import QrCreator from "https://cdn.jsdelivr.net/npm/qr-creator/dist/qr-creator.es6.min.js";
                                let container = document.getElementById("qrcode");
                                QrCreator.render({
                                    text: "${last_qr}",
                                    radius: 0.5, // 0.0 to 0.5
                                    ecLevel: "H", // L, M, Q, H
                                    fill: "#536DFE", // foreground color
                                    background: null, // color or null for transparent
                                    size: 256, // in pixels
                                }, container);
                            </script>
                        </body>
                    </html>
                `;
      res.write(page);
      res.end();
    }
  });
}

module.exports = router;