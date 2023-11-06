const express = require("express");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
app.use(express.json());
const dataPath = path.join(__dirname, "covid19India.db");
const initializeAndDbServer = async () => {
  try {
    database = await open({
      filename: dataPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at: https://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeAndDbServer();
const convertStateIntoResponse = (dbObject) => {
  return {
    stateId: dbObject.movie_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};
const convertDistrictIntoResponse = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObjects.deaths,
  };
};

//API 1
app.get("/states", async (request, response) => {
  const getStates = `SELECT * FROM state ORDER BY state_id;`;
  const stateArr = await database.all(getStates);
  const result = stateArr.map((state) => {
    return convertStateIntoResponse(state);
  });
  response.send(result);
});
//API 2
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getState = `SELECT * FROM state where state_id = ${stateId};`;
  const state = await database.get(getState);
  response.send(convertStateIntoResponse(state));
});

//API 3
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const addDistrict = `INSERT INTO district(district_name,state_id,cases,cured,active,deaths)
                        values ('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
  await database.run(addDistrict);
  response.send("District Successfully Added");
});

//API 4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrict = `SELECT * FROM DISTRICT where district_id=${districtId};`;
  const district = database.get(getDistrict);
  response.send(convertDistrictIntoResponse(district));
});
//API 5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrict = `DELETE FROM district where district_id =${districtId};`;
  await database.run(deleteDistrict);
  response.send("District Removed");
});
//API 6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updateDistrict = `UPDATE value(districtName,stateId,cases,cured,active,deaths)
                        SET district_name = '${districtName}',
                        state_id=${stateId},
                        cases = ${cases},
                        cured = ${cured},
                        active = ${active},
                        deaths = ${deaths}
                    where district_id = ${districtId};`;
  await database.run(updateDistrict);
  response.send("District Details Updated");
});

//API 7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const statistics = `SELECT sum(cases) as totalCases,
                                    sum(cured) as totalCured,
                                    sum(active) as totalCured,
                                    sum(deaths) as totalDeaths
                                    
                                FROM district where state_id=${stateId};`;
  const stateArray = await database.get(statistics);
  response.send(stateArr);
});
//API 8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const districtQuery = `SELECT state_id from district where district_id = ${districtId};`;
  const queryResponse = await database.get(districtQuery);
  const stateNameQuery = `select state_name as stateName from state where state_id = ${queryResponse.state_id};`;
  const getStateNameQueryResponse = await database.get(stateNameQuery);
  response.send(getStateNameQueryResponse);
});

module.exports = app;
