const ip = require("ip");
const Redis = require("ioredis");
const fs = require('fs');
const path = require('path');
const qs = require('qs');

let REDIS_URL;
if(ip.address()==='192.168.178.163'){
    //external redit url (app not hosted on render)
    REDIS_URL = "rediss://red-cdtu0b6n6mphqqaf13tg:ZSV8LphqFkNp9qVMcuVaIILzAEBUHLFg@frankfurt-redis.render.com:6379";
} else {
    REDIS_URL = "redis://red-cdtu0b6n6mphqqaf13tg:6379"; //internal redis url
};

const renderRedis = new Redis(REDIS_URL);

let participants;
const participantsString = renderRedis.keys('*').then(result => {
    console.log(result);
    participants = result;
    participants.sort();
    participants.reverse();
    let participantsTags = participants.map(function(elt) {
        elt = "<div class='participant'>" + elt + "</div>"
        return elt;
    });
    participantsTags = participantsTags.join('+').replaceAll('+', '');
    return participantsTags;
});

function homeRoute(req, res){
    if(req.url==="/"){
        /* if(req.headers?.cookie){ //we redirect if the cookie has been set
            const cookie = req.headers.cookie
            const charIdx = cookie.indexOf('=');
            let drawnName = cookie.slice(charIdx+1);
            res.statusCode = 302;
            res.setHeader('Content-Type', 'text/html');
            render('header', res);
            render('problem', res, '', '', '', '', drawnName);
            render('footer', res);
            res.end();
        } else { */
            participantsString.then(participantsStr => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                render('header', res);
                render('index', res, participantsStr);
                render('footer', res);
                res.end();
            });
        //};
    };
};

function parseName(postBody){
    let name = postBody.toString();
    name = qs.parse(name);
    name = Object.keys(name)[0];
    return name;
}

function explanationRoute(req, res){
    if(req.url==="/explanation"){
        if(req.method.toLowerCase()==="post"){
            req.on("data", function(postBody){
                const name = parseName(postBody);
                console.log(name);
                renderRedis.get(name).then((result) => {
                    if (result.length === 0){
                        res.statusCode = 302;
                        res.setHeader('Content-Type', 'text/html');
                        render('header', res);
                        render('explanation', res, name);
                        render('footer', res);
                        res.end();
                    } else {
                        res.statusCode = 418; // 418 I'm a teapot
                        res.setHeader('Content-Type', 'text/html');
                        render('header', res);
                        render('error', res);
                        render('footer', res);
                        res.end();
                    };
                });
            });
        };
    };
};

function wheelRoute(req, res){
    if(req.url==="/fortune-wheel" && req.method.toLowerCase()==="post"){
        req.on("data", function(postBody){
            const name = parseName(postBody);
            renderRedis.get(name).then((result) => {
                if(result.length === 0){
                    console.log(name);
                    const filteredParticipants = participants.filter(participant => participant != name);
                    console.log(filteredParticipants);
                    
                    const filter = (key, possiblematches) => renderRedis.get(key).then((value) => {
                        if( value == name){
                            possiblematches = possiblematches.filter(participant => participant != key);
                        };
                        //must make sure that 2 persons do not draw the same person
                        if (value.length > 0){
                            let drawnParticipant = value;
                            //console.log(drawnParticipant);
                            possiblematches = possiblematches.filter(participant => participant != drawnParticipant);
                        };
                        return possiblematches
                    });

                    async function myloop(){
                        let possiblematches = filteredParticipants;
                        for (const key of participants) {
                            possiblematches = await filter(key, possiblematches);
                        };
                        return possiblematches;
                    };

                    myloop().then(result=>{console.log("possible matches: " + result)});
                    
                    const pushParticipants = myloop().then(possibleMatches => {
                        const participantsL = []; //this will contain the list of possible drafts
                        for(let i=0; i<filteredParticipants.length; i++){
                            const participantName = filteredParticipants[i];
                            if (possibleMatches.includes(participantName)) {
                                const person = {};
                                person.name = participantName;
                                person.index = i;
                                participantsL.push(person);
                            };
                        };
                        return participantsL;
                    }); //end myloop()

                    const firstLetters = filteredParticipants.map(elt => {
                        return elt[0];
                    });
                    console.log("nb of letters: " + firstLetters.length);
                    let sectors = "";
                    for(let i=0; i<firstLetters.length; i++){
                        sectors += `<div class='sector'>${firstLetters[i]}</div>`;
                    };
                    pushParticipants.then(participantsL => {
                        const rand = Math.floor(Math.random() * participantsL.length);
                        const draw = participantsL[rand].index;
                        const drawName = participantsL[rand].name;
                        console.log("participant draw " + drawName);
                        renderRedis.set(name, drawName);
                        const cookie = `draft=${drawName}`;
                        res.setHeader('Set-Cookie', cookie);

                        res.statusCode = 302;
                        res.setHeader('Content-Type', 'text/html');
                        render('header', res);
                        render('fortune-wheel', res, name, sectors, draw, drawName);
                        render('footer', res);
                        res.end();
                    });
                } else {
                    res.statusCode = 418; // 418 I'm a teapot
                    res.setHeader('Content-Type', 'text/html');
                    render('header', res);
                    render('problem', res);
                    render('footer', res);
                    res.end();
                };
            });
        });
    };
};

function displayStatic(req, res, filePath, contentType){
    if(req.url === filePath) {
        fs.readFile("." + filePath, (err, content) => {
            if(err){console.log(err);} else {
                res.statusCode = 200;
                res.setHeader('Content-Type', contentType);
                res.end(content);
            };
        });
    };
};

function static(req, res){
    fs.readdir('./static', (err, files) => {
        if(err){console.log(err);} else {
            let contentType
            files.forEach(file => {
                if (path.extname(file) === '.mjs' || path.extname(file) === '.js'){
                    contentType = 'application/javascript';
                } else if (path.extname(file) === '.css'){
                    contentType = 'text/css';
                } else if (path.extname(file) === '.png'){
                    contentType = 'image/png';
                }
                displayStatic(req, res, "/static/" + file, contentType);
            });
        };
    });
};

function render(templateName, res, replacingValues='', sectors='', integer=null, drawName='', cookie=''){
    let fileContents = fs.readFileSync('./views/' + templateName + '.html', 'utf-8').replaceAll('{{}}', replacingValues);
    if(sectors.length>0){
        res.write(fileContents.replace('{{sectors}}', sectors).replace("{integer}", integer).replace("{{draft}}", drawName));
    } else if(cookie.length>0){
        res.write(fileContents.replace('{{name}}', cookie));
    } else {
        res.write(fileContents);
    };
};

module.exports.home = homeRoute;
module.exports.static = static;
module.exports.explanation = explanationRoute;
module.exports.wheel = wheelRoute;