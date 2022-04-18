// const YEAR = 2022;
const YEAR = 2019;

const DIVISIONS = [
  {
    name: "Carver",
    key: "carv",
  },
  {
    name: "Galileo",
    key: "gal",
  },
  {
    name: "Hopper",
    key: "hop",
  },
  {
    name: "Newton",
    key: "new",
  },
  {
    name: "Roebling",
    key: "roe",
  },
  {
    name: "Turing",
    key: "tur",
  },
];

function buildDefaultDivisions() {
  var result = {};

  DIVISIONS.map((division) => {
    const key = `${YEAR}${division.key}`;
    result[key] = {};
  });

  return result;
}

$(document).ready(function () {
  // Set the default value from the cache, or just Indiana <3
  var defaultSelection = localStorage.getItem("selectedDistrict") || "fin";
  $("#selectedDistrict").val(defaultSelection);
  location.hash = defaultSelection;

  init();
});

var divisions = buildDefaultDivisions();

var rankings = [];

var districtTeams = [];

function init() {
  // Do a forced load on the initial page load
  reset();

  // Add the district select change listener
  $("#selectedDistrict").change(function (e) {
    gtag("event", "district_dimension", {
      district: $("#selectedDistrict").val(),
    });

    location.hash = $("#selectedDistrict").val();

    reset();
  });
}

function reset() {
  // Reset all of the "global" variables
  divisions = buildDefaultDivisions();

  rankings = [];
  districtTeams = [];

  var selectedDistrictKey = $("#selectedDistrict").val();
  localStorage.setItem("selectedDistrict", selectedDistrictKey);

  getTeamsForDistrict(selectedDistrictKey);
}

function getRankingsFor(division) {
  var endpoint = `event/${division}/rankings`;

  getJSONWithSpinner(urlWithAuth(endpoint), function (rankingStats) {
    // If this division doesn't have rankings
    // please don't break the rest of them...
    if (rankingStats && rankingStats.rankings) {
      rankingStats.rankings.forEach((rank) => {
        let teamNumber = rank.team_key;

        if (isDistrictTeam(teamNumber)) {
          rankings.push({
            ...rank,
            division: division,
          });
        }
      });
    }
  });
}

function getTeamsForDistrict(districtKey) {
  // Just a little hack for WOW
  // if (districtKey == "wow") {
  //   districtTeams = [
  //     "frc48",
  //     "frc120",
  //     "frc279",
  //     "frc379",
  //     "frc1317",
  //     "frc1787",
  //     "frc2614",
  //     "frc3193",
  //     "frc3324",
  //     "frc3504",
  //     "frc4027",
  //     "frc4028",
  //     "frc4145",
  //     "frc4150",
  //     "frc5667",
  //     "frc5740",
  //     "frc5811",
  //     "frc6032",
  //     "frc6964",
  //     "frc7460",
  //     "frc7515",
  //     "frc7885"
  //   ]

  //   // Get the rankings and matches for each division
  //   Object.keys(divisions).forEach(division => {
  //     getRankingsFor(division)
  //     getMatchesForDivision(division)
  //   });
  //   return
  // }

  const fullKey = `${YEAR}${districtKey}`;
  var endpoint = `district/${fullKey}/teams/keys`;

  // Check to see if we've already cached this district's teams
  let cachedTeams = JSON.parse(localStorage.getItem("districtTeams")) || {};
  if (cachedTeams[fullKey]) {
    districtTeams = cachedTeams[fullKey];

    updateRankingsAndMatches();
    return;
  }

  getJSONWithSpinner(urlWithAuth(endpoint), function (teams) {
    districtTeams = teams.sort();

    // Cache the district teams, since those aren't changing
    let cachedTeams = JSON.parse(localStorage.getItem("districtTeams")) || {};
    cachedTeams[fullKey] = districtTeams;
    localStorage.setItem("districtTeams", JSON.stringify(cachedTeams));

    updateRankingsAndMatches();
  });
}

function getMatchesForDivision(division) {
  var endpoint = `event/${division}/matches`;

  getJSONWithSpinner(urlWithAuth(endpoint), function (matches) {
    var districtMatches = [];

    matches.forEach((match) => {
      // Check to see if any of the match teams are in the district
      // This is ugly, but it's not _terrible_
      let isDistrictMatch =
        isDistrictTeam(match.alliances.red.team_keys[0]) ||
        isDistrictTeam(match.alliances.red.team_keys[1]) ||
        isDistrictTeam(match.alliances.red.team_keys[2]) ||
        isDistrictTeam(match.alliances.blue.team_keys[0]) ||
        isDistrictTeam(match.alliances.blue.team_keys[1]) ||
        isDistrictTeam(match.alliances.blue.team_keys[2]);

      if (isDistrictMatch) {
        districtMatches.push(match);
      }
    });

    addMatches(districtMatches);
  });
}

function addMatches(matches) {
  matches.forEach((match) => {
    divisions[match.event_key][match.key] = match;
  });
  render();
}

function render() {
  // Render the ranking section
  let rankingText = renderRankings();
  $("#rankInfo").html(rankingText);

  // Add the select change listener
  $(".colorSelect").change(onColorChange);

  // Render the division matches section
  let divisionListText = "";
  Object.keys(divisions).forEach((divisionKey) => {
    divisionListText += renderDivision(divisionKey);
  });
  $("#matchInfo").html(divisionListText);

  // Render the all matches section
  let allMatchText = renderAllMatches();
  $("#allMatchInfo").html(allMatchText);
}

function renderRankings() {
  let result = `
    <h3>Rankings</h3>
    <table>
      <tr>
        <td>Team</td>
        <td>Rank</td>
        <td>Division</td>
        <td>Color</td>
      </tr>
  `;

  // Sort by rank first, then team number
  rankings = rankings.sort(function (a, b) {
    if (a.rank != b.rank) {
      return a.rank - b.rank;
    } else {
      return teamNumberFromKey(a.team_key) - teamNumberFromKey(b.team_key);
    }
  });

  const teamColors = JSON.parse(localStorage.getItem("teamColors")) || {};

  // Render the individual rows
  rankings.forEach((rank) => {
    const teamColor = teamColors[rank.team_key] || "#ffffff";
    result += `
      <tr>
      <td>${teamNumberFromKey(rank.team_key)}</td>
      <td>${rank.rank}</td>
      <td>${eventNameFrom(rank.division)}</td>
      <td>
        <input id="${
          rank.team_key
        }" class="colorSelect" type="color" value="${teamColor}"></td>
      </tr>
    `;
  });

  result += "</table><br>";

  return result;
}

function renderDivision(divisionKey) {
  // Get the matches
  let division = divisions[divisionKey];

  // Sort them
  division = sortMatches(division);

  // Save them
  divisions[divisionKey] = division;

  return renderTableContents(divisionKey, division);
}

function renderAllMatches() {
  let allMatches = {};
  Object.keys(divisions).forEach((divisionKey) => {
    allMatches = {
      ...allMatches,
      ...divisions[divisionKey],
    };
  });

  // Sort them after we have them all added
  allMatches = sortMatches(allMatches);

  return renderTableContents("All Matches", allMatches, true);
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

  Object.keys(division).forEach((matchKey) => {
    const match = division[matchKey];

    const d = new Date(match.time * 1000);
    const time = d.toLocaleTimeString();

    let redTeamKeys = match.alliances.red.team_keys;
    let blueTeamKeys = match.alliances.blue.team_keys;

    let redRP = match.score_breakdown ? match.score_breakdown.red.rp : "---";
    let blueRP = match.score_breakdown ? match.score_breakdown.blue.rp : "---";
    let winner = match.winning_alliance;

    var matchesText = "";

    matchesText += `
        <tr>
          ${renderEvent ? `<td>${eventNameFrom(match.event_key)}</td>` : ""}
          <td>${match.comp_level}</td>
          <td>
            ${match.match_number}${
      match.comp_level != "qm" ? `-${match.set_number}` : ""
    }
          </td>
        <td>${time}</td>

        <td style="background-color: ${getTeamColor(redTeamKeys[0], "red")}">
          ${teamNumberFromKey(redTeamKeys[0])}
        </td>
        <td style="background-color: ${getTeamColor(redTeamKeys[(1, "red")])}">
          ${teamNumberFromKey(redTeamKeys[1])}
        </td>
        <td style="background-color: ${getTeamColor(redTeamKeys[2], "red")}">
          ${teamNumberFromKey(redTeamKeys[2])}
        </td>

        <td style="background-color: ${getTeamColor(blueTeamKeys[0], "blue")}">
          ${teamNumberFromKey(blueTeamKeys[0])}
        </td>
        <td style="background-color: ${getTeamColor(blueTeamKeys[1], "blue")}">
          ${teamNumberFromKey(blueTeamKeys[1])}
        </td>
        <td style="background-color: ${getTeamColor(blueTeamKeys[2], "blue")}">
          ${teamNumberFromKey(blueTeamKeys[2])}
        </td>

        <td class="${winner == "red" ? "matchWinner" : ""}">
          ${redRP != "---" && redRP != 0 ? "+" : ""}${redRP}
        </td>
        <td class="${winner == "blue" ? "matchWinner" : ""}">
          ${blueRP != "---" && blueRP != 0 ? "+" : ""}${blueRP}
        </td>
        </tr >
        `;

    result += matchesText;
  });

  result += "</table><br><br>";
  return result;
}

function onColorChange(e) {
  const teamKey = e.target.id;
  const color = e.target.value;

  let teamColors = JSON.parse(localStorage.getItem("teamColors")) || {};
  teamColors[teamKey] = color;
  localStorage.setItem("teamColors", JSON.stringify(teamColors));

  // TODO: figure out what to rerender here
  render();
}

function getTeamColor(teamKey, defaultColor) {
  if (isDistrictTeam(teamKey)) {
    const teamColors = JSON.parse(localStorage.getItem("teamColors")) || {};
    return teamColors[teamKey] || defaultColor;
  } else {
    return "#ffffff";
  }
}

function updateRankingsAndMatches() {
  // Get the rankings and matches for each division
  Object.keys(divisions).forEach((division) => {
    getRankingsFor(division);
    getMatchesForDivision(division);
  });
}

function sortMatches(division) {
  return Object.fromEntries(
    Object.entries(division).sort(function (a, b) {
      return a[1].time - b[1].time;
    })
  );
}

function selectedTeamKey(teamNumber) {
  return `frc${teamNumber}`;
}

function teamNumberFromKey(teamKey) {
  return teamKey.slice(3);
}

function isDistrictTeam(teamNumber) {
  return districtTeams.includes(teamNumber);
}

function eventNameFrom(eventKey) {
  const divisionKey = eventKey.replace(/[0-9]/g, "");
  const name = DIVISIONS.find((d) => d.key == divisionKey);

  // Return the mapped string if possible
  // otherwise return the event key
  return name ? name.name : eventKey;
}

function urlWithAuth(url) {
  var API_KEY =
    "ICh6EZ01IHFFi9oZuS4t6Q7sm1zcvZDf0BBCRkgpviQ0HYlcgYfupNUJhCAXqnIl";
  return `https://www.thebluealliance.com/api/v3/${url}?X-TBA-Auth-Key=${API_KEY}`;
}

var inFlightRequests = 0;
function getJSONWithSpinner(url, callback) {
  $("#spinner").show();
  inFlightRequests++;

  $.getJSON(url, callback).always(() => {
    inFlightRequests--;

    if (inFlightRequests == 0) {
      $("#spinner").hide();
    }
  });
}
