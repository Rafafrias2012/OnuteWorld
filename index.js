var ws = require("ws");
var config = require("./config.js");
var server = new ws.Server({port: config.port});
var clients = [];
var count = 0;
var countip = {

}
var skins = config.skins;
class user{
constructor(raw){
this.raw = raw;
this.id = randgen();
}
send(msg){
this.raw.send(msg);
}
}
var room = {
main:{
clientlist:[],
users:{

}
}
}
server.on('connection', res=>{
if(config.max !== 0 && count >= config.max){
res.send("maxlimit");
res.close();
return;
}
if(countip[res.remoteAddress] == undefined){
countip[res.remoteAddress] = 0;
}
if(countip[res.remoteAddress] >= config.maxip && config.maxip !== 0){
res.send("maxiplimit");
res.close();
return
}
countip[res.remoteAddress] +=1;
count+=1;
var client = new user(res);
clients.push(client);
res.on('message', msg=>{
client = clients.find(egg=>{return egg.raw == res});
if(msg.toString().substring(0,5) == "room:"){
if(client.room == undefined){
if(room[msg.toString().replace("room:","")] == undefined){
room[msg.toString().replace("room:","")] = {
clientlist: [],
users:{

}
}
}
room[msg.toString().replace("room:","")]["users"][client.id] = ["Anonymous",Math.floor(Math.random()*1000),Math.floor(Math.random()*500),"","bonz"];
client.room = msg.toString().replace("room:","");
room[msg.toString().replace("room:","")]["clientlist"].push(client);
broadcast(room[client.room], JSON.stringify(room[client.room]["users"]));
}
} else if(msg.toString().substring(0,5) == "name:"){
if(client.room !== undefined){
var id = Object.keys(room[client.room]["users"]).find(egg=>{return client.id == egg});
room[client.room]["users"][id][0] = msg.toString().replace("name:","");
broadcast(room[client.room], JSON.stringify(room[client.room]["users"]));
}
} else if(msg.toString().substring(0,9) == "location:"){
if(client.room !== undefined){
var id = Object.keys(room[client.room]["users"]).find(egg=>{return client.id == egg});
room[client.room]["users"][id][1] = parseInt(msg.toString().replace("location:",""))-50;

broadcast(room[client.room], JSON.stringify(room[client.room]["users"]));
}
} else if(msg.toString().substring(0,10) == "locationy:"){
if(client.room !== undefined){
var id = Object.keys(room[client.room]["users"]).find(egg=>{return client.id == egg});
room[client.room]["users"][id][2] = parseInt(msg.toString().replace("locationy:",""))-100;

broadcast(room[client.room], JSON.stringify(room[client.room]["users"]));
}
}else if(msg.toString().substring(0,1)=="/"){
if(client.room !== undefined){
var comd = msg.toString().replace("/","");
var param = comd.substring(comd.indexOf(" ")+1, comd.length);
comd = comd.substring(0, comd.indexOf(" "));
if(comd == "name"){
room[client.room]["users"][client.id][0] = param;
broadcast(room[client.room], JSON.stringify(room[client.room]["users"]));
}
else if(comd == "foreskin"){
if(skins.includes(param)){

room[client.room]["users"][client.id][4] = param;
broadcast(room[client.room], JSON.stringify(room[client.room]["users"]));
}
}
}
}else{
if(client.room !== undefined){
var id = Object.keys(room[client.room]["users"]).find(egg=>{return client.id == egg});
room[client.room]["users"][id][3] = msg.toString();
broadcast(room[client.room], JSON.stringify(room[client.room]["users"]));
}
}
});
res.on("close", ()=>{
count-=1;
countip[res.remoteAddresss]-=1;
if(countip[res.remoteAddresss] == 0){
delete countip[res.remoteAddresss];
}
var client = clients.find(egg=>{return egg.raw == res});
if(client.room !== undefined){
delete room[client.room]["users"][client.id];
if(Object.keys(room[client.room]["users"]).length < 1){
delete room[client.room];
} else{

broadcast(room[client.room], JSON.stringify(room[client.room]["users"]));
}
}

clients.splice(clients.indexOf(client), 1);

});
});

function randgen(){
rand = Math.round(Math.random() * 10000000000000);
while(clients.find(egg=>{return egg.id == rand}) !== undefined){

rand = Math.round(Math.random() * 10000000000000);
}
return rand
}
function broadcast(room, message){
room.clientlist.forEach(client=>{
client.send(message);
});
}
