'use strict';

var Conversation = require('watson-developer-cloud/conversation/v1');
var _ = require('lodash');

let cs;
let workspace_id;
let cont = 0;
let threshold;
let runningTest = false;

module.exports = {

    init: (user, password, workspace, version_date, paramthreshold) => {
        let newService = {
            username: user,
            password: password,
            version_date: version_date || '2017-04-21'
        };
        workspace_id = workspace;
        threshold = paramthreshold || 0.0;
        cs = new Conversation(newService);
    },

    runTest: (callback) => {
        let fullTest = [];

        if (runningTest) {
            return callback({ err: "Another session is in progress" }, null);
        }

        runningTest = true;
        cs.getWorkspace({ 'workspace_id': workspace_id }, (err, result) => {
            if (err) {
                console.error("Error on Conversation getWorkspace: %j", err);
                return callback(err, null);
            }

            let wsoriginal = result;

            if (result.status === 'Available') {
                cs.getIntents({ 'workspace_id': workspace_id }, (err, result) => {
                    let promises = result.intents.map(getExamples);

                    Promise.all(promises).then(intents => {
                        let tests = [];
                        for (var x = 0; x < 5; x++) {
                            let tobetested = [];
                            intents.forEach((element) => {
                                let item = {};
                                item.intent = element.intent;
                                item.test = [];
                                if (!element.endTest) {
                                    element.startTest = 0;
                                } else {
                                    element.startTest = element.endTest;
                                }

                                element.endTest = Math.min(element.examples.length, element.startTest + Math.round(element.examples.length / 5));
                                if (x === 4 && element.endTest < element.examples.length) {
                                    element.endTest = element.examples.length;
                                }

                                let arrSize = element.examples.length - 1;
                                for (let y = element.startTest; y < element.endTest; y++) {
                                    let msg = element.examples[y].text;
                                    if (checkForDuplicates(msg, element.intent, tobetested, tests))
                                        item.test.push(msg);
                                }

                                if (item.test.length > 0) {
                                    tobetested.push(item);
                                }
                            });
                            let objTest = {
                                workspace: wsoriginal,
                                allintents: intents,
                                tobetested: tobetested,
                                run: x
                            }

                            tests.push(objTest);
                        }
                        //let prmsTest = [];
                        let prmsTest = tests.map(createandTestWorkspace);
                        Promise.all(prmsTest).then(result => {
                            let allTests = [];
                            let summary = [];
                            result.forEach((e) => {
                                e.forEach((i) => {
                                    allTests.push(i);
                                    let intent = _.find(summary, { 'intent': i.correctIntent });
                                    if (!intent) {
                                        intent = {
                                            intent: i.correctIntent,
                                            total: 0,
                                            correct: 0,
                                            threshold: 0,
                                            examples: []
                                        }
                                        summary.push(intent);
                                    }
                                    intent.total++;
                                    intent.correct += (i.correctIntent === i.returnedIntent && i.confidence >= threshold) ? 1 : 0;
                                    intent.threshold += i.correctIntent === i.returnedIntent ? 1 : 0;
                                    intent.examples.push(i);
                                });
                            });

                            console.log('Sumário');
                            let total = 0;
                            let correct = 0;
                            let nothreshold = 0;
                            summary.forEach((e) => {
                                total += e.total;
                                correct += e.correct;
                                nothreshold += e.threshold;
                                e.confusionMatrix = createConfusionMatrix(summary, e.examples);
                                console.log("Intenção %s Perguntas %d Acertos %d Acurácia %s% Sem Threshold %s%", e.intent, e.total, e.correct, (e.correct / e.total * 100).toFixed(2), (e.threshold / e.total * 100).toFixed(2));
                            });
                            console.log("Total: Intenções %d Perguntas %d Acertos %d Acurácia %s% Sem Threshold %s%", summary.length, total, correct, (correct / total * 100).toFixed(2), (nothreshold / total * 100).toFixed(2));
                            runningTest = false;
                            return (callback(null, {
                                intentsNumber: summary.length,
                                examplesTotal: total,
                                acuracyThreshold: correct / total,
                                acuracy: nothreshold / total,
                                examplesCorrect: correct,
                                threshold: threshold,
                                intentsList: summary
                            }));
                        }).catch((err) => {
                            runningTest = false;
                            return callback(err, null);
                        });
                    }).catch((err) => {
                        runningTest = false;
                        return callback(err, null);
                    });
                });
            }
        })
    }

}

function checkForDuplicates(msg, intent, tobetested, tests) {
    let duplicate = false;
    let debug = (msg === 'como solicitar uma adequação técnica');
    //let debug = (msg === "durante a análise técnica, é possível solicitar uma adequação técnica");
    tobetested.forEach((tb) => {
        if (tb.intent === intent) {
            duplicate = duplicate || tb.test.indexOf(msg) > -1;
        }
    });
    if (!duplicate) {
        tests.forEach((t) => {
            t.tobetested.forEach((tb) => {
                if (tb.intent === intent) {
                    duplicate = duplicate || tb.test.indexOf(msg) > -1;
                }
            });
        });
    }
    return !duplicate;
}

function getExamples(element) {
    return new Promise(function (resolve, reject) {
        cs.getExamples({
            'workspace_id': workspace_id,
            'intent': element.intent
        }, (err, result) => {
            if (err) {
                reject(err);
            }
            let intent = {};
            intent.intent = element.intent;
            intent.examples = [];
            result.examples.forEach(function (element) {
                intent.examples.push({ 'text': element.text });
            });
            resolve(intent);
        });
    });
}

function createandTestWorkspace(objTest) {
    return new Promise(function (resolve, reject) {
        //criar nova workspace
        let wsnew = clone(objTest.workspace);
        wsnew.name += ' test ' + objTest.run;
        wsnew.intents = [];
        wsnew.tries = 0;
        objTest.allintents.forEach((i) => {
            let examples = [];
            i.examples.forEach((e) => {
                examples.push({
                    text: e.text
                });
            });
            wsnew.intents.push({
                intent: i.intent,
                examples: examples
            });
        });

        objTest.tobetested.forEach((toDelete) => {
            let intent = _.find(wsnew.intents, { 'intent': toDelete.intent });
            _.remove(intent.examples, (n) => {
                return toDelete.test.indexOf(n.text) > -1
            });
        });

        cs.createWorkspace(wsnew, (err, result) => {
            if (err) {
                console.error("Error on Conversation createWorkspace: %j", err);
            } else {
                wsnew.workspace_id = result.workspace_id;
                let runningWSCreation = false;
                let intervalId = setInterval(() => {
                    if (!runningWSCreation) {
                        runningWSCreation = true;
                        cs.getWorkspace({ 'workspace_id': wsnew.workspace_id }, (err, result) => {
                            runningWSCreation = false;
                            if (err) {
                                console.error("Error on Conversation getWorkspace 2: %j", err);
                                clearInterval(intervalId);
                                reject(err);
                            }
                            wsnew.tries++;
                            if (wsnew.tries === 20) {
                                deleteWorkspace(result.workspace_id);
                                clearInterval(intervalId);
                                reject({ msg: "General error when training workspace" });
                            }
                            console.log(wsnew.name, wsnew.tries, result.status);
                            if (result.status === 'Available') {
                                clearInterval(intervalId);
                                let promises = objTest.tobetested.map((e) => {
                                    return testConversation(e, wsnew.workspace_id)
                                });
                                let retpromises = [];
                                clearInterval(intervalId);
                                Promise.all(promises).then(intents => {
                                    retpromises = [];
                                    intents.forEach((i) => {
                                        i.forEach((e) => {
                                            retpromises.push(e);
                                        });
                                    });
                                }).catch((err) => {
                                    console.error(err);
                                    reject(err);
                                }).then(() => {
                                    let thissessionret = clone(retpromises);
                                    deleteWorkspace(result.workspace_id);
                                    resolve(thissessionret);

                                });

                            }
                        });
                    }
                }, Math.max(5000, 1000 + wsnew.intents.length * 100));
            }
        })
    });
}


function testConversation(element, wsid) {
    return new Promise(function (resolve, reject) {
        let erro = {}
        let promises = element.test.map((e) => {
            return sendMessage(e, wsid)
        });
        Promise.all(promises).then(result => {
            let tested = [];
            result.forEach((e) => {
                if (e.intents.length === 0) {
                    e.intents.push({
                        intent: "",
                        confidence: 0
                    });
                }

                tested.push({
                    example: e.input.text,
                    returnedIntent: e.intents[0].intent,
                    confidence: e.intents[0].confidence,
                    correctIntent: element.intent,
                    intents: e.intents
                });
            });
            resolve(tested);
        }).catch((err) => {
            console.error(err);
            reject(err);
        });
    });
}

function sendMessage(message, wsid, msg2) {
    return new Promise(function (resolve, reject) {
        let params = {
            input: {
                text: message
            },
            workspace_id: wsid,
            alternate_intents: true,
            context: {}
        };
        let cont = 0;

        cs.message(params, (err, result) => {
            if (err) {
                if (err.code === 'ENOTFOUND') {
                    resolve(sendMessage(message, wsid, message));
                } else {
                    console.error("Error on Conversation message. Workspace %s: %j", wsid, err);
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });

    });
}

function clone(obj) {
    if (null == obj) return obj;

    if ('object' == typeof obj) {

        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                copy[attr] = obj[attr];
            }
        }
        return copy;
    }
}

function createConfusionMatrix(intents, samples) {
    let confusionMatrix = new Array(intents.length);
    confusionMatrix.fill(0);
    samples.forEach((s) => {
        confusionMatrix[_.findIndex(intents, (o) => {
            return o.intent === s.returnedIntent
        })]++;
    });
    return confusionMatrix;
}

function deleteWorkspace(workspace_id) {
    cs.deleteWorkspace({ 'workspace_id': workspace_id }, (err, result) => {
        if (err) {
            console.error("Error on Conversation deleteWorkspace: %j", err);
        }
    });

}