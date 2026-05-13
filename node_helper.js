const NodeHelper = require("node_helper");
const { exec } = require("child_process");

module.exports = NodeHelper.create({
    start() {
        console.log("MMM-ProcessStatus helper started");
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "CHECK_PROCESS") {
            let results = [];
            let completedCount = 0;
            const totalProcesses = payload.processNames.length;

            payload.processNames.forEach((processName) => {
                const command = payload.checkCommand || `pgrep -x "${processName}"`;
                
                exec(command, (error, stdout, stderr) => {
                    let status = "stopped";
                    let errorMsg = null;

                    // Logic Fix:
                    // pgrep returns exit code 1 if process is NOT found. This is NOT an error.
                    // We only treat it as an error if the exit code is > 1 OR if stderr indicates a real issue.
                    
                    if (error && error.code !== 1) {
                        // Real error (syntax, permission, etc.)
                        errorMsg = error.message;
                        console.warn(`[MMM-ProcessStatus] Real error checking ${processName}: ${errorMsg}`);
                    } else if (stdout.trim() !== "") {
                        // Process found (stdout has PIDs)
                        status = "running";
                    } 
                    // If error.code === 1, it means "not found", so we leave status as "stopped"

                    results.push({
                        processName,
                        status,
                        error: errorMsg // Optional: pass error info if needed
                    });

                    completedCount++;
                    if (completedCount === totalProcesses) {
                        this.sendSocketNotification("PROCESS_STATUS", results);
                    }
                });
            });
        }
    }
});