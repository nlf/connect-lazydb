var lazydb = require('lazydb');

var oneDay = 86400;

module.exports = function (connect) {
    var Store = connect.Store || connect.session.Store;

    function LazyStore(options) {
        options = options || {};
        Store.call(this, options);
        this.filename = null === options.filename ? 'sessions.db' : options.filename;
        this.db = lazydb(this.filename);
    }

    LazyStore.prototype.__proto__ = Store.prototype;

    LazyStore.prototype.get = function (sid, callback) {
        this.db.get(sid, function (err, data) {
            try {
                if (!data) return callback();
                callback(null, data);
            } catch (err) {
                callback(err);
            }
        });
    };

    LazyStore.prototype.set = function (sid, session, callback) {
        var maxAge = session.cookie.maxAge,
            ttl = 'number' == typeof maxAge ? maxAge / 1000 | 0 : oneDay;
        this.db.set(sid, session, function (err) {
            callback && callback.apply(this, arguments);
        });
    };

    LazyStore.prototype.destroy = function (sid, callback) {
        this.db.del(sid, function (err) {
            callback(err);
        });
    };

    return LazyStore;
};
            
