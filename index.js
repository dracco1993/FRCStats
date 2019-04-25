
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
//   "2019alhu": {},
//   "2019mosl": {},
//   "2019ingre": {}
// }

var rankings = []

var districtTeams = []

function init() {
  // Do a forced load on the initial page load
  reset()

  // Add the select change listener
  $("#selectedDistrict").change(function (e) {
    gtag('event', 'district_dimension', { 'district': $("#selectedDistrict").val() });

    reset()
  })
}

function reset() {
  // Reset all of the "global" variables
  divisions = {
    "2019arc": {},
    "2019cars": {},
    "2019cur": {},
    "2019dal": {},
    "2019dar": {},
    "2019tes": {},
    "2019cmpmi": {}
  }
  rankings = []
  districtTeams = []

  var selectedDistrictKey = $("#selectedDistrict").val();
  getTeamsForDistrict(selectedDistrictKey);
}

function getRankingsFor(division) {
  var endpoint = `event/${division}/rankings`

  $.getJSON(urlWithAuth(endpoint), function (rankingStats) {
    // If this division doesn't hang rankings
    // please don't break the rest of them...
    if (rankingStats.rankings != null) {
      rankingStats.rankings.forEach(rank => {
        let teamNumber = rank.team_key

        if (isDistrictTeam(teamNumber)) {
          rankings.push({
            ...rank,
            division: division
          })
        }
      })
    }
  });
}

function getTeamsForDistrict(districtKey) {
  var endpoint = `district/2019${districtKey}/teams/keys`

  $.getJSON(urlWithAuth(endpoint), function (teams) {
    teams = teams.sort();
    teams.forEach(team => {
      districtTeams.push(team)
    });

    // Get the rankings and matches for each division
    Object.keys(divisions).forEach(division => {
      getRankingsFor(division)
      getMatchesForDivision(division)
    });
  });
}

function getMatchesForDivision(division) {
  var endpoint = `event/${division}/matches`

  $.getJSON(urlWithAuth(endpoint), function (matches) {
    var districtMatches = []

    matches.forEach(match => {
      // Check to see if any of the match teams are in the district
      // This is ugly, but it's not _terrible_
      let isDistrictMatch =
        isDistrictTeam(match.alliances.red.team_keys[0]) ||
        isDistrictTeam(match.alliances.red.team_keys[1]) ||
        isDistrictTeam(match.alliances.red.team_keys[2]) ||
        isDistrictTeam(match.alliances.blue.team_keys[0]) ||
        isDistrictTeam(match.alliances.blue.team_keys[1]) ||
        isDistrictTeam(match.alliances.blue.team_keys[2])

      if (isDistrictMatch) {
        districtMatches.push(match)
      }
    });

    addMatches(districtMatches)
  });
}

function addMatches(matches) {
  matches.forEach(match => {
    divisions[match.event_key][match.key] = match
  })
  render()
}

function render() {
  // Render the ranking section
  let rankingText = renderRankings()
  $('#rankInfo').html(rankingText)

  // Render the division matches section
  let divisionListText = ""
  Object.keys(divisions).forEach(divisionKey => {
    divisionListText += renderDivision(divisionKey)
  });
  $('#matchInfo').html(divisionListText)

  // Render the all matches section
  let allMatchText = renderAllMatches()
  $('#allMatchInfo').html(allMatchText)
}

function renderRankings() {
  let result = `
    <h3>Rankings</h3>
    <table>
      <tr>
        <td>Team</td>
        <td>Rank</td>
        <td>Division</td>

      </tr>
  `

  // Sort by rank first, then team number
  rankings = rankings.sort(function (a, b) {
    if (a.rank != b.rank) {
      return a.rank - b.rank
    } else {
      return teamNumberFromKey(a.team_key) - teamNumberFromKey(b.team_key)
    }
  })

  // Render the individual rows
  rankings.forEach(rank => {
    result += `
      <tr>
      <td>${teamNumberFromKey(rank.team_key)}</td>
      <td>${rank.rank}</td>
      <td>${eventNameFrom(rank.division)}</td>
      </tr>
    `
  });

  result += "</table><br>"

  return result
}

function renderDivision(divisionKey) {
  // Get the matches
  let division = divisions[divisionKey]

  // Sort them
  division = sortMatches(division)

  // Save them
  divisions[divisionKey] = division

  return renderTableContents(divisionKey, division)
}

function renderAllMatches() {
  let allMatches = {}
  Object.keys(divisions).forEach(divisionKey => {
    allMatches = {
      ...allMatches,
      ...divisions[divisionKey]
    }
  });

  // Sort them after we have them all added
  allMatches = sortMatches(allMatches)

  return renderTableContents("All Matches", allMatches, true)
}

function renderTableContents(title, division, renderEvent = false) {
  var result = `
      <h3>${eventNameFrom(title)} (${title})</h3>
      <table>
      <tr>
        ${renderEvent ? "<td>Event</td>" : ""}
        <td>Comp Level</td>
        <td>Match Number</td>
        <td>Time</td>

        <td>R1</td>
        <td>R2</td>
        <td>R3</td>

        <td>B1</td>
        <td>B2</td>
        <td>B3</td>

        <td>Red RP</td>
        <td>Blue RP</td>
      </tr>
    `;

  Object.keys(division).forEach(matchKey => {
    const match = division[matchKey]

    const d = new Date(match.time * 1000);
    const time = d.toLocaleTimeString();

    let redTeamKeys = match.alliances.red.team_keys;
    let blueTeamKeys = match.alliances.blue.team_keys;

    let redRP = match.score_breakdown ? match.score_breakdown.red.rp : "---";
    let blueRP = match.score_breakdown ? match.score_breakdown.blue.rp : "---";

    var matchesText = "";

    matchesText += `
        <tr>
          ${renderEvent ? `<td>${eventNameFrom(match.event_key)}</td>` : ""}
          <td>${match.comp_level}</td>
          <td>
            ${match.match_number}${match.comp_level != "qm" ? `-${match.set_number}` : ""}
          </td>
        <td>${time}</td>

        <td class="${isDistrictTeam(redTeamKeys[0]) ? "redDistrictTeam" : ""}">
          ${teamNumberFromKey(redTeamKeys[0])}
        </td>
        <td class="${isDistrictTeam(redTeamKeys[1]) ? "redDistrictTeam" : ""}">
          ${teamNumberFromKey(redTeamKeys[1])}
        </td>
        <td class="${isDistrictTeam(redTeamKeys[2]) ? "redDistrictTeam" : ""}">
          ${teamNumberFromKey(redTeamKeys[2])}
        </td>

        <td class="${isDistrictTeam(blueTeamKeys[0]) ? "blueDistrictTeam" : ""}">
          ${teamNumberFromKey(blueTeamKeys[0])}
        </td>
        <td class="${isDistrictTeam(blueTeamKeys[1]) ? "blueDistrictTeam" : ""}">
          ${teamNumberFromKey(blueTeamKeys[1])}
        </td>
        <td class="${isDistrictTeam(blueTeamKeys[2]) ? "blueDistrictTeam" : ""}">
          ${teamNumberFromKey(blueTeamKeys[2])}
        </td>

        <td>
          ${(redRP != "---" && redRP != 0) ? "+" : ""}${redRP}
        </td>
        <td>
          ${(blueRP != "---" && blueRP != 0) ? "+" : ""}${blueRP}
        </td>
        </tr >
        `;

    result += matchesText
  });

  result += "</table><br><br>"
  return result
}

function sortMatches(division) {
  return Object.fromEntries(Object.entries(division).sort(function (a, b) {
    return a[1].time - b[1].time
  }))
}

function selectedTeamKey(teamNumber) {
  return `frc${teamNumber}`
}

function teamNumberFromKey(teamKey) {
  return teamKey.slice(3)
}

function isDistrictTeam(teamNumber) {
  return districtTeams.includes(teamNumber)
}

function eventNameFrom(eventKey) {
  var map = {
    "2019arc": "Archimedes",
    "2019cars": "Carson",
    "2019cur": "Curie",
    "2019dal": "Daly",
    "2019dar": "Darwin",
    "2019tes": "Tesla",
    "2019cmpmi": "Einstein"
  }

  // Return the mapped string if possible
  // otherwise return the event key
  return map[eventKey] || eventKey
}

function urlWithAuth(url) {
  var API_KEY = "ICh6EZ01IHFFi9oZuS4t6Q7sm1zcvZDf0BBCRkgpviQ0HYlcgYfupNUJhCAXqnIl"
  return `https://www.thebluealliance.com/api/v3/${url}?X-TBA-Auth-Key=${API_KEY}`;
}
