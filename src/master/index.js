/** @module master */

/**
 * Initializes all QApe workers and handles their communication.
 * @memberof master
 * @param {cluster} cluster
 * @param {Object} config
 */
export default (cluster, config) => {
    let exitCode = 0;
    let liveWorkers = 0;
    let reporter;
    let scriptwriter;

    initReporter();
    initScriptwriter();

    for (let i = 0; i < config.parallelInstances; i++) {
        liveWorkers++;
        initTester();
    }

    function initReporter() {
        reporter = cluster.fork({ worker_type: 'reporter' }).on('exit', (code, signal) => {
            console.error(`Reporter died! [code:${code}, signal: ${signal}]`);
            initReporter();
        });
    }

    function initScriptwriter() {
        scriptwriter = cluster
            .fork({ worker_type: 'scriptwriter' })
            .on('message', (msg) => {
                if (msg.reciever === 'tester') {
                    cluster.workers[msg.workerId].send(msg.eventData);
                }
            })
            .on('exit', (code, signal) => {
                console.error(`Scriptwriter died! [code: ${code}, signal: ${signal}]`);
                initScriptwriter();
            });
    }

    function initTester() {
        let worker = cluster.fork();
        let timeoutHandler = () => worker.kill('SIGKILL');
        let timeout = setTimeout(timeoutHandler, config.testerTimeout);

        worker
            .on('message', (msg) => {
                clearTimeout(timeout);
                timeout = setTimeout(timeoutHandler, config.testerTimeout);
                let fullMsg = Object.assign({}, msg, { workerId: worker.id });

                if (msg.reciever === 'reporter') {
                    reporter.send(fullMsg);
                }

                if (msg.reciever === 'scriptwriter') {
                    scriptwriter.send(fullMsg);
                }
            })
            .on('exit', (code, signal) => {
                console.log(`Tester ${worker.id} exited. [code: ${code}, signal: ${signal}]`); // eslint-disable-line no-console
                if (code > exitCode) {
                    exitCode = code;
                }

                if (signal === 'SIGKILL') {
                    initTester();
                } else {
                    liveWorkers--;

                    if (liveWorkers <= 0) {
                        reporter.send({ eventName: 'process:exit', eventData: { exitCode } });

                        process.exit(exitCode);
                    }
                }
            });
    }
};
