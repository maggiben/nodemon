///////////////////////////////////////////////////////////////////////////////
// Basic Store module                                                     //
///////////////////////////////////////////////////////////////////////////////
(function(root, factory) {
  'use strict';

  if(typeof root.exports === 'function') {
    // Node/CommonJS
    root.exports.Store = factory();
  } else if(typeof root.define === 'function' && root.define.amd) {
    // AMD
    root.define(factory());
  } else {
    // Browser global
    root.Store = factory();
  }
}(this, function() {
  'use strict';  
  function guidGenerator() {
    var S4 = function() {
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  }
  // Our Subscriber constructor
  function Listener( fn, options, context ) {
    if ( !(this instanceof Listener) ) {
      return new Listener( fn, context, options );
    } else {
      // guidGenerator() is a function that generates 
      // GUIDs for instances of our Mediators Subscribers so
      // we can easily reference them later on. We're going
      // to skip its implementation for brevity
      this.id = guidGenerator();
      this.fn = fn;
      this.options = options;
      this.context = context;
      this.collector = null;
    }
  }
  // Let's model the Collector.
  // JavaScript lets us use a Function object as a 
  // conjunction of a prototype for use with the new 
  // object and a constructor function to be invoked.
  function Collector( namespace ){

    if ( !(this instanceof Collector) ) {
      return new Collector( namespace );
    }else{

      this.namespace = namespace || "";
      this._callbacks = [];
      this._collectors = [];
      this.stopped = false;

    }
  }
  // Define the prototype for our collector, including ways to
  // add new subscribers or retrieve existing ones.
  Collector.prototype = {
    // Add a new subscriber 
	addListener: function( fn, options, context ) {
      var callback = new Listener( fn, options, context );
      this._callbacks.push( callback );
      callback.collector = this;
      return callback;
	},
	stopPropagation: function() {
		this.stopped = true;
    },
    getListener: function( identifier ) {
      for(var x = 0, y = this._callbacks.length; x < y; x++ ){
        if( this._callbacks[x].id == identifier || this._callbacks[x].fn == identifier ){
          return this._callbacks[x];
        }
      }
      for( var z in this._collectors ) {
        if( this._collectors.hasOwnProperty( z ) ) {
          var sub = this._collectors[z].GetSubscriber( identifier );
          if( sub !== undefined ) {
            return sub;
          }
        }
      }
    },
    addCollector: function(collector) {
      this._collectors[collector] = new Collector( (this.namespace ? this.namespace + ":" : "") + collector );
    },
    hasCollector: function( collector ) {
      return this._collectors.hasOwnProperty( collector );
    },
    returnCollector: function( collector ){
      return this._collectors[collector];
    },
    removeListener: function( identifier ) {
      if( !identifier ){
        this._callbacks = [];

        for( var z in this._collectors ) {
          if( this._collectors.hasOwnProperty(z) ) {
            this._collectors[z].RemoveSubscriber( identifier );
          }
        }
      }
      for( var y = 0, x = this._callbacks.length; y < x; y++ ) {
        if( this._callbacks[y].fn == identifier || this._callbacks[y].id == identifier ) {
          this._callbacks[y].collector = null;
          this._callbacks.splice( y,1 );
          x--; y--;
        }
      }
    },
    save: function( data ) {
      for( var y = 0, x = this._callbacks.length; y < x; y++ ) {
          var callback = this._callbacks[y], l;
          callback.fn.apply( callback.context, data );
          l = this._callbacks.length;
          if( l < x ) {
            y--; 
            x = l;
          }
      }
      for( var x in this._collectors ) {
        if( !this.stopped ){
          if( this._collectors.hasOwnProperty( x ) ) {
            this._collectors[x].save( data );
          }
        }
      }
      this.stopped = false;
    },
    onBeforeSave: function( data ) {

    },
    onSave: function ( data ) {

    }
  };
  function Store() {
    if ( !(this instanceof Store) ) {
      return new Store();
    } else {
      this._collectors = new Collector( "" );
    }
  };
  Store.prototype = {
    getCollector: function( namespace ) {
      var collector = this._collectors,
          namespaceHierarchy = namespace.split(":");
      if( namespace === "" ) {
        return collector;
      }
      if( namespaceHierarchy.length > 0 ) {
        for( var i = 0, j = namespaceHierarchy.length; i < j; i++ ) {
          if( !collector.hasCollector( namespaceHierarchy[i]) ){
            collector.addCollector( namespaceHierarchy[i] );
          }
          collector = collector.returnCollector( namespaceHierarchy[i] );
        }
      }
      return collector;
    },
    listen: function( collectorName, fn, options, context ) {
      var options = options || {},
          context = context || {},
          collector = this.getCollector( collectorName ) || null,
          sub = collector.addListener( fn, options, context );
      return sub;
    },
    // Returns a subscriber for a given subscriber id / named function and collector namespace
    getListener: function( identifier, collector ){
      return this.getCollector( collector || "" ).getListener( identifier );
    },
    // Remove a subscriber from a given collector namespace recursively based on
    // a provided subscriber id or named function.
    remove: function( collectorName, identifier ) {
      this.getCollector( collectorName ).RemoveSubscriber( identifier );
    },
    save: function( collectorName ) {
      var args = Array.prototype.slice.call( arguments, 1),
          collector = this.getCollector( collectorName );
      args.push( collector );
      this.getCollector( collectorName ).save( args );
    }
  };
  
 // Alias some common names for easy interop
  Store.prototype.on = Store.prototype.listen;
  Store.prototype.off = Store.prototype.remove;

  // Finally, expose it all.

  Store.Collector = Collector;
  Store.Listener = Listener;
  Store.version = "0.9.1";

  return Store;
}));
