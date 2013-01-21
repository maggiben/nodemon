///////////////////////////////////////////////////////////////////////////////
// @file         : linux.js                                                  //
// @summary      : Linux monitoring middleware                               //
// @version      : 0.1.0                                                     //
// @project      : Node.JS + Express boilerplate for cloud9 and appFog       //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 12 Dec 2012                                               //
// @dependencies                                                             //
//  Q       : 0.8.12                                                         //
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

var Q = require("q");
var fs = require('fs');

var system = {
    cpu: {
        'processor': null,
        'vendor_id': null,
        'cpu family': null,
        'model': null,
        'model name': null,
        'stepping': null,
        'cpu MHz': null,
        'cache size': null,
        'physical id': null,
        'siblings': null,
        'core id': null,
        'cpu cores': null,
        'apicid': null,
        'initial apicid': null,
        'fdiv_bug': null,
        'hlt_bug': null,
        'f00f_bug': null,
        'coma_bug': null,
        'fpu': null,
        'fpu_exception': null,
        'cpuid level': null,
        'wp': null,
        'flags': null,
        'bogomips': null,
        'clflush size': null,
        'cache_alignment': null,
        'address sizes': null,
        'power management': null,
    },
    meminfo: {
    }
};

var metrics = {
    stats: {}
};

exports.getMemInfo = function(callback) {
    var memInfo = {};
    var deferred = Q.defer();
    var p = [];

    fs.readFile('/proc/meminfo', 'utf8', function (error, data) {
        if (error) {
            deferred.reject(new Error(error));
        } else {
            var lines = data.split('\n');
            lines.forEach(function(line) {
                line = line.replace(/\s+/g, ' ');
                columns = line.split(" ");
                if(columns[0]) {
                    key = columns[0].replace(':','');
                    value = columns[1];
                    unit = columns[2];
                    memInfo[key] = {value: value, unit: unit};
                }
            });
            deferred.resolve(memInfo);
        }
    });
    return deferred.promise;
}
exports.getTimes = function(callback) {
    "use strict";

    var cpu = {
        total: 0
        , user: 0
        , nice:  0
        , system: 0
        , idle: 0
        , iowait: 0
        , irq: 0
        , softirq: 0
    };
    var deferred = Q.defer();
    fs.readFile('/proc/stat', 'utf8', function (error, stat) {
        if (error) {
            deferred.reject(new Error(error));
        } else {
            var stat = stat.split('\n');
            stat.forEach(function(line) {
                if(line.indexOf("cpu ") == 0) {
                    // trim multiple spaces and tabs
                    line = line.replace(/\s+/g, ' ');
                    line = line.split(" ");
                    // Discard the "cpu" prefix.
                    line = line.slice(1);
                    cpu.user = line[0],
                    cpu.nice = line[1],
                    cpu.system = line[2],
                    cpu.idle = line[3],
                    cpu.iowait = line[4],
                    cpu.irq = line[5],
                    cpu.softirq = line[6],
                    line.forEach(function(value) {
                        cpu.total += parseInt(value, 10);
                    });
                }
            });
            deferred.resolve(cpu);
        }
    });
    return deferred.promise;
}

exports.init = function(options)
{
    var stats = [];
    var limit = 250;
    var stat = {
        cpu: {},
        prevTotal: 0,
        prevIdle: 0
    };
    var timer = setInterval(function() {

        Q.when(exports.getTimes(), function(time) {
            var diffIdle = time.idle - stat.prevIdle;
            var diffTotal = time.total - stat.prevTotal;
            var diffUsage = ( 1000 * ( diffTotal - diffIdle) / diffTotal + 5 ) / 10;
            stat.prevTotal = time.total;
            stat.prevIdle = time.idle;
            var usage = diffUsage.toFixed(2) < 0 ? 0 : diffUsage.toFixed(2) > 100 ? 100 : diffUsage.toFixed(2);
            if(stats.length < limit) {
                stats.push([new Date(), usage]);    
            } else {
                //return stats;
            }
        }).when(function(stats) {
            console.log(stats)
        }).fail(function (error) {
            console.log(error)
        });
        Q.when(exports.getMemInfo(), function(memInfo) {
            //console.log("memFree: " + parseInt(memInfo.MemFree.value / 1025) + " Mb");
            return Math.floor(memInfo.MemFree.value / 1024)
        }).then(function (data) {
            console.log(data)
        }).fail(function (error) {
            console.log(error)
        });
    }, 500);
}


exports.init({})