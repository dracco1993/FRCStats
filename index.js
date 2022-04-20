// const YEAR = 2022;
// const YEAR = 2019;

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

const defaultTeamColors = {
  frc829: "#F6D284",
  frc1555: "#51BBF6",
  frc1741: "#dd3333",
  frc4926: "#50D017",
  frc5484: "#e67958",
  frc7457: "#c78c35",
  frc7617: "#0548a9",
  frc8742: "#241e20",
};

function buildDefaultDivisions() {
  var result = {};

  DIVISIONS.map((division) => {
    const key = `${selectedYear}${division.key}`;
    result[key] = {};
  });

  return result;
}

$(document).ready(function () {
  // Set the default value from the cache, or just Indiana <3
  var defaultDistrict = localStorage.getItem("selectedDistrict") || "fin";
  $("#selectedDistrict").val(defaultDistrict);
  location.hash = defaultDistrict;

  var defaultYear = localStorage.getItem("selectedYear") || "2022";
  $("#selectedYear").val(defaultYear);
  selectedYear = defaultYear;

  init();
});

var selectedYear = 2022;

var divisions = buildDefaultDivisions();

var rankings = [];

var districtTeams = [];

function init() {
  // Load the default colors
  const teamColors = {
    ...defaultTeamColors,
    ...JSON.parse(localStorage.getItem("teamColors")),
  };
  localStorage.setItem("teamColors", JSON.stringify(teamColors));

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

  // Add the year select change listener
  $("#selectedYear").change(function (e) {
    gtag("event", "year_dimension", {
      year: $("#selectedYear").val(),
    });

    reset();
  });
}

function reset() {
  // Reset all of the "global" variables
  rankings = [];
  districtTeams = [];

  var selectedDistrictKey = $("#selectedDistrict").val();
  localStorage.setItem("selectedDistrict", selectedDistrictKey);

  selectedYear = $("#selectedYear").val();
  localStorage.setItem("selectedYear", selectedYear);

  divisions = buildDefaultDivisions();

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

  const fullKey = `${selectedYear}${districtKey}`;
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

  // Add the color select change listener
  $(".colorSelect").change(onColorChange);

  // Add the color clear listener
  $(".colorClear").click(onColorClear);

  // Render the division matches section
  let divisionListText = "";
  Object.keys(divisions).forEach((divisionKey) => {
    divisionListText += renderDivision(divisionKey);
  });
  $("#matchInfo").html(divisionListText);

  // Render the all matches section
  let allMatchText = renderAllMatches();
  $("#allMatchInfo").html(allMatchText);

  document.getElementById("content").scrollTo(0, 0);

  var scrollSpyContentEl = document.getElementById("content");
  var scrollSpy = bootstrap.ScrollSpy.getOrCreateInstance(scrollSpyContentEl);
  scrollSpy.refresh();
}

function renderRankings() {
  let result = `
    <h3>Rankings</h3>
    <table class="table table-responsive table-striped table-bordered">
      <thead class="thead-dark">
        <tr>
          <th>Team</th>
          <th>Rank</th>
          <th>Division</th>
          <th>Color</td>
        </tr>
      </thead>
      <tbody>
  `;

  // Sort by rank first, then team number
  rankings = rankings.sort(function (a, b) {
    if (a.rank != b.rank) {
      return a.rank - b.rank;
    } else {
      return teamNumberFromKey(a.team_key) - teamNumberFromKey(b.team_key);
    }
  });

  const teamColors = JSON.parse(localStorage.getItem("teamColors"));

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
          }" class="colorSelect" type="color" value="${teamColor}">
          <button id="${
            rank.team_key
          }" type="button" class="btn-close colorClear" aria-label="Close"></button>
        </td>
      </tr>
    `;
  });

  result += "</tbody></table><br>";

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
  const eventName = eventNameFrom(title);
  var result = `
      <div id="${eventName}">
        <h2>${eventName} ${title != eventName ? `(${title})` : ""}</h2>
        <table class="table table-responsive table-striped table-bordered">
          <thead class="thead-dark">
            <tr>
              ${renderEvent ? "<td>Event</td>" : ""}
              <th>Comp Level</th>
              <th>Match Number</th>
              <th>Time</th>

              <th>R1</th>
              <th>R2</th>
              <th>R3</th>

              <th>B1</th>
              <th>B2</th>
              <th>B3</th>

              <th>Red RP</th>
              <th>Blue RP</th>
            </tr>
          </thead>
        <tbody>
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

    const r1Color = getTeamColor(redTeamKeys[0], "#ff0000");
    const r2Color = getTeamColor(redTeamKeys[1], "#ff0000");
    const r3Color = getTeamColor(redTeamKeys[2], "#ff0000");

    const b1Color = getTeamColor(blueTeamKeys[0], "#0000ff");
    const b2Color = getTeamColor(blueTeamKeys[1], "#0000ff");
    const b3Color = getTeamColor(blueTeamKeys[2], "#0000ff");

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

        ${makeTeamColorCell(r1Color, redTeamKeys[0])}
        ${makeTeamColorCell(r2Color, redTeamKeys[1])}
        ${makeTeamColorCell(r3Color, redTeamKeys[2])}

        ${makeTeamColorCell(b1Color, blueTeamKeys[0])}
        ${makeTeamColorCell(b2Color, blueTeamKeys[1])}
        ${makeTeamColorCell(b3Color, blueTeamKeys[2])}

        <td ${
          winner == "red"
            ? 'style="background-color: green; color: white;"'
            : ""
        }>
          ${redRP != "---" && redRP != 0 ? "+" : ""}${redRP}
        </td>
        <td ${
          winner == "blue"
            ? 'style="background-color: green; color: white;"'
            : ""
        }>
          ${blueRP != "---" && blueRP != 0 ? "+" : ""}${blueRP}
        </td>
        </tr >
        `;

    result += matchesText;
  });

  result += "</tbody></table></div><br><br>";
  return result;
}

function makeTeamColorCell(teamColor, teamKey) {
  return `
    <td ${
      teamColor
        ? `style=\"background-color: ${teamColor}; color: ${textColor(
            teamColor
          )}"`
        : ""
    }>
      ${teamNumberFromKey(teamKey)}
    </td>
  `;
}

function onColorChange(e) {
  const teamKey = e.target.id;
  const color = e.target.value;

  let teamColors = JSON.parse(localStorage.getItem("teamColors"));
  teamColors[teamKey] = color;
  localStorage.setItem("teamColors", JSON.stringify(teamColors));

  // TODO: figure out what to rerender here
  render();
}

function onColorClear(e) {
  const teamKey = e.target.id;

  let teamColors = JSON.parse(localStorage.getItem("teamColors")) || {};
  delete teamColors[teamKey];
  localStorage.setItem("teamColors", JSON.stringify(teamColors));

  // TODO: figure out what to rerender here
  render();
}

function getTeamColor(teamKey, defaultColor) {
  if (isDistrictTeam(teamKey)) {
    const teamColors = JSON.parse(localStorage.getItem("teamColors"));
    return teamColors[teamKey] || defaultColor;
  }
  // else {
  //   return "#ffffff";
  // }
}

function textColor(bgColor) {
  bgColor = bgColor.replace("#", "");

  var aRgbHex = bgColor.match(/.{1,2}/g);

  var r = parseInt(aRgbHex[0], 16);
  var g = parseInt(aRgbHex[1], 16);
  var b = parseInt(aRgbHex[2], 16);

  var yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
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
