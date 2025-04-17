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

const CA_TEAMS = [
  "frc4",
  "frc8",
  "frc22",
  "frc100",
  "frc114",
  "frc115",
  "frc192",
  "frc199",
  "frc253",
  "frc254",
  "frc294",
  "frc399",
  "frc581",
  "frc589",
  "frc597",
  "frc599",
  "frc604",
  "frc649",
  "frc668",
  "frc670",
  "frc687",
  "frc691",
  "frc696",
  "frc701",
  "frc702",
  "frc751",
  "frc766",
  "frc812",
  "frc840",
  "frc841",
  "frc846",
  "frc852",
  "frc867",
  "frc968",
  "frc971",
  "frc972",
  "frc973",
  "frc980",
  "frc1072",
  "frc1138",
  "frc1148",
  "frc1159",
  "frc1160",
  "frc1197",
  "frc1280",
  "frc1323",
  "frc1351",
  "frc1388",
  "frc1452",
  "frc1458",
  "frc1515",
  "frc1538",
  "frc1572",
  "frc1622",
  "frc1661",
  "frc1671",
  "frc1678",
  "frc1700",
  "frc1759",
  "frc1836",
  "frc1868",
  "frc1967",
  "frc1972",
  "frc2035",
  "frc2073",
  "frc2102",
  "frc2135",
  "frc2141",
  "frc2204",
  "frc2288",
  "frc2367",
  "frc2404",
  "frc2429",
  "frc2473",
  "frc2485",
  "frc2489",
  "frc2543",
  "frc2551",
  "frc2584",
  "frc2637",
  "frc2643",
  "frc2658",
  "frc2659",
  "frc2710",
  "frc2813",
  "frc2827",
  "frc2839",
  "frc2854",
  "frc2984",
  "frc3020",
  "frc3045",
  "frc3128",
  "frc3189",
  "frc3255",
  "frc3256",
  "frc3257",
  "frc3295",
  "frc3309",
  "frc3328",
  "frc3341",
  "frc3408",
  "frc3473",
  "frc3476",
  "frc3482",
  "frc3501",
  "frc3512",
  "frc3598",
  "frc3647",
  "frc3669",
  "frc3704",
  "frc3749",
  "frc3759",
  "frc3859",
  "frc3863",
  "frc3925",
  "frc3952",
  "frc3965",
  "frc3970",
  "frc3993",
  "frc4019",
  "frc4079",
  "frc4123",
  "frc4135",
  "frc4141",
  "frc4159",
  "frc4160",
  "frc4171",
  "frc4186",
  "frc4201",
  "frc4255",
  "frc4276",
  "frc4322",
  "frc4414",
  "frc4415",
  "frc4419",
  "frc4470",
  "frc4501",
  "frc4619",
  "frc4643",
  "frc4669",
  "frc4698",
  "frc4711",
  "frc4738",
  "frc4765",
  "frc4904",
  "frc4919",
  "frc4964",
  "frc4973",
  "frc4984",
  "frc4990",
  "frc4999",
  "frc5012",
  "frc5025",
  "frc5026",
  "frc5027",
  "frc5089",
  "frc5104",
  "frc5124",
  "frc5136",
  "frc5137",
  "frc5171",
  "frc5199",
  "frc5274",
  "frc5285",
  "frc5419",
  "frc5430",
  "frc5458",
  "frc5474",
  "frc5499",
  "frc5500",
  "frc5507",
  "frc5514",
  "frc5669",
  "frc5700",
  "frc5728",
  "frc5760",
  "frc5805",
  "frc5817",
  "frc5835",
  "frc5851",
  "frc5857",
  "frc5869",
  "frc5924",
  "frc5940",
  "frc6000",
  "frc6036",
  "frc6059",
  "frc6060",
  "frc6072",
  "frc6220",
  "frc6238",
  "frc6305",
  "frc6418",
  "frc6506",
  "frc6515",
  "frc6553",
  "frc6560",
  "frc6619",
  "frc6657",
  "frc6658",
  "frc6662",
  "frc6665",
  "frc6695",
  "frc6764",
  "frc6814",
  "frc6822",
  "frc6884",
  "frc6885",
  "frc6904",
  "frc6934",
  "frc6962",
  "frc6981",
  "frc6995",
  "frc7042",
  "frc7137",
  "frc7157",
  "frc7230",
  "frc7245",
  "frc7323",
  "frc7327",
  "frc7401",
  "frc7413",
  "frc7415",
  "frc7419",
  "frc7441",
  "frc7447",
  "frc7528",
  "frc7607",
  "frc7667",
  "frc7777",
  "frc8006",
  "frc8016",
  "frc8033",
  "frc8045",
  "frc8048",
  "frc8060",
  "frc8119",
  "frc8404",
  "frc8521",
  "frc8533",
  "frc8751",
  "frc8768",
  "frc8793",
  "frc8840",
  "frc8852",
  "frc8870",
  "frc8888",
  "frc8891",
  "frc8898",
  "frc9006",
  "frc9038",
  "frc9084",
  "frc9111",
  "frc9114",
  "frc9125",
  "frc9143",
  "frc9202",
  "frc9271",
  "frc9400",
  "frc9408",
  "frc9452",
  "frc9470",
  "frc9471",
  "frc9505",
  "frc9573",
  "frc9584",
  "frc9615",
  "frc9706",
  "frc9730",
  "frc9772",
  "frc9781",
  "frc10059",
  "frc10147",
  "frc10166",
  "frc10212",
  "frc10221",
  "frc10252",
  "frc10281",
  "frc10336",
  "frc10339",
  "frc10372",
  "frc10392",
  "frc10500",
  "frc10523",
  "frc10586",
  "frc10597",
  "frc10615",
  "frc10625",
  "frc10644",
  "frc10658"
]

const WI_TEAMS = [
  "frc93",
  "frc171",
  "frc537",
  "frc706",
  "frc930",
  "frc1091",
  "frc1220",
  "frc1259",
  "frc1306",
  "frc1675",
  "frc1714",
  "frc1716",
  "frc1732",
  "frc1792",
  "frc2062",
  "frc2077",
  "frc2143",
  "frc2194",
  "frc2202",
  "frc2506",
  "frc2826",
  "frc2830",
  "frc3197",
  "frc3381",
  "frc3418",
  "frc3596",
  "frc3692",
  "frc4011",
  "frc4021",
  "frc4054",
  "frc4531",
  "frc4786",
  "frc5019",
  "frc5096",
  "frc5148",
  "frc5586",
  "frc5826",
  "frc5903",
  "frc6166",
  "frc6223",
  "frc6318",
  "frc6381",
  "frc6421",
  "frc6574",
  "frc6643",
  "frc6732",
  "frc7021",
  "frc7103",
  "frc7619",
  "frc7900",
  "frc7915",
  "frc8024",
  "frc8531",
  "frc8700",
  "frc8701",
  "frc8744",
  "frc8782",
  "frc8802",
  "frc8847",
  "frc9149",
  "frc9425",
  "frc9578",
  "frc9676",
  "frc9760",
  "frc10264",
  "frc10287",
  "frc10430",
  "frc10522",
  "frc10553"
]

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
  gtag("event", "theme_dimension", {
    theme: darkmode.inDarkMode == true ? "dark" : "light",
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

  // this is only good for the 2025 season
  if (districtKey === "ca" || districtKey === "norcal" || districtKey === "socal" || districtKey === "wi") {
    if (districtKey === "ca")
      districtTeams = CA_TEAMS;

    if (districtKey === "wi")
      districtTeams = WI_TEAMS;

    let cachedTeams = JSON.parse(localStorage.getItem("districtTeams")) || {};
    cachedTeams[fullKey] = districtTeams;
    localStorage.setItem("districtTeams", JSON.stringify(cachedTeams));

    updateRankingsAndMatches();
    return;
  }

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
          <th colspan="2">Team</th>
          <th>Rank</th>
          <th>Division</th>
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
        <td>
          ${teamNumberFromKey(rank.team_key)}
        </td>
        <td>
          ${tbaIconLinkFromTeamKey(rank.team_key)}
          ${sbIconLinkFromTeamKey(rank.team_key)}
        </td>
        <td>${rank.rank}</td>
        <td>${eventNameFrom(rank.division)}</td>
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
  const tbaEventLink = tbaIconWithLink(`https://www.thebluealliance.com/event/${title}`);
  const sbEventLink = sbIconWithLink(`https://www.statbotics.io/event/${title}`);

  var result = `
      <div id="${eventName}" class="division">
        <h2>${eventName} ${title != eventName ? `${tbaEventLink + sbEventLink}` : ""}</h2>
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
        <td class="redScore${winner == "red" ? " matchWinner" : ""}">
          ${redScore}
        </td>

        <td>
          ${redRP != "---" && redRP != 0 ? "+" : ""}${redRP}
        </td>
      `;
      blueScoreRP = `
        <td class="blueScore${winner == "blue" ? " matchWinner" : ""}">
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

function tbaIconLinkFromTeamKey(teamKey) {
  const teamNumber = teamKey.slice(3);

  return tbaIconWithLink(`https://www.thebluealliance.com/team/${teamNumber}/${selectedYear}`);
}

function sbIconLinkFromTeamKey(teamKey) {
  const teamNumber = teamKey.slice(3);


  return sbIconWithLink(`https://www.statbotics.io/team/${teamNumber}/${selectedYear}`);
}

function tbaIconWithLink(link) {
  return `
    <a class="icon" href="${link}" target="_blank">
      <img src="./images/tba.webp" alt="TBA Icon" width="28" height="28">
    </a>
  `;
}

function sbIconWithLink(link) {
  return `
    <a class="icon" href="${link}" target="_blank">
      <img src="./images/sb.ico" alt="Statbotics Icon" width="28" height="28">
    </a>
  `;
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
