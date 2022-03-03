const io = require("socket.io-client");
const maxApi = require("max-api");

let socket;

maxApi.addHandler("connect", (url) => {
  socket = io(url);

  socket.on("talkback", (msg) => {
    maxApi.outlet("talkback", msg);
  });
});

maxApi.addHandler("disconnect", () => {
  socket.close();
});
