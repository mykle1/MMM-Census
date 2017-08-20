/* Magic Mirror
 * Module: MMM-Census
 *
 * By Mykle1
 *
 */
Module.register("MMM-Census", {

    // Module config defaults.
    defaults: {
        useHeader: true,             // False if you don't want a header      
        header: "World Population",       // Any text you want. useHeader must be true
        maxWidth: "275px",
        animationSpeed: 3000,        // fade speed
        initialLoadDelay: 3250,
        retryDelay: 2500,
        rotateInterval: 20 * 1000,   // 5 minutes
        updateInterval: 30 * 60 * 1000,

    },

    getStyles: function() {
        return ["MMM-Census.css"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);
		this.sendSocketNotification("CONFIG", this.config);

        requiresVersion: "2.1.0",

        //  Set locale.
        this.url = "http://api.population.io/1.0/population/2017/World/?format=json";
        this.Census = [];
        this.activeItem = 0;
        this.rotateInterval = null;
        this.scheduleUpdate();
    },

    getDom: function() {

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
		
	//	console.log(Census); // for checking

            var top = document.createElement("div");
            top.classList.add("list-row");
			
			
		// Population by age group = pbag
		var pbag = document.createElement("div");
        pbag.classList.add("small", "bright", "pbag");
        pbag.innerHTML = "Population by age group";
        wrapper.appendChild(pbag);
		
		
		// age
		    var age = document.createElement("div");
            age.classList.add("small", "bright", "age");
		if (Census.age == 0){
			age.innerHTML = "Less than 1 year old";
			wrapper.appendChild(age);
		} else if (Census.age == 1) {
			age.innerHTML = Census.age + " year old";
			wrapper.appendChild(age);
		} else {
            age.innerHTML = Census.age + " year old";
            wrapper.appendChild(age);
		}
		
		
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
		
		
		// country and year
		var country = document.createElement("div");
        country.classList.add("small", "bright", "country");
        country.innerHTML = "In the " + Census.country + " in " + Census.year ;
        wrapper.appendChild(country);
		
		
		// age group total = agtotal
		var agtotal = document.createElement("div");
        agtotal.classList.add("small", "bright", "agtotal");
		//  (Math.round(Lunartic.DFS) + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,')
        agtotal.innerHTML = "Age total = " + (Math.round(Census.total) + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
        wrapper.appendChild(agtotal);
		
		
		// Entire population today and tomorrow date = date
		var date = document.createElement("div");
        date.classList.add("small", "bright", "date");
		//  (Math.round(Lunartic.DFS) + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,')
        date.innerHTML = "Full world total on " + Census.date;
        wrapper.appendChild(date);
		
		
		// Entire population today and tomorrow
		var population = document.createElement("div");
        population.classList.add("small", "bright", "population");
		//  (Math.round(Lunartic.DFS) + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,')
        population.innerHTML = (Math.round(Census.population) + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
        wrapper.appendChild(population);
		
		

		}
        return wrapper;
    },


    processCensus: function(data) {
        this.today = data.Today;
        this.Census = data;
        this.loaded = true;
    },
	
	processPop: function(data) {
        this.Pop = data; // data.results
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