
$(document).ready(function () {
  init();
});

// var divisions = {
//   "2019ingre": {}
// }
var divisions = {
  "2019alhu": {}
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
    sortMatches(divisionKey)
    let division = divisions[divisionKey]

    Object.keys(division).forEach(matchKey => {
      const match = divisions[divisionKey][matchKey]

      const d = new Date(match.time * 1000);
      const time = d.toLocaleTimeString();

      matches += `
      <tr>
        <td>${match.comp_level}</td>
        <td>
          ${match.match_number}${match.comp_level != "qm" ? `-${match.set_number}` : ""}
        </td>
      <td>${time}</td>

      <td>${teamNumberFromKey(match.alliances.red.team_keys[0])}</td>
      <td>${teamNumberFromKey(match.alliances.red.team_keys[1])}</td>
      <td>${teamNumberFromKey(match.alliances.red.team_keys[2])}</td>

      <td>${teamNumberFromKey(match.alliances.blue.team_keys[0])}</td>
      <td>${teamNumberFromKey(match.alliances.blue.team_keys[1])}</td>
      <td>${teamNumberFromKey(match.alliances.blue.team_keys[2])}</td>
      </tr >
      `;
    });
  });

  $('#matchInfo').html(header + matches)
}

function sortMatches(divisionKey) {
  let division = divisions[divisionKey]
  divisions[divisionKey] = Object.fromEntries(Object.entries(division).sort(function (a, b) {
    return a[1].time - b[1].time
  }))
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
