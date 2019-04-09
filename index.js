
$(document).ready(function () {
  init();
});

var stats = {
  startingLocations: [],
  climbingLocations: []
}

function init() {
  // getDataForTeam(1741);

  $("#doTeamStats").click(function (e) {
    var selectedTeamNumber = $("#teamKey").val();
    getDataForTeam(selectedTeamNumber);
  })

  $("#doEventStats").click(function (e) {
    var selectedEventKey = $("#eventKey").val();
    getTeamKeysForEvent(selectedEventKey);
  })
}

function getDataForTeam(teamNumber) {
  var endpoint = `https://www.thebluealliance.com/api/v3/team/${selectedTeamKey(teamNumber)}/matches/2019`

  $.getJSON(urlWithAuth(endpoint), function (matches) {
    doStatsThings(teamNumber, matches);
  });
}

function getTeamKeysForEvent(eventKey) {
  var endpoint = `https://www.thebluealliance.com/api/v3/event/${eventKey}/teams/keys`;

  $.getJSON(urlWithAuth(endpoint), function (teams) {
    teams = teams.sort();
    for (let i = 0; i < teams.length; i++) {
      var teamNumber = teams[i].slice(3);
      getDataForTeam(teamNumber);
    }
  });
}

function doStatsThings(teamNumber, matches) {
  var startingLocations = {};
  var climbingLocations = {};

  for (var i = 0; i < matches.length; i++) {
    var match = matches[i];
    var teamPosition = getTeamPosition(teamNumber, match);

    var startingLocation = getStartingLocation(
      teamPosition["color"],
      teamPosition["position"],
      match
    );
    var climbingLocation = getClimbingLocation(
      teamPosition["color"],
      teamPosition["position"],
      match
    );

    startingLocations = addCountToObject(startingLocations, startingLocation)
    climbingLocations = addCountToObject(climbingLocations, climbingLocation)
  }

  stats.startingLocations.push({
    teamNumber: teamNumber,
    locations: {
      HabLevel2: startingLocations["HabLevel2"] || 0,
      HabLevel1: startingLocations["HabLevel1"] || 0,
      None: startingLocations["None"] || 0
    }
  });
  stats.climbingLocations.push({
    teamNumber: teamNumber,
    locations: {
      HabLevel3: climbingLocations["HabLevel3"] || 0,
      HabLevel2: climbingLocations["HabLevel2"] || 0,
      HabLevel1: climbingLocations["HabLevel1"] || 0,
      None: climbingLocations["None"] || 0
    }
  });

  stats.startingLocations = stats.startingLocations.sort(function (a, b) {
    return a.teamNumber - b.teamNumber
  });
  stats.climbingLocations = stats.climbingLocations.sort(function (a, b) {
    return a.teamNumber - b.teamNumber
  });

  render();
}

function render() {
  var header = `
    <tr>
      <td>Team Number</td>
      <td>S: HAB 2</td>
      <td>S: HAB 1</td>
      <td>S: None</td>
      <td>C: HAB 3</td>
      <td>C: HAB 2</td>
      <td>C: HAB 1</td>
      <td>C: None</td>
    </tr>
  `;

  var teams = "";
  for (let i = 0; i < stats.startingLocations.length; i++) {
    const startingLocation = stats.startingLocations[i];
    const climbingLocation = stats.climbingLocations[i];
    console.log(climbingLocation.teamNumber);
    console.log(climbingLocation.locations);

    teams += `
      <tr>
        <td>${startingLocation.teamNumber}</td>
        <td>${startingLocation.locations["HabLevel2"]}</td>
        <td>${startingLocation.locations["HabLevel1"]}</td>
        <td>${startingLocation.locations["None"]}</td>

        <td>${climbingLocation.locations["HabLevel3"]}</td>
        <td>${climbingLocation.locations["HabLevel2"]}</td>
        <td>${climbingLocation.locations["HabLevel1"]}</td>
        <td>${climbingLocation.locations["None"]}</td>
      </tr>
    `;
  }

  $('#habStats').html(header + teams)
}

function addCountToObject(object, key) {
  var current = object[key] || 0;
  object[key] = current + 1;
  return object;
}

function getStartingLocation(color, position, match) {
  var locationKey = `preMatchLevelRobot${position}`;
  return match.score_breakdown[color][locationKey];
}

function getClimbingLocation(color, position, match) {
  var locationKey = `endgameRobot${position}`;
  return match.score_breakdown[color][locationKey];
}

function getTeamPosition(teamNumber, match) {
  // Check if they're on red; if they're not, they must be on blue...
  var redAlliance = match.alliances.red.team_keys;
  var blueAlliance = match.alliances.blue.team_keys;

  // Loop over the red teams
  for (let i = 0; i < redAlliance.length; i++) {
    if (redAlliance[i] == selectedTeamKey(teamNumber)) {
      return {
        color: "red",
        position: i + 1
      }
    }
  }

  // Loop over the blue teams
  for (let i = 0; i < blueAlliance.length; i++) {
    if (blueAlliance[i] == selectedTeamKey(teamNumber)) {
      return {
        color: "blue",
        position: i + 1
      }
    }
  }
  console.error("TEAM NOT FOUND IN MATCH")
}




function selectedTeamKey(teamNumber) {
  return `frc${teamNumber}`
}

function urlWithAuth(url) {
  var API_KEY = "ICh6EZ01IHFFi9oZuS4t6Q7sm1zcvZDf0BBCRkgpviQ0HYlcgYfupNUJhCAXqnIl"
  return `${url}?X-TBA-Auth-Key=${API_KEY}`;
}
