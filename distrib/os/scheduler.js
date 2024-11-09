/*
    This is my scheduler class which handles scheduling dispatching, and more
    */
var TSOS;
(function (TSOS) {
    class Scheduler {
        memoryManager;
        cpu;
        quantum = 6; // default quantum
        quantumCounter = 0; // tracks the cycles 
        currentProcessIndex = 0; // tracks the index of the current process in the ready queue
        constructor(memoryManager, cpu) {
            this.memoryManager = memoryManager;
            this.cpu = cpu;
        }
        // lets the user set the quantum by shell command
        setQuantum(newQuantum) {
            this.quantum = newQuantum;
        }
        // manages the quantum counter and triggers a context switch when the quantum is reached
        // this is how the scheduler interacts with the cpu 
        manageQuantum() {
            this.quantumCounter++;
            if (this.quantumCounter >= this.quantum) {
                this.quantumCounter = 0; // resetting the quantum counter
                this.currentProcessIndex = (this.currentProcessIndex + 1) % this.memoryManager.readyQueue.length;
                // _StdOut.putText("Quantum reached. Switching process..."); just debug
                this.scheduleNextProcess(); // switches to the next process
            }
        }
        // starts/continues scheduling using round robin scheduling 
        scheduleNextProcess() {
            // only continues if there are processes in the ready queue
            if (this.memoryManager.readyQueue.length === 0) {
                _StdOut.putText("No processes available to schedule.");
                _CPU.isExecuting = false;
                return;
            }
            // advances to the next non-terminated process in the ready queue
            while (this.memoryManager.readyQueue.length > 0) {
                const nextPCB = this.memoryManager.readyQueue[this.currentProcessIndex];
                // if the process is terminated, remove it from the queue and continue
                if (nextPCB.state === "Terminated") {
                    this.memoryManager.readyQueue.splice(this.currentProcessIndex, 1);
                    // if removing the terminated process leaves no processes, stop the CPU
                    // this is really for a case in which there is only one process in the queue and kill<pid> is called 
                    if (this.memoryManager.readyQueue.length === 0) {
                        _StdOut.putText("All processes terminated. Stopping CPU.");
                        _CPU.isExecuting = false;
                        return;
                    }
                }
                else {
                    this.dispatchProcess(nextPCB);
                    break;
                }
                // goes to the next process in the queue
                this.currentProcessIndex = (this.currentProcessIndex + 1) % this.memoryManager.readyQueue.length;
            }
        }
        // dispatches a process to the CPu
        dispatchProcess(pcb) {
            if (this.cpu.pcb) {
                this.cpu.savePCB();
                if (this.cpu.pcb.state !== "Terminated") {
                    this.cpu.pcb.state = "Waiting";
                }
            }
            this.cpu.loadPCB(pcb);
            pcb.state = "Executing";
            this.quantumCounter = 0; // resets the quantum counter
            this.cpu.isExecuting = true;
            TSOS.Control.updatePcbDisplay(); // updates the PCB display
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map