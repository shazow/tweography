function CounterCallback(count, callback) {
    /* Returns a function that triggers `callback` after being called `count` times. */

    this.count = count;
    this.callback = callback;
    this.prototype = {
        next: function() {
            this.count--;
            if(this.count <= 0) this.callback();
        }
    }

    var self = this;
    return function() { self.next(); }
}



function log(msg) {
    if(console) console.log(msg);
}
