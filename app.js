const express = require("express");
const app = express();
app.use(express.json());
module.exports = app;

const path = require("path");
dbPath = path.join(__dirname, "cricketTeam.db");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error : ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//list of all players
app.get("/players/", async (request, response) => {
  const listOfPlayersQuery = `
    SELECT 
    player_id AS playerId ,
    player_name AS playerName ,
    jersey_number AS jerseyNumber ,
    role
    FROM cricket_team  `;
  const listOfPlayers = await db.all(listOfPlayersQuery);
  response.send(listOfPlayers);
});

//a new player in the team
app.post("/players/", async (request, response) => {
  const bookDetails = request.body;
  const { playerName, jerseyNumber, role } = bookDetails;

  const addPlayerQuery = `
        INSERT INTO
        cricket_team( player_name , jersey_number , role )
        VALUES 
        ('${playerName}',${jerseyNumber},'${role}') ; `;

  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//player based on a player ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    SELECT 
    player_id AS playerId ,
    player_name AS playerName ,
    jersey_number AS jerseyNumber ,
    role 
    FROM cricket_team 
    WHERE player_id = ${playerId} ;`;
  const player = await db.get(playerQuery);
  response.send(player);
});

//Updates the details of a player in the team (database) based on the player ID
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
    UPDATE cricket_team 
    SET 
    player_id = ${playerId} ,
    player_name = '${playerName}' ,
    jersey_number = ${jerseyNumber} ,
    role = '${role}' 
    WHERE player_id = ${playerId}; `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Deletes a player from the team (database) based on the player ID
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM cricket_team
    WHERE player_id = ${playerId} ;`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
