exports.initialize = function() {
  var io = MMO_Core["socket"].socketConnection;

  io.on("connect", function(client) {

    // Handle players joining a map
    client.on("map_joined", async function(playerData) {
      if(client.playerData === undefined) return;
      
      if(client.lastMap != undefined && client.lastMap != "map-" + playerData.mapId) {
        if(MMO_Core["database"].SERVER_CONFIG["offlineMaps"][client.lastMap] == undefined) client.broadcast.to(client.lastMap).emit('map_exited',client.id);
        client.leave(client.lastMap);
  
        MMO_Core["security"].createLog(client.playerData.username + " left " + client.lastMap);
      }
  
      playerData.username = client.playerData.username; // Temporary way to pass the username
      playerData.skin     = client.playerData.skin;
  
      // Storing the new location (in case of disconnecting on a local map)
      client.playerData.x     = playerData.x;
      client.playerData.y     = playerData.y;
      client.playerData.mapId = parseInt(playerData.mapId);
  
      // Update global switches
      for(var key in MMO_Core["database"].SERVER_CONFIG["globalSwitches"]) {
        client.emit("player_update_switch", {switchId: key, value: MMO_Core["database"].SERVER_CONFIG["globalSwitches"][key]});
      }
  
      client.join("map-" + playerData["mapId"]);
      client.lastMap = "map-" + playerData["mapId"];
  
      if(MMO_Core["database"].SERVER_CONFIG["offlineMaps"][client.lastMap] == undefined) {
        client.broadcast.to("map-" + playerData["mapId"]).emit("map_joined",{id:client.id,playerData:playerData});
        client.broadcast.to("map-" + playerData["mapId"]).emit("refresh_players_position", client.id);
      }

      let payload = { 
        "username": client.playerData.username,  
        "mapId": parseInt(playerData["mapId"]),
        "x": playerData.x,
        "y": playerData.y
      };

      MMO_Core["security"].createLog(client.playerData.username + " joined " + client.lastMap);
    })

    // Refresh position of players when map joined
    client.on("refresh_players_position", function(data){
      if(client.playerData === undefined) return;
      
      if(MMO_Core["database"].SERVER_CONFIG["offlineMaps"][client.lastMap] != undefined) return false;
  
      MMO_Core["security"].createLog(client.playerData.username + " transmitted its position to " + data.id);
  
      data["playerData"].username = client.playerData.username; // Temporary way to pass the username
      data["playerData"].skin     = client.playerData.skin;
  
      client.broadcast.to(data["id"]).emit("map_joined",{id: client.id, playerData: data["playerData"]});
    })
  
    // Refresh single player on map
    client.on("refresh_players_on_map", function() {
      if(client.playerData === undefined) return;
  
      client.broadcast.to("map-" + client.playerData["mapId"]).emit("refresh_players_on_map", {playerId: client.id, playerData: client.playerData});   
    })
  })
}