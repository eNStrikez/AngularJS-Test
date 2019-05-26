let http = require('http');
let fs = require('fs');
let url = require('url');
let mime = require('mime');
let path = require('path');
let sqlite = require('sqlite3').verbose();

let Traveler = require('the-traveler').default;
let Manifest = require('the-traveler/build/Manifest');
const Enums = require('the-traveler/build/enums');
const destinyPath = "/destiny/";

const traveler = new Traveler({
    apikey: '8772b2e2b07b465e9ce39bd9b51184f6',
    userAgent: 'eNStrikez%232333'
});
let db = new sqlite.Database('./manifest.content');


traveler.getDestinyManifest().then(result => {
    traveler.downloadManifest(result.Response.mobileWorldContentPaths.en, './manifest.content').then(filepath => {
        console.log(filepath);
        db = new sqlite.Database(filepath);
		console.log("Manifest loaded");
    }).catch(err => {
        console.log(err);
        db = new sqlite.Database(filepath);
		console.log("Cached manifest loaded");
    })
})



http.createServer(function (req, res) {
  	let q = url.parse(req.url, true);
  	if (q.pathname === "/destiny.itm") {
		res.writeHead(200, {'Content-Type': 'text/json'});
		db.serialize(function(){
			let query = "SELECT json FROM DestinyInventoryItemDefinition";
			let items = '{"items":[ ';
			
			db.each(query, function(err, row){
				if(err) console.log("Error: " + err);
				items = items + JSON.stringify(row.json) + ",";	
			}, function(){
				items = items.slice(0,-1);
				items += ']}';
				res.write(items);
				return res.end();
			});			
		});
		
  	} else if (q.pathname === "/elements.itm") {
		res.writeHead(200, {'Content-Type': 'text/json'});
		db.serialize(function(){
			let query = "SELECT json FROM DestinyDamageTypeDefinition";
			let items = '{"items":[ ';
			db.each(query, function(err, row){
				if(err) console.log("Error: " + err);
				items = items + JSON.stringify(row.json) + ",";	
			}, function(){
				items = items.slice(0,-1);
				items += ']}';
				res.write(items);
				return res.end();
			});		
			
		});
  	} else if (path.extname(q.pathname) == '.itm') {
  		let hash = q.pathname.slice(1, -4).split('.')[0];
		res.writeHead(200, {'Content-Type': 'text/json'});
		db.serialize(function(){
			let query = "SELECT json FROM DestinyInventoryItemDefinition WHERE id + 4294967296 = " + hash + " OR id = " + hash;
			
			db.each(query, function(err, row){
				if(err) console.log("Error: " + err);
				res.write(row.json);
				return res.end();
			});
				
		});

	}  else {
	  	let filename = "." + q.pathname;
	  	fs.readFile(filename, function(err, data) {
		    if (err) {
		      	res.writeHead(404, {'Content-Type': 'text/html'});
		      	return res.end("404: " + filename + " Not Found");
		    }
		    res.writeHead(200, {'Content-Type': mime.getType(filename)});
		    res.write(data);
		    return res.end();
		});
  	}
}).listen(8080);