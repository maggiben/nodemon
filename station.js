///////////////////////////////////////////////////////////////////////////////
// @file         : station.js                                                //
// @summary      : Basic consumable class                                    //
// @version      : 0.1.0                                                     //
// @project      : Node.JS + Express boilerplate for cloud9 and appFog       //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 20 Ene 2013                                               //
// @dependencies                                                             //
//  jQuery       : 1.8.2                                                     //
//  jQuery.UI    : 1.9.1                                                     //
//  ICanHaz      : 0.10                                                      //
//  Sammy        : 0.7.2                                                     //
// ------------------------------------------------------------------------- //
//                                                                           //
// @copyright Copyright 2012 Benjamin Maggi, all rights reserved.            //
//                                                                           //
//                                                                           //
// License:                                                                  //
// This program is free software; you can redistribute it                    //
// and/or modify it under the terms of the GNU General Public                //
// License as published by the Free Software Foundation;                     //
// either version 2 of the License, or (at your option) any                  //
// later version.                                                            //
//                                                                           //
// This program is distributed in the hope that it will be useful,           //
// but WITHOUT ANY WARRANTY; without even the implied warranty of            //
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the             //
// GNU General Public License for more details.                              //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

(function(root, factory) {
 	'use strict';
	if(typeof root.exports === 'function') {
	// Node/CommonJS
	root.exports.Station = factory();
	} else if(typeof root.define === 'function' && root.define.amd) {
	// AMD
	root.define(factory());
	} else {
	// Browser global
	root.Station = factory(root.jQuery);
	}
}(this, function($) {
	'use strict';
    var Station = function(namespace) {
	    if (!(this instanceof Station)) {
	      var me = new Station(namespace);
	      me.store = new Store(me);
	      return me;
	    } else {
	     	this.stopped = false;
	    }
    };
    $.extend(Station.prototype, {
        module: {
            VERSION: "0.11",
            license: {},
            dependencies: {},
            author: "BM",
        },
        properties: {
            name: '',
            _id: 0,
            type: '',
            country: '',
            state: '',
            city: '',
            latitude: 0,
            longitude: 0,
            magic: 1234,
            sensors: [],
            created: null,
            lastUpdate: new Date(),
            lastAccess: new Date(),
            isReady: false,
            overview: true,
            mine: true,
            temperature: {
                value: 0,
                unit: 'C'
            },
            feelslike: {},
            humidity: {
                value: 0,
                dewpoint: 0,
                unit: 'RH'
            },
            wind: {
                value: 0,
                direction: 'SE',
                degrees: 150,
                unit: 'KMH'
            },
            rainfall: {
                value: 0,
                unit: 'MM'
            },
            pressure: {
                value: 0,
                unit: 'INHG',
                type: 'relative'
            },
            visibility: {
                value: 0,
                unit: 'KM'
            },
            astronomy: {
                sunrise: "08:01",
                sunset: "16:42"
            },
            forecast:[
                {
                    day: "Today",
                    condition: "",
                    high_temperature: 0.00,
                    low_temperature: 0.00
                },
                {
                    day: "Tomorrow",
                    condition: "",
                    high_temperature: 0.00,
                    low_temperature: 0.00
                }
            ],
        },
        defaults: {
        	store: null,
        	mediator: null,
        },
        init: function (options) {
            var that = this;
            var options = $.extend({}, this.defaults, options);
			if ( !(this.mediator instanceof options.mediator) ) {
				that.mediator = new options.mediator();
			}
			if ( !(this.store instanceof options.store) ) {
				that.mediator = new options.mediator();
			}
			
			var deferred = new jQuery.Deferred();
            
        },
        update: function(properties, callback) {
            var that = this;
            var properties = $.extend({}, this.properties, properties);

        },
        // getters
        getTemperature: function () {
            return this.properties.temperature;
        },
        // setters
        setTemperature: function (temperature) {
            var that = this;
			$.when(that.store.save("setTemperature", that.properties.temperature))
        	.then(function(temperature, context) {
        		// convert to units
        		// that.properties.temperature
        		return temperature.value;
        	})
        	done(function(temperature){
        		// remove event listener
        		deferred.resolve(temperature);
        	})
        	.fail(function(error) {
        		deferred.reject(new Error(error));
        	})
        	return deferred.promise();

            that.update({temperature: { value: temperature, unit: 'C'}}, onUpdate);
            function onUpdate(data)
            {
                that.properties.temperature = data.temperature;
                console.log("setTemperature update ok! result: " + JSON.stringify(data));
            };
        },
    });

	// Alias some common names for easy interop
	//Station.prototype.getTemperature = getTemperature;
	Station.prototype.saveTemperature = Station.prototype.setTemperature;

	// Finally, expose it all.
	//Station.Topic = Topic;
	Station.version = "0.9.1";

	return Station;
}));

///////////////////////////////////////////////////////////////////////////////
// Transparent Store module user WebSockets and defaults to JSON             //
///////////////////////////////////////////////////////////////////////////////
/*
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
    root.Store = factory(root.jQuery);
  }
}(this, function() {
	'use strict';
	function Store() {
		if ( !(this instanceof Store) ) {
		  return new Store();
		} else {
		  this._mediator = new Mediator();
		}
	};
	Store.prototype = {
		init: function(options) {},
		getData: function() {},
		setData: function() {}
	};
	
    Store.prototype = {
    	module: {
            VERSION: "0.1.0",
            license: {licens: "MIT"},
            dependencies: [['jQuery', '1.5'],["Mediator", "0.1"]],
            author: "Benjamin Maggi",
    	},
    	mediator: null,
    	socket: null,
		init: function(options) {
            var that = this;
            if ( !(this.mediator instanceof mediator) ) {
				that.mediator = new options.mediator();
			}
        },
        getData: function() {
        	var that = this;
        	var deferred = new jQuery.Deferred();
        	$.when()
        	.then(function(data, context){
        		return data;
        	})
        	done(function(data){
        		deferred.resolve(data);
        	})
        	.fail(function(error) {
        		deferred.reject(new Error(error));
        	})
        	return deferred.promise();
        },
		setData: function() {
        	var that = this;
        	var deferred = new jQuery.Deferred();
        	$.when()
        	.then(function(result, context){
        		return result;
        	})
        	done(function(result){
        		deferred.resolve(result);
        	})
        	.fail(function(error) {
        		deferred.reject(new Error(error));
        	})
        	return deferred.promise();
        },
    };
    
	// Module functions
	function setMediator(mediator) {
		if ( !(this.mediator instanceof mediator) ) {
			return new mediator();
		} else {
		  this.namespace = namespace || "";
		  this._callbacks = [];
		  this.stopped = false;
		}
	};
	// internal 
	function _correlator() {
		if ( !(this instanceof _correlator) ) {
			return new _correlator();
		} else {
			this._topics = new Topic( "" );
		}
	};
	_correlator.prototype = {

	};
	function config(options) {
		//var options = $.extend({}, this.defaults, options);
	};
    socket.on('disconnect', function() {
        console.log("socket.disconnected")
        clearTimeout(timer);
        if(MyApp.properties.reconnect)
        {
            socket.socket.reconnect();
        }
        $("li.live .status").text("off");
        $("html").removeClass("live");
    });
    
	// Alias some common names for easy interop
	Store.prototype.get = Store.prototype.getData;
	Store.prototype.set = Store.prototype.putData;
	
	Store.prototype.put = Store.prototype.putData;
	Store.prototype.post = Store.prototype.postData;	
	Store.prototype.remove = Store.prototype.deleteData;
	Store.prototype.delete = Store.prototype.deleteData;
	

	// Finally, expose it all.
	Store.config = config;
	Store.setMediator = setMediator
	//Store.getMediator = getMediator
 	Store.version = "0.1.0";

	return Store;
}));
*/


///////////////////////////////////////////////////////////////////////////////
// Basic Mediator module                                                     //
///////////////////////////////////////////////////////////////////////////////
(function(root, factory) {
  'use strict';

  if(typeof root.exports === 'function') {
    // Node/CommonJS
    root.exports.Mediator = factory();
  } else if(typeof root.define === 'function' && root.define.amd) {
    // AMD
    root.define(factory());
  } else {
    // Browser global
    root.Mediator = factory();
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
  function Subscriber( fn, options, context ) {
    if ( !(this instanceof Subscriber) ) {
      return new Subscriber( fn, context, options );
    } else {
      // guidGenerator() is a function that generates 
      // GUIDs for instances of our Mediators Subscribers so
      // we can easily reference them later on. We're going
      // to skip its implementation for brevity
      this.id = guidGenerator();
      this.fn = fn;
      this.options = options;
      this.context = context;
      this.topic = null;
    }
  }
  // Let's model the Topic.
  // JavaScript lets us use a Function object as a 
  // conjunction of a prototype for use with the new 
  // object and a constructor function to be invoked.
  function Topic( namespace ){

    if ( !(this instanceof Topic) ) {
      return new Topic( namespace );
    }else{

      this.namespace = namespace || "";
      this._callbacks = [];
      this._topics = [];
      this.stopped = false;

    }
  }
  // Define the prototype for our topic, including ways to
  // add new subscribers or retrieve existing ones.
  Topic.prototype = {
    // Add a new subscriber 
    AddSubscriber: function( fn, options, context ) {
      var callback = new Subscriber( fn, options, context );
      this._callbacks.push( callback );
      callback.topic = this;
      return callback;
    },
    StopPropagation: function() {
      this.stopped = true;
    },
    GetSubscriber: function( identifier ) {
      for(var x = 0, y = this._callbacks.length; x < y; x++ ){
        if( this._callbacks[x].id == identifier || this._callbacks[x].fn == identifier ){
          return this._callbacks[x];
        }
      }
      for( var z in this._topics ) {
        if( this._topics.hasOwnProperty( z ) ) {
          var sub = this._topics[z].GetSubscriber( identifier );
          if( sub !== undefined ) {
            return sub;
          }
        }
      }
    },
    AddTopic: function( topic ) {
      this._topics[topic] = new Topic( (this.namespace ? this.namespace + ":" : "") + topic );
    },
    HasTopic: function( topic ) {
      return this._topics.hasOwnProperty( topic );
    },
    ReturnTopic: function( topic ){
      return this._topics[topic];
    },
    RemoveSubscriber: function( identifier ) {
      if( !identifier ){
        this._callbacks = [];

        for( var z in this._topics ) {
          if( this._topics.hasOwnProperty(z) ) {
            this._topics[z].RemoveSubscriber( identifier );
          }
        }
      }
      for( var y = 0, x = this._callbacks.length; y < x; y++ ) {
        if( this._callbacks[y].fn == identifier || this._callbacks[y].id == identifier ) {
          this._callbacks[y].topic = null;
          this._callbacks.splice( y,1 );
          x--; y--;
        }
      }
    },
    Publish: function( data ) {
      for( var y = 0, x = this._callbacks.length; y < x; y++ ) {
          var callback = this._callbacks[y], l;
          callback.fn.apply( callback.context, data );
          l = this._callbacks.length;
          if( l < x ) {
            y--; 
            x = l;
          }
      }
      for( var x in this._topics ) {
        if( !this.stopped ){
          if( this._topics.hasOwnProperty( x ) ) {
            this._topics[x].Publish( data );
          }
        }
      }
      this.stopped = false;
    }
  };
  function Mediator() {
    if ( !(this instanceof Mediator) ) {
      return new Mediator();
    } else {
      this._topics = new Topic( "" );
    }
  };
  Mediator.prototype = {
    GetTopic: function( namespace ) {
      var topic = this._topics,
          namespaceHierarchy = namespace.split(":");
      if( namespace === "" ) {
        return topic;
      }
      if( namespaceHierarchy.length > 0 ) {
        for( var i = 0, j = namespaceHierarchy.length; i < j; i++ ) {
          if( !topic.HasTopic( namespaceHierarchy[i]) ){
            topic.AddTopic( namespaceHierarchy[i] );
          }
          topic = topic.ReturnTopic( namespaceHierarchy[i] );
        }
      }
      return topic;
    },
    Subscribe: function( topicName, fn, options, context ) {
      var options = options || {},
          context = context || {},
          topic = this.GetTopic( topicName ) || null,
          sub = topic.AddSubscriber( fn, options, context );
      return sub;
    },
    // Returns a subscriber for a given subscriber id / named function and topic namespace
    GetSubscriber: function( identifier, topic ){
      return this.GetTopic( topic || "" ).GetSubscriber( identifier );
    },
    // Remove a subscriber from a given topic namespace recursively based on
    // a provided subscriber id or named function.
    Remove: function( topicName, identifier ) {
      this.GetTopic( topicName ).RemoveSubscriber( identifier );
    },
    Publish: function( topicName ) {
      var args = Array.prototype.slice.call( arguments, 1),
          topic = this.GetTopic( topicName );
      args.push( topic );
      this.GetTopic( topicName ).Publish( args );
    }
  };
  
 // Alias some common names for easy interop
  Mediator.prototype.on = Mediator.prototype.Subscribe;
  Mediator.prototype.bind = Mediator.prototype.Subscribe;
  Mediator.prototype.emit = Mediator.prototype.Publish;
  Mediator.prototype.trigger = Mediator.prototype.Publish;
  Mediator.prototype.off = Mediator.prototype.Remove;

  // Finally, expose it all.

  Mediator.Topic = Topic;
  Mediator.Subscriber = Subscriber;
  Mediator.version = "0.9.1";

  return Mediator;
}));
