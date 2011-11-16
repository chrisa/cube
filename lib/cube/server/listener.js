var amqp = require("amqp"),
    util = require("util");

exports.register = function(db, endpoints, options) {
  var putter = require("./event").putter(db);
  
  var handle = function(data) {
    if (typeof(data) == "object") {
      var event = data.type + "_events";
      var metric = data.type + "_metrics";

      var errfn = function(error) {
        if (error) throw error;
      };

      db.createCollection(event, function(err, collection) {
        db.ensureIndex(event, {t: 1}, {}, errfn);
        db.createCollection(metric, {capped: true, size: 1e6, autoIndexId: false}, function(err, collection) {
          db.ensureIndex(metric, {e: 1, l: 1, t: 1, g: 1}, {unique: true}, errfn);
          db.ensureIndex(metric, {i: 1, e: 1, l: 1, t: 1}, errfn);
          db.ensureIndex(metric, {i: 1, l: 1, t: 1}, errfn);
          putter(data);
        });
      });
    }
  };

  var broker = amqp.createConnection({ host: options['amqp-host'] });
  broker.addListener('ready', function () {
    broker.exchange(options['amqp-exchange'], { type: "topic", durable: true }, function(exchange) {
      broker.queue("", { durable: true, autoDelete: true }, function(queue) {
        queue.bind(exchange, "#");
        queue.subscribe(handle);
      });
    });
  });
};
