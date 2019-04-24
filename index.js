
$(document).ready(function () {
  init();
});

var divisions = {
  "2019arc": {},
  "2019cars": {},
  "2019cur": {},
  "2019dal": {},
  "2019dar": {},
  "2019tes": {},
  "2019cmpmi": {}
}

// var divisions = {
//   "2019alhu": {}
// }

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
  let contentText = ""
  Object.keys(divisions).forEach(divisionKey => {
    var divisionText = `
      <h3>${divisionKey}</h3>
      <table>
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

    sortMatches(divisionKey)
    let division = divisions[divisionKey]

    Object.keys(division).forEach(matchKey => {
      const match = divisions[divisionKey][matchKey]

      const d = new Date(match.time * 1000);
      const time = d.toLocaleTimeString();

      var matchesText = "";

      matchesText += `
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

      divisionText += matchesText
    });

    divisionText += "</table><br><br>"
    contentText += divisionText
  });


  $('#matchInfo').html(contentText)
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
