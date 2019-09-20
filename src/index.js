const server = require("./app");

const port = process.env.PORT;
const log = console.log;

server.listen(port, () => {
  log(`Server is up on ${port}`);
});
