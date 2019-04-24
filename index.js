
$(document).ready(function () {
  init();
});

var divisions = {
  "2019ingre": {}
}

function init() {
  $("#doDistrictMatches").click(function (e) {
    var selectedDistrictKey = $("#districtKey").val();
    getTeamsForDistrict(selectedDistrictKey);
  })
}

function getTeamsForDistrict(districtKey) {
  var endpoint = `district/2019${districtKey}/teams/keys`

  $.getJSON(urlWithAuth(endpoint), function (teams) {
    teams = teams.sort();
    getTeamMatchesForChamps(teams)
  });
}

function getTeamMatchesForChamps(teams) {
  for (let i = 0; i < teams.length; i++) {
    var teamKey = teams[i]
    getMatchesForTeam(teamKey);
  }
}

function getMatchesForTeam(teamKey) {
  Object.keys(divisions).forEach(eventKey => {
    var endpoint = `team/${teamKey}/event/${eventKey}/matches`

    $.getJSON(urlWithAuth(endpoint), function (matches) {
      addMatches(matches)
    });
  });
}

function addMatches(matches) {
  matches.forEach(match => {
    divisions[match.event_key][match.key] = match
  })
  render()
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
      <td>Comp Level</td>
      <td>Match Number</td>
      <td>Time</td>
      <td>R1</td>
      <td>R2</td>
      <td>R3</td>
      <td>B1</td>
      <td>B2</td>
      <td>B3</td>
    </tr>
  `;

  var matches = "";

  Object.keys(divisions).forEach(divisionKey => {
    let division = divisions[divisionKey]
    Object.keys(division).forEach(matchKey => {
      const match = divisions[divisionKey][matchKey]


      matches += `
      <tr>
        <td>${match.comp_level}</td>
        <td>${match.match_number}</td>
        <td>${match.time}</td>

        <td>${teamNumberFromKey(match.alliances.red.team_keys[0])}</td>
        <td>${teamNumberFromKey(match.alliances.red.team_keys[1])}</td>
        <td>${teamNumberFromKey(match.alliances.red.team_keys[2])}</td>

        <td>${teamNumberFromKey(match.alliances.blue.team_keys[0])}</td>
        <td>${teamNumberFromKey(match.alliances.blue.team_keys[1])}</td>
        <td>${teamNumberFromKey(match.alliances.blue.team_keys[2])}</td>
      </tr>
    `;
    });
  });

  $('#matchInfo').html(header + matches)
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

function teamNumberFromKey(teamKey) {
  return teamKey.slice(3)
}

function urlWithAuth(url) {
  var API_KEY = "ICh6EZ01IHFFi9oZuS4t6Q7sm1zcvZDf0BBCRkgpviQ0HYlcgYfupNUJhCAXqnIl"
  return `https://www.thebluealliance.com/api/v3/${url}?X-TBA-Auth-Key=${API_KEY}`;
}
