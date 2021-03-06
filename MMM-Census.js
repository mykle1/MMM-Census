/* Magic Mirror
 * Module: MMM-Census
 *
 * By Mykle1
 * 
 */
Module.register("MMM-Census", {

    // Module config defaults.
    defaults: {
		country: "World",                           // See README file country list
		popYear: "2017",                            // 1950 - 2100
        useHeader: true,                            // false if you don't want a header      
        header: "World Population & Demographic",   // Any text you want. useHeader must be true
        maxWidth: "300px",
        animationSpeed: 3000,                       // fade speed
        initialLoadDelay: 3250,
        retryDelay: 2500,
        rotateInterval: 5 * 60 * 1000,              // 5 minutes
        updateInterval: 60 * 60 * 1000,

    },

    getStyles: function() {
        return ["MMM-Census.css"];
    },
	
	// Define required scripts.
    getScripts: function() {
        return ["moment.js"];
	},

    start: function() {
        Log.info("Starting module: " + this.name);
		this.sendSocketNotification("CONFIG", this.config);

        requiresVersion: "2.1.0",
		

        //  Set locale.
        this.url = "http://api.population.io/1.0/population/" + this.config.popYear + "/" + this.config.country + "/?format=json";
        this.Census = {};
        this.activeItem = 0;
        this.rotateInterval = null;
        this.scheduleUpdate();
    },

    getDom: function() {
		
		var country = this.config.country;
		var popYear = this.config.popYear;

        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.innerHTML = "Crowd the world . . .";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright", "header");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }
		
		
	//	Rotating my data
		    var Census = this.Census;
		    var CensusKeys = Object.keys(this.Census);
        if (CensusKeys.length > 0) {
            if (this.activeItem >= CensusKeys.length) {
                this.activeItem = 0;
            }
            var Census = this.Census[CensusKeys[this.activeItem]];
			var Pop = this.Pop; 
	        // console.log(Pop); for checking

            var top = document.createElement("div");
            top.classList.add("list-row");
			
			
		    // age
		    var age = document.createElement("div");
            age.classList.add("small", "bright", "age");
		if (Census.age == 0){
			age.innerHTML = this.config.country + " in " + this.config.popYear + " &nbsp < 1 year old";
			wrapper.appendChild(age);
		} else if (Census.age == 1) {
			age.innerHTML = this.config.country + " in " + this.config.popYear + " ~ " + Census.age + " year olds";
			wrapper.appendChild(age);
		} else {
            age.innerHTML = this.config.country + " in " + this.config.popYear + " ~ " + Census.age + " year olds";
            wrapper.appendChild(age);
		}
		
		
			// spacer
			var spacer = document.createElement("div");
			spacer.classList.add("small", "bright", "spacer");
			spacer.innerHTML = " ~~~ ";
			wrapper.appendChild(spacer);
			

			// females
			var females = document.createElement("div");
			females.classList.add("small", "bright", "females");
			females.innerHTML = (Math.round(Census.females) + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,') + " females";
			wrapper.appendChild(females);
			
			
			// males
			var males = document.createElement("div");
			males.classList.add("small", "bright", "males");
			males.innerHTML = (Math.round(Census.males) + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,') + " males";
			wrapper.appendChild(males);
			
			
			// age group total = agtotal
			var agtotal = document.createElement("div");
			agtotal.classList.add("small", "bright", "agtotal");
			agtotal.innerHTML = "Age total = " + (Math.round(Census.total) + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
			wrapper.appendChild(agtotal);
			
			
			// spacer
			var spacer = document.createElement("div");
			spacer.classList.add("small", "bright", "spacer");
			spacer.innerHTML = " ~~~ ";
			wrapper.appendChild(spacer);
			
			} // <-- end of rotation /////////////////////////
			
			
			// Not within the rotation ///////////////////////
			
			// World population today heading
			var WPTdate = document.createElement("div");
			WPTdate.classList.add("small", "bright", "WPTdate");
		//	console.log(this.Pop); // for checking
			WPTdate.innerHTML = "World Population Today"; // + Pop[0].date;
			wrapper.appendChild(WPTdate);
			
			
			// Entire population today
			var popToday = document.createElement("div");
			popToday.classList.add("small", "bright", "popToday");
			popToday.innerHTML = (Math.round(Pop[0].population) + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
			wrapper.appendChild(popToday);
			
			
			// Entire population today and tomorrow date = date
			var date = document.createElement("div");
			date.classList.add("small", "bright", "date");
		//	console.log(this.Pop); // for checking
			date.innerHTML = "World Population Tomorrow"; // + Pop[0].date;
			wrapper.appendChild(date);
			
			
			// Entire population tomorrow
			var popTomorrow = document.createElement("div");
			popTomorrow.classList.add("small", "bright", "popTomorrow");
			popTomorrow.innerHTML = (Math.round(Pop[1].population) + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
			wrapper.appendChild(popTomorrow);
			
			// spacer
			var spacer = document.createElement("div");
			spacer.classList.add("small", "bright", "spacer");
			spacer.innerHTML = " ~~~ ";
			wrapper.appendChild(spacer);
			
			
			// Population growth
			var growth = document.createElement("div");
			growth.classList.add("small", "bright", "growth");
			growth.innerHTML = "Population growth = " + (Math.round(Pop[1].population - Pop[0].population) + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
			wrapper.appendChild(growth);

        return wrapper;
    },

	
/////  Add this function to the modules you want to control with voice //////

    notificationReceived: function(notification, payload) {
        if (notification === 'HIDE_CENSUS') {
            this.hide(1000);
        }  else if (notification === 'SHOW_CENSUS') {
            this.show(1000);
        }
            
    },
	

    processCensus: function(data) {
        this.today = data.Today;
        this.Census = data;
        this.loaded = true;
    },
	
	processPop: function(data) {
        this.Pop = data;
    },

    scheduleCarousel: function() {
        console.log("Carousel of Census fucktion!");
        this.rotateInterval = setInterval(() => {
            this.activeItem++;
            this.updateDom(this.config.animationSpeed);
        }, this.config.rotateInterval);
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getCensus();
        }, this.config.updateInterval);
        this.getCensus(this.config.initialLoadDelay);
    },

    getCensus: function() {
        this.sendSocketNotification('GET_CENSUS', this.url);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "CENSUS_RESULT") {
            this.processCensus(payload);
            if (this.rotateInterval == null) {
                this.scheduleCarousel();
            }
            this.updateDom(this.config.animationSpeed);
        }
		if (notification === "POP_RESULTS") {
            this.processPop(payload);
		}
        this.updateDom(this.config.initialLoadDelay);
    },
});
