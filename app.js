const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "moviesData.db");
let db = null;

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    movieName: dbObject.movie_name,
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
    leadActor: dbObject.lead_actor,
  };
};

const initializedb = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`DB ERROR:${e.message}`);
    process.exit(1);
  }
};
initializedb();

//allmovienamesfromtable API 1
app.get("/movies/", async (request, response) => {
  const getPlayersQuery = `
 SELECT
 movie_name
 FROM
 movie;`;
  const movienamesArray = await db.all(getPlayersQuery);
  response.send(
    movienamesArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//postmovie
app.post("/movies/", async (request, response) => {
  const moviedetails = request.body;
  const { directorId, movieName, leadActor } = moviedetails;
  const addmoviequery = `INSERT INTO movie (director_id,movie_name,lead_actor) 
    VALUES (${directorId},'${movieName}','${leadActor}');`;
  const dbresponse = await db.run(addmoviequery);
  const movieId = dbresponse.lastID;
  response.send("Movie Successfully Added");
});

//getmovie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getonemoviequery = `select * from movie where movie_id=${movieId};`;
  const singlemovie = await db.get(getonemoviequery);
  response.send(convertDbObjectToResponseObject(singlemovie));
});

//updatemovie
app.put("/movies/:movieId/", async (request, response) => {
  const moviedetails = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = moviedetails;
  const updatemoviequery = `UPDATE movie
  SET director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}' where movie_id=${movieId};`;
  await db.run(updatemoviequery);
  response.send("Movie Details Updated");
});

//deletemovie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deletemoviequery = `DELETE from movie where movie_id=${movieId};`;
  await db.run(deletemoviequery);
  response.send("Movie Removed");
});

//getdirectors
app.get("/directors/", async (request, response) => {
  const alldirectorsquery = `select * from director;`;
  const directorsarray = await db.all(alldirectorsquery);
  response.send(
    directorsarray.map((each) => convertDbObjectToResponseObject(each))
  );
});

//getmoviesbydirector
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getdirectormoviequery = `select * from movie naturaljoin director where director_id=${directorId};`;
  const directormovie = await db.all(getdirectormoviequery);
  response.send(convertDbObjectToResponseObject(directormovie));
});

module.exports = app;
