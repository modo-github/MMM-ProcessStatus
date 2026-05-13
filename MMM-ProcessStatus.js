/* global Module */

Module.register("MMM-ProcessStatus", {
    defaults: {
        processes: ["syncthing", "docker"], // Array of processes

        refreshInterval: 10000,  // Refresh every 10 seconds
        iconRunning: "fa-check-circle",  // Icon when running
        iconStopped: "fa-times-circle",  // Icon when stopped
        colorRunning: "#4caf50", // Green when running
        colorStopped: "#f44336", // Red when stopped
        fontSize: "medium",  // Font size for the label
        checkCommand: ""  // Optional custom command to check process status
    },

    start: function() {
        Log.info("Starting module: " + this.name);
        this.processStatuses = [];

        // Initial check
        this.checkStatus();

        // Set interval for periodic checks
        setInterval(() => {
            this.checkStatus();
        }, this.config.refreshInterval);
    },

    checkStatus: function() {
        // Send notification to helper with array of process names
        this.sendSocketNotification("CHECK_PROCESS", {
            processNames: this.config.processes,
            checkCommand: this.config.checkCommand
        });
    },

    // Receive the results from the helper
    socketNotificationReceived: function(notification, payload) {
        if (notification === "PROCESS_STATUS") {
            this.processStatuses = payload;  // Store results
            this.updateDom();  // Update the display
        }
    },

    // Get the DOM elements to display the statuses
    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";  // Stack them vertically
        wrapper.style.gap = "10px";
   
    // Add the label if defined
    if (this.config.label) {
        const labelElement = document.createElement("div");
        labelElement.style.fontSize = "1.5em"; // Or use this.config.fontSize
        labelElement.innerHTML = this.config.label;
        wrapper.appendChild(labelElement); // Add label to the wrapper
    }


        // Loop through the process statuses and create a display for each one
        this.processStatuses.forEach((process) => {
            const row = document.createElement("div");
            row.style.display = "flex";
            row.style.alignItems = "center";
            row.style.gap = "10px";

            const icon = document.createElement("i");
            const text = document.createElement("span");

            if (process.status === "running") {
                icon.className = `fa ${this.config.iconRunning}`;
                icon.style.color = this.config.colorRunning;
                text.innerHTML = `${process.processName}: <span style="color:${this.config.colorRunning}">Running</span>`;
            } else {
                icon.className = `fa ${this.config.iconStopped}`;
                icon.style.color = this.config.colorStopped;
                text.innerHTML = `${process.processName}: <span style="color:${this.config.colorStopped}">Stopped</span>`;
            }

            row.appendChild(icon);
            row.appendChild(text);
            wrapper.appendChild(row);
        });

        return wrapper;
    },

    // Get styles
    getStyles: function() {
        return [];
    }
});
