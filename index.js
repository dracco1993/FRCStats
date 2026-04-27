const CURRENT_SEASON = "2526";
const TOA_API_KEY = "63mLdRGqejGHYWZX0kldnkWa2MEwq6YgXh9/om24OYM=";
const TOA_BASE_URL = "https://theorangealliance.org/api";

// Populated dynamically from the TOA API each page load
let DIVISIONS = [];

let currentScroll = 0;

function buildDivisions() {
  var result = {};
  DIVISIONS.forEach((division) => {
    result[division.event_key] = {};
  });
  return result;
}

$(document).ready(function () {
  var defaultRegion = localStorage.getItem("selectedRegion") || "IN";
  $("#selectedRegion").val(defaultRegion);

  var defaultSeason = localStorage.getItem("selectedSeason") || CURRENT_SEASON;
  $("#selectedSeason").val(defaultSeason);
  selectedSeason = defaultSeason;

  init();
});

var selectedSeason = CURRENT_SEASON;

var divisions = {};

var rankings = [];

var regionTeams = [];

function init() {
  setupDarkMode();

  reset();

  $("#selectedRegion, #selectedSeason").change(function (e) {
    reset();
  });
}

function reset() {
  gtag("event", "region_dimension", {
    region: $("#selectedRegion").val(),
  });
  gtag("event", "season_dimension", {
    season: $("#selectedSeason").val(),
  });
  gtag("event", "theme_dimension", {
    theme: darkmode.inDarkMode == true ? "dark" : "light",
  });
  gtag("event", "screen_view", {
    app_name: "FTCStats",
    screen_name: $("#selectedRegion").val(),
  });

  clearInterval(intervalId);

  rankings = [];
  regionTeams = [];
  DIVISIONS = [];
  divisions = {};

  var selectedRegionKey = $("#selectedRegion").val();
  localStorage.setItem("selectedRegion", selectedRegionKey);

  selectedSeason = $("#selectedSeason").val();
  localStorage.setItem("selectedSeason", selectedSeason);

  $("#matchInfo").html("");
  $("#rankInfo").html("");
  $("#allMatchInfo").html("");
  updateDivisionsNav();

  loadDivisionsAndTeams(selectedRegionKey);
}

function setupDarkMode() {
  darkmode.cookieExpiry = 30;

  let initialPreference =
    darkmode.getSavedColorScheme() || darkmode.getPreferedColorScheme();
  $("#darkModeCheckbox").prop("checked", initialPreference == "dark");

  $("#darkModeCheckbox").change(function (e) {
    darkmode.setDarkMode(e.target.checked);
  });
}

function loadDivisionsAndTeams(regionKey) {
  var endpoint = `${TOA_BASE_URL}/event?season_key=${selectedSeason}&region_key=CMP`;

  getJSONWithSpinner(endpoint, function (events) {
    if (!events || events.length === 0) {
      updateDivisionsNav();
      return;
    }

    // Division events have division_key > 0; division_key 0 is the Finals/parent event
    const divisionEvents = events.filter((e) => e.division_key > 0);

    DIVISIONS = divisionEvents
      .map((e) => ({
        name: e.division_name || e.event_name,
        event_key: e.event_key,
        division_key: e.division_key,
      }))
      .sort((a, b) => a.division_key - b.division_key);

    divisions = buildDivisions();
    updateDivisionsNav();

    if (DIVISIONS.length > 0) {
      getTeamsForRegion(regionKey);
    }
  });
}

function updateDivisionsNav() {
  var navHtml = "";
  DIVISIONS.forEach((division) => {
    navHtml += `<li><a class="dropdown-item" href="#${division.name}">${division.name}</a></li>`;
  });
  $("#divisionsDropdown").html(navHtml);
}

function getTeamsForRegion(regionKey) {
  var endpoint = `${TOA_BASE_URL}/team?region_key=${regionKey}&season_key=${selectedSeason}`;
  const cacheKey = `${selectedSeason}-${regionKey}`;

  let cachedTeams = JSON.parse(localStorage.getItem("regionTeams")) || {};
  if (cachedTeams[cacheKey]) {
    regionTeams = cachedTeams[cacheKey];
    updateRankingsAndMatches();
    return;
  }

  getJSONWithSpinner(endpoint, function (teams) {
    regionTeams = (teams || []).map((t) => t.team_key);

    let cache = JSON.parse(localStorage.getItem("regionTeams")) || {};
    cache[cacheKey] = regionTeams;
    localStorage.setItem("regionTeams", JSON.stringify(cache));

    updateRankingsAndMatches();
  });
}

function getRankingsFor(divisionKey) {
  var endpoint = `${TOA_BASE_URL}/event/${divisionKey}/rankings`;

  getJSONWithSpinner(endpoint, function (rankingStats) {
    if (rankingStats && rankingStats.length > 0) {
      rankingStats.forEach((rank) => {
        if (isRegionTeam(rank.team_key)) {
          rankings.push({
            ...rank,
            division: divisionKey,
          });
        }
      });
    }
  });
}

function getMatchesForDivision(divisionKey) {
  var endpoint = `${TOA_BASE_URL}/event/${divisionKey}/matches`;

  getJSONWithSpinner(endpoint, function (matches) {
    var regionMatches = [];

    (matches || []).forEach((match) => {
      const isRegionMatch =
        match.participants &&
        match.participants.some((p) => isRegionTeam(p.team_key));

      if (isRegionMatch) {
        regionMatches.push(match);
      }
    });

    addMatches(regionMatches, divisionKey);
  });
}

function addMatches(matches, divisionKey) {
  matches.forEach((match) => {
    if (divisions[divisionKey]) {
      divisions[divisionKey][match.match_key] = match;
    }
  });
}

function render() {
  let rankingText = renderRankings();

  let divisionListText = "";
  Object.keys(divisions).forEach((divisionKey) => {
    divisionListText += renderDivision(divisionKey);
  });

  let allMatchText = renderAllMatches();

  $("#rankInfo").html(rankingText);
  $("#matchInfo").html(divisionListText);
  $("#allMatchInfo").html(allMatchText);

  var scrollSpyContentEl = document.getElementById("content");
  var scrollSpy = bootstrap.ScrollSpy.getOrCreateInstance(scrollSpyContentEl);
  scrollSpy.refresh();
}

function renderRankings() {
  if (rankings.length === 0) return "";

  let result = `
    <h3>Rankings</h3>
    <table class="table table-responsive table-striped table-bordered">
      <thead class="thead-dark">
        <tr>
          <th>Team</th>
          <th>Name</th>
          <th>Rank</th>
          <th>RP</th>
          <th>Division</th>
        </tr>
      </thead>
      <tbody>
  `;

  rankings = rankings.sort(function (a, b) {
    if (a.rank != b.rank) {
      return a.rank - b.rank;
    } else {
      return parseInt(a.team_key) - parseInt(b.team_key);
    }
  });

  rankings.forEach((rank) => {
    const teamName = rank.team ? rank.team.team_name_short : "";
    const rp =
      rank.ranking_points !== undefined && rank.ranking_points !== null
        ? rank.ranking_points
        : "---";

    result += `
      <tr>
        <td>
          ${toaIconLinkFromTeamKey(rank.team_key)}
          ${rank.team_key}
        </td>
        <td>${teamName}</td>
        <td>${rank.rank}</td>
        <td>${rp}</td>
        <td>${divisionNameFrom(rank.division)}</td>
      </tr>
    `;
  });

  result += "</tbody></table><br>";
  return result;
}

function renderDivision(divisionKey) {
  let division = divisions[divisionKey];
  division = sortMatches(division);
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

  allMatches = sortMatches(allMatches);
  return renderTableContents("All Matches", allMatches, true);
}

function renderTableContents(title, division, renderEvent = false) {
  if (Object.keys(division).length == 0) {
    return "";
  }

  const eventName = divisionNameFrom(title);
  const toaLink =
    title !== eventName
      ? toaIconWithLink(`https://theorangealliance.org/events/${title}`)
      : "";

  var result = `
    <div id="${eventName}" class="division">
      <h2>${eventName} ${toaLink}</h2>
      <table class="table table-responsive table-striped table-bordered">
        <thead class="thead-dark">
          <tr>
            <th rowspan="2">Match</th>
            <th colspan="2">Red Alliance</th>
            <th>Red Score</th>
          </tr>
          <tr>
            <th colspan="2">Blue Alliance</th>
            <th>Blue Score</th>
          </tr>
        </thead>
        <tbody>
  `;

  Object.keys(division).forEach((matchKey) => {
    const match = division[matchKey];

    const scheduledTime = match.scheduled_time
      ? new Date(match.scheduled_time)
      : null;
    const time = scheduledTime ? scheduledTime.toLocaleTimeString() : "TBD";

    const participants = match.participants || [];
    const r1Key = (participants.find((p) => p.station === 11) || {}).team_key || "";
    const r2Key = (participants.find((p) => p.station === 12) || {}).team_key || "";
    const b1Key = (participants.find((p) => p.station === 21) || {}).team_key || "";
    const b2Key = (participants.find((p) => p.station === 22) || {}).team_key || "";

    const hasScore = match.post_result_time != null;
    const redScore = hasScore ? match.red_score : "---";
    const blueScore = hasScore ? match.blue_score : "---";

    const winner = hasScore
      ? match.red_score > match.blue_score
        ? "red"
        : match.blue_score > match.red_score
        ? "blue"
        : "tie"
      : "";

    const matchNumber = match.match_name || matchKey;

    let redScoreCell = "";
    let blueScoreCell = "";

    if (hasScore) {
      redScoreCell = `
        <td class="redScore${winner === "red" ? " matchWinner" : ""}">
          ${redScore}
        </td>
      `;
      blueScoreCell = `
        <td class="blueScore${winner === "blue" ? " matchWinner" : ""}">
          ${blueScore}
        </td>
      `;
    } else {
      redScoreCell = `<td colspan="1" rowspan="2">${time}</td>`;
    }

    result += `
      <tr class="scoreRow">
        <td rowspan="2">
          ${renderEvent ? `${divisionNameFrom(match.event_key)}<br/>` : ""}
          <a href="https://theorangealliance.org/events/${match.event_key}" target="_blank">
            ${matchNumber}
          </a>
        </td>
        ${makeTeamCell(r1Key)}
        ${makeTeamCell(r2Key)}
        ${redScoreCell}
      </tr>
      <tr>
        ${makeTeamCell(b1Key)}
        ${makeTeamCell(b2Key)}
        ${blueScoreCell}
      </tr>
    `;
  });

  result += "</tbody></table></div><br><br>";
  return result;
}

function makeTeamCell(teamKey) {
  const highlight = isRegionTeam(teamKey);
  const style = highlight ? ' style="font-weight: bold;"' : "";

  return `
    <td${style}>
      <a href="https://theorangealliance.org/teams/${teamKey}" target="_blank">
        ${teamKey}
      </a>
    </td>
  `;
}

function isRegionTeam(teamKey) {
  return regionTeams.includes(teamKey);
}

function updateRankingsAndMatches() {
  Object.keys(divisions).forEach((divisionKey) => {
    getRankingsFor(divisionKey);
    getMatchesForDivision(divisionKey);
  });
}

function sortMatches(division) {
  return Object.fromEntries(
    Object.entries(division).sort(function (a, b) {
      const aTime = a[1].scheduled_time
        ? new Date(a[1].scheduled_time).getTime()
        : 0;
      const bTime = b[1].scheduled_time
        ? new Date(b[1].scheduled_time).getTime()
        : 0;
      return aTime - bTime;
    })
  );
}

function divisionNameFrom(eventKey) {
  const division = DIVISIONS.find((d) => d.event_key === eventKey);
  return division ? division.name : eventKey;
}

function toaIconLinkFromTeamKey(teamKey) {
  return toaIconWithLink(`https://theorangealliance.org/teams/${teamKey}`);
}

function toaIconWithLink(link) {
  return `
    <a class="icon" href="${link}" target="_blank">
      <img src="https://theorangealliance.org/favicon.ico" alt="TOA Icon" width="28" height="28">
    </a>
  `;
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

  $.ajax({
    url: url,
    dataType: "json",
    headers: {
      "X-TOA-Key": TOA_API_KEY,
      "X-Application-Origin": "FTCStats",
    },
    cache: false,
    success: callback,
  }).always(() => {
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

