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
		var result = {};

		request({ // request male age groups
			url: url + "&SEX=1",
			method: 'GET'
		}, (error, response, body) => {
			if (!error && response.statusCode == 200) {
				result["M"] = JSON.parse(body);

				request({ // request female age groups
					url: url + "&SEX=2",
					method: 'GET'
				}, (error, response, body) => {
					if (!error && response.statusCode == 200) {
						result["F"] = JSON.parse(body);

						console.log("helper getCensus() called");
						this.sendSocketNotification('CENSUS_RESULT', result);
						this.getPop();
					}
				});
			}
		});
    },
	
	
	getPop: function() {
		console.log("helper getPop() called");
		request({
			url: "https://api.census.gov/data/timeseries/idb/5year?get=NAME,GENC,MPOP,FPOP,E0,GR&YR=" + this.config.popYear,
			method: 'GET'
		}, (error, response, body) => {
			if (!error && response.statusCode === 200) {
				var apires = JSON.parse(body);
				var popres = {};

				for (let i = 1; i < apires.length; i++) { // loop through each country data "row"
					popres[apires[i][0]] = {
						mpop: Number(apires[i][2]),
						fpop: Number(apires[i][3]),
						lfex: Number(apires[i][4]), // average life expectancy
						grth: Number(apires[i][5]) // projected total growth rate for selected year in %
					};
				}
				this.sendSocketNotification("POP_RESULTS", popres);
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