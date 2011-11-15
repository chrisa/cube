var options = require("./listener-config"),
    cube = require("../"),
    server = cube.server(options);

server.register = function(db, endpoints, options) {
  cube.listener.register(db, endpoints, options);
};

server.start();
