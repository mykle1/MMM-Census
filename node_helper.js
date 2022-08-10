/* Magic Mirror
 * Module: MMM-Census
 *
 * By Mykle1
 *
 */
const NodeHelper = require('node_helper');
const request = require('request');



module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node_helper for: " + this.name);
    },

    getCensus: function(url) {
        request({
            url: url,
            method: 'GET'
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body);
			//	console.log(response.statusCode + result);
                this.sendSocketNotification('CENSUS_RESULT', result);
				this.getPop();
            }
        });
    },
	
	
	getPop: function() {
     	var self = this;
	 	request({ 
    	    url: "http://api.population.io/1.0/GET%20/population/World/today-and-tomorrow/?format=json",
    	          method: 'GET' 
    	        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                        var popresult = JSON.parse(body).total_population;
					//	console.log(response.statusCode + popresult);
                        this.sendSocketNotification("POP_RESULTS", popresult);
            }
       });
    },
	
	

    socketNotificationReceived: function(notification, payload) {
    	if(notification === 'CONFIG'){
			this.config = payload;
		} else if (notification === 'GET_CENSUS') {
			this.getCensus(payload);
		} else if (notification === 'GET_POP') {
			this.getPop(payload);
        }
    }
});