const CURRENT_YEAR = new Date().getFullYear();

const DIVISIONS = [
  {
    name: "Archimedes",
    key: "arc",
  },
  {
    name: "Curie",
    key: "cur",
  },
  {
    name: "Daly",
    key: "dal",
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
    name: "Johnson",
    key: "joh",
  },
  {
    name: "Milstein",
    key: "mil",
  },
  {
    name: "Newton",
    key: "new",
  },
];

const COLORS = {
  red: "#ff0000",
  blue: "#0000ff",
};

const defaultTeamColors = {
  // 2023
  frc135: "#d7c353",
  frc461: "#c69b08",
  frc1501: "#9ebbd6",
  frc3940: "#662c91",
  frc4272: "#801819",
  frc5010: "#FF5010",
  frc6721: "#e73685",
  // frc7457: "#c78c35",
  frc7617: "#ce9c1a",
  frc7657: "#cd5828",
  frc9071: "#ff6700",

  // 2022
  frc829: "#F6D284",
  frc1555: "#51BBF6",
  frc1741: "#dd3333",
  frc4926: "#50D017",
  frc5484: "#e67958",
  frc7457: "#c78c35",
  frc7617: "#0548a9",
  frc8742: "#241e20",
};

let currentScroll = 0;

function buildDivisions() {
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

  var defaultYear = localStorage.getItem("selectedYear") || CURRENT_YEAR;
  $("#selectedYear").val(defaultYear);
  selectedYear = defaultYear;

  init();
});

var selectedYear = CURRENT_YEAR;

var divisions = buildDivisions();

var rankings = [];

var districtTeams = [];

var frcColors = {};

function init() {
  setupDarkMode();

  // Load the default colors
  const teamColors = {
    ...defaultTeamColors,
    ...JSON.parse(localStorage.getItem("teamColors")),
  };
  localStorage.setItem("teamColors", JSON.stringify(teamColors));

  loadFrcColors();

  // Do a forced load on the initial page load
  reset();

  // Add the district and year select change listener
  $("#selectedDistrict, #selectedYear").change(function (e) {
    reset();
  });
}

function reset() {
  // Send GA events, to better track the usage data
  gtag("event", "district_dimension", {
    district: $("#selectedDistrict").val(),
  });
  gtag("event", "year_dimension", {
    year: $("#selectedYear").val(),
  });
  gtag("event", "screen_view", {
    app_name: "FRCStats",
    screen_name: $("#selectedDistrict").val(),
  });

  clearInterval(intervalId);

  // Reset all of the "global" variables
  rankings = [];
  districtTeams = [];

  var selectedDistrictKey = $("#selectedDistrict").val();
  localStorage.setItem("selectedDistrict", selectedDistrictKey);

  selectedYear = $("#selectedYear").val();
  localStorage.setItem("selectedYear", selectedYear);

  divisions = buildDivisions();

  getTeamsForDistrict(selectedDistrictKey);
}

function setupDarkMode() {
  darkmode.cookieExpiry = 30;

  // Set the dark mode checkbox initial state
  let initialPreference =
    darkmode.getSavedColorScheme() || darkmode.getPreferedColorScheme();
  $("#darkModeCheckbox").prop("checked", initialPreference == "dark");

  $("#darkModeCheckbox").change(function (e) {
    darkmode.setDarkMode(e.target.checked);
  });
}

function getRankingsFor(division) {
  var endpoint = `event/${division}/rankings`;

  getJSONWithSpinner(tbaUrlWithAuth(endpoint), function (rankingStats) {
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
  const fullKey = `${selectedYear}${districtKey}`;
  var endpoint = `district/${fullKey}/teams/keys`;

  // Check to see if we've already cached this district's teams
  let cachedTeams = JSON.parse(localStorage.getItem("districtTeams")) || {};
  if (cachedTeams[fullKey]) {
    districtTeams = cachedTeams[fullKey];

    updateRankingsAndMatches();
    return;
  }

  getJSONWithSpinner(tbaUrlWithAuth(endpoint), function (teams) {
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

  getJSONWithSpinner(tbaUrlWithAuth(endpoint), function (matches) {
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
}

function render() {
  // Render the ranking section
  let rankingText = renderRankings();

  // Add the color select change listener
  $(".colorSelect").change(onColorChange);

  // Add the color clear listener
  $(".colorClear").click(onColorClear);

  // Render the division matches section
  let divisionListText = "";
  Object.keys(divisions).forEach((divisionKey) => {
    divisionListText += renderDivision(divisionKey);
  });

  // Render the all matches section
  let allMatchText = renderAllMatches();

  // Actually change the html
  $("#rankInfo").html(rankingText);
  $("#matchInfo").html(divisionListText);
  $("#allMatchInfo").html(allMatchText);

  // document.getElementById("content").scrollTo(0, 0);

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
        <td>${teamNumberFromKey(rank.team_key, true)}</td>
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
  // Don't render anything if there are no matches for teams in the district
  if (Object.keys(division).length == 0) {
    return "";
  }

  const eventName = eventNameFrom(title);
  const eventLink = `<a href="https://www.thebluealliance.com/event/${title}" target="_blank">${title}</a>`;
  var result = `
      <div id="${eventName}" class="division">
        <h2>${eventName} ${title != eventName ? `(${eventLink})` : ""}</h2>
        <table class="table table-responsive table-striped table-bordered">
          <thead class="thead-dark">
            <tr>
              <th rowspan="2">Match</th>

              <th colspan="3">Red Alliance</th>
              <th>Red Score</th>
              <th>Red RP</th>
            </tr>
              <th colspan="3">Blue Alliance</th>
              <th>Blue Score</th>
              <th>Blue RP</th>
            <tr>
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

    let redScore = match.score_breakdown
      ? match.score_breakdown.red.totalPoints
      : "---";
    let blueScore = match.score_breakdown
      ? match.score_breakdown.blue.totalPoints
      : "---";

    let redRP = match.score_breakdown ? match.score_breakdown.red.rp : "---";
    let blueRP = match.score_breakdown ? match.score_breakdown.blue.rp : "---";
    let winner = match.winning_alliance;

    var matchesText = "";

    const r1Color = getTeamColor(redTeamKeys[0], COLORS.red);
    const r2Color = getTeamColor(redTeamKeys[1], COLORS.red);
    const r3Color = getTeamColor(redTeamKeys[2], COLORS.red);

    const b1Color = getTeamColor(blueTeamKeys[0], COLORS.blue);
    const b2Color = getTeamColor(blueTeamKeys[1], COLORS.blue);
    const b3Color = getTeamColor(blueTeamKeys[2], COLORS.blue);

    const notQuals = match.comp_level != "qm";

    const matchNumber =
      (notQuals ? match.comp_level : "") +
      (notQuals ? `${match.set_number}-` : "") +
      match.match_number;

    let redScoreRP = "";
    let blueScoreRP = "";
    if (match.score_breakdown) {
      redScoreRP = `
        <td class="${winner == "red" ? "matchWinner" : ""}">
          ${redScore}
        </td>

        <td>
          ${redRP != "---" && redRP != 0 ? "+" : ""}${redRP}
        </td>
      `;
      blueScoreRP = `
        <td class="${winner == "blue" ? "matchWinner" : ""}">
          ${blueScore}
        </td>

        <td>
          ${blueRP != "---" && blueRP != 0 ? "+" : ""}${blueRP}
        </td>
      `;
    } else {
      redScoreRP = `<td colspan="2" rowspan="2">${time}</td>`;
    }

    matchesText += `
        <tr class="scoreRow">
          <td rowspan="2"}>
            ${renderEvent ? `${eventNameFrom(match.event_key)}<br/>` : ""}
            <a href="https://www.thebluealliance.com/match/${matchKey}" target="_blank">
              ${matchNumber}
            </a>
          </td>

          ${makeTeamColorCell(r1Color, redTeamKeys[0])}
          ${makeTeamColorCell(r2Color, redTeamKeys[1])}
          ${makeTeamColorCell(r3Color, redTeamKeys[2])}

          ${redScoreRP}
        </tr>
        <tr>
          ${makeTeamColorCell(b1Color, blueTeamKeys[0])}
          ${makeTeamColorCell(b2Color, blueTeamKeys[1])}
          ${makeTeamColorCell(b3Color, blueTeamKeys[2])}

          ${blueScoreRP}
        </tr>
      `;

    result += matchesText;
  });

  result += "</tbody></table></div><br><br>";
  return result;
}

function makeTeamColorCell(teamColor, teamKey) {
  let verifiedFrcColor = teamColor;
  let verified = false;
  let teamOutline;

  // If the teamColor is an object, it's a verified FRC color
  if (teamColor && typeof teamColor === "object") {
    teamColor = verifiedFrcColor.primaryHex;
    teamOutline = verifiedFrcColor.secondaryHex;
    verified = true;
  }

  const color = teamColor ? textColor(teamColor) : "";

  let teamColorStyle = teamColor
    ? `background-color: ${teamColor}; color: ${color};`
    : "";

  let teamOutlineStyle = verified
    ? `outline: 3px solid ${teamOutline};outline-offset: -5px;`
    : "";

  let style = `style="${teamColorStyle}${teamOutlineStyle}"`;

  return `
    <td ${teamColor ? style : ""}>
      ${teamNumberFromKey(teamKey, true, color)}
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

  render();
}

function getTeamColor(teamKey, defaultColor) {
  if (isDistrictTeam(teamKey)) {
    const teamColors = JSON.parse(localStorage.getItem("teamColors"));

    // Check for the verified FRC colors first
    if (frcColors[teamKey] && frcColors[teamKey].verified) {
      return frcColors[teamKey];
    }

    // Check for white and white unverified colors
    if (
      frcColors[teamKey] &&
      frcColors[teamKey].primaryHex == "#ffffff" &&
      frcColors[teamKey].secondaryHex == "#ffffff"
    ) {
      return {
        ...frcColors[teamKey],
        secondaryHex: "#000000",
      };
    }

    let unverifiedFrcColorsTeamColor =
      frcColors[teamKey] && frcColors[teamKey].primaryHex;
    return teamColors[teamKey] || unverifiedFrcColorsTeamColor || defaultColor;
  }
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

function loadFrcColors() {
  let endpoint = "https://api.frc-colors.com/v1/team?all";

  frcColors = JSON.parse(localStorage.getItem("frcColors"));

  // Don't make the request if we already have the colors
  if (frcColors) {
    return;
  }

  getJSONWithSpinner(endpoint, function (data) {
    frcColors = {};

    for (const [teamNumber, team] of Object.entries(data.teams)) {
      frcColors[`frc${teamNumber}`] = team.colors;
    }

    localStorage.setItem("frcColors", JSON.stringify(frcColors));
  });
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

function teamNumberFromKey(teamKey, shouldLink = false, color = "") {
  const teamNumber = teamKey.slice(3);

  let linkStyle = "";
  if (color != "") {
    linkStyle = `style="color: ${color}"`;
  }

  if (shouldLink) {
    return `
      <a href="https://www.thebluealliance.com/team/${teamNumber}" target="_blank" ${linkStyle}>
        ${teamNumber}
      </a>
    `;
  }

  return teamNumber;
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

function tbaUrlWithAuth(url) {
  var API_KEY =
    "ICh6EZ01IHFFi9oZuS4t6Q7sm1zcvZDf0BBCRkgpviQ0HYlcgYfupNUJhCAXqnIl";
  return `https://www.thebluealliance.com/api/v3/${url}?X-TBA-Auth-Key=${API_KEY}&cachebuster=${new Date().getTime()}`;
}

const reloadTime = 60;
let countdown = reloadTime;
let intervalId = null;
function handleCountdown() {
  countdown--;

  if (countdown == 0) {
    countdown = reloadTime;
    reset();
  }

  $("#eta").text(countdown.toString().padStart(2, "0"));
}

var inFlightRequests = 0;
function getJSONWithSpinner(url, callback) {
  $("#spinner").show();
  $("#countdown").hide();

  inFlightRequests++;

  $.getJSON(url, callback).always(() => {
    inFlightRequests--;

    if (inFlightRequests == 0) {
      $("#spinner").hide();

      countdown = reloadTime;
      $("#eta").text(countdown.toString().padStart(2, "0"));
      $("#countdown").show();

      intervalId = window.setInterval(handleCountdown, 1000);
      render();
    }
  });
}
