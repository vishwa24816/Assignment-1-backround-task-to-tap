const taskList = [];
let totalTaskCount = 0;
let currentTaskNumber = 0;
let taskHandle = null;

const totalTaskCountElem = document.getElementById("totalTaskCount");
const currentTaskNumberElem = document.getElementById("currentTaskNumber");
const progressBarElem = document.getElementById("progress");
const startButtonElem = document.getElementById("startButton");
const logElem = document.getElementById("log");

let logFragment = null;
let statusRefreshScheduled = false;


window.requestIdleCallback ||= (handler) => {
    const startTime = Date.now();

    return setTimeout(() => {
        handler({
            didTimeout: false,
            timeRemaining() {
                return Math.max(0, 50.0 - (Date.now() - startTime));
            },
        });
    }, 1);
};

window.cancelIdleCallback ||= (id) => {
    clearTimeout(id);
};

function enqueueTask(taskHandler, taskData) {
    taskList.push({
        handler: taskHandler,
        data: taskData,
    });

    totalTaskCount++;

    taskHandle ||= requestIdleCallback(runTaskQueue, { timeout: 1000 });

    scheduleStatusRefresh();
}

function runTaskQueue(deadline) {
    while (
        (deadline.timeRemaining() > 0 || deadline.didTimeout) &&
        taskList.length
    ) {
        const task = taskList.shift();
        currentTaskNumber++;

        task.handler(task.data);
        scheduleStatusRefresh();
    }

    if (taskList.length) {
        taskHandle = requestIdleCallback(runTaskQueue, { timeout: 1000 });
    } else {
        taskHandle = 0;
    }
}

function scheduleStatusRefresh() {
    if (!statusRefreshScheduled) {
        requestAnimationFrame(updateDisplay);
        statusRefreshScheduled = true;
    }
}

function updateDisplay() {
    const scrolledToEnd =
        logElem.scrollHeight - logElem.clientHeight <= logElem.scrollTop + 1;

    if (totalTaskCount) {
        if (progressBarElem.max !== totalTaskCount) {
            totalTaskCountElem.textContent = totalTaskCount;
            progressBarElem.max = totalTaskCount;
        }

        if (progressBarElem.value !== currentTaskNumber) {
            currentTaskNumberElem.textContent = currentTaskNumber;
            progressBarElem.value = currentTaskNumber;
        }
    }

    if (logFragment) {
        logElem.appendChild(logFragment);
        logFragment = null;
    }

    if (scrolledToEnd) {
        logElem.scrollTop = logElem.scrollHeight - logElem.clientHeight;
    }

    statusRefreshScheduled = false;
}

function log(text) {
    logFragment ??= document.createDocumentFragment();
    const el = document.createElement("div");
    el.textContent = text;
    logFragment.appendChild(el);

    scheduleStatusRefresh();
}

function logTaskHandler(data) {
    log(`Running task #${currentTaskNumber}`);

    for (let i = 0; i < data.count; i += 1) {
        log(`${(i + 1).toString()}. ${data.text}`);
    }
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function decodeTechnoStuff() {
    totalTaskCount = 0;
    currentTaskNumber = 0;
    updateDisplay();

    logElem.innerHTML = '';
    logFragment = null;

    const n = getRandomIntInclusive(100, 200);

    for (let i = 0; i < n; i++) {
        const taskData = {
            count: getRandomIntInclusive(75, 150),
            text: `This text is from task number ${i + 1} of ${n}`,
        };

        enqueueTask(logTaskHandler, taskData);
    }
}

document
    .getElementById("startButton")
    .addEventListener("click", decodeTechnoStuff, false);


updateDisplay();
