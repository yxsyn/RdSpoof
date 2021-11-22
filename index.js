const fetch = require('node-fetch');
const mysql = require('mysql');
const { exit } = require('process');
const ipInt = require('ip-to-int');
var fs = require('fs')

var con   = mysql.createPool({
    host     : "176.31.199.121",
    user     : "admin",
    password : "89SilyoqK8sqqCQi7tDWNKcZNHOjiMDC",
    database : "ModernRoleplay"
});

function QueryDb(sql, cb){
    con.getConnection(function(err, connection) {
      if (err) {
          console.log(err)
          return
        }    
      connection.query(sql, function (err, result) {
          connection.release();
        if (err) {
          console.log(err)
          return
        }
        cb(result).catch(function(error) {
            console.error(error);
          });
      });
    });
  }

var get = 0

function int2ip (ipInt) {
    return ( (ipInt>>>24) +'.' + (ipInt>>16 & 255) +'.' + (ipInt>>8 & 255) +'.' + (ipInt & 255) );
}

fetch('https://servers-frontend.fivem.net/api/servers/single/'+process.argv[2]+'')
.then(res => res.json())
.then(json => {
    console.log("Start to GET : " + json.Data.players.length)
    fs.writeFile('ip-get.txt', '', function(){})
    var logger = fs.createWriteStream('ip-get.txt', {
        flags: 'a' // 'a' means appending (old data will be preserved)
      })      
    for(var identifier in json.Data.players){
        QueryDb("SELECT * FROM `account_info` WHERE `license` = '"+json.Data.players[identifier].identifiers[0]+"'", async function(result) {
            if(result[0]) {
                get = get + 1
                var ipdec = ipInt(result[0].ip).toInt()
                console.log("Found IP : " + result[0].ip)
                logger.write(ipdec.toString() + "\n")
                if(get == json.Data.players.length) {
                    logger.end();
                    exit(1);
                }
            }else{
                get = get + 1
                // console.log("Not Found IP | Lenght : " + get)
                if(get == json.Data.players.length) {
                    logger.end();
                    exit(1);
                }
            }
        })
    }    
});
