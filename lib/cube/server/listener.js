var amqp = require("amqp"),
    util = require("util");

exports.register = function(db, endpoints, options) {
  var putter = require("./event").putter(db);
  
  var broker = amqp.createConnection({ host: options['amqp-host'] });
  broker.addListener('ready', function () {
    broker.exchange(options['amqp-exchange'], { type: "topic", durable: true }, function(exchange) {
      broker.queue("", { durable: true, autoDelete: true }, function(queue) {
        queue.bind(exchange, "*");
        queue.subscribe(function (data) {
          if (typeof(data) == "object") {
            putter(data);
          }
        });
      });
    });
  });
};
