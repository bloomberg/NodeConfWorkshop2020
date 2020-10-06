/*
 ** Copyright 2020 Bloomberg Finance L.P.
 **
 ** Licensed under the Apache License, Version 2.0 (the "License");
 ** you may not use this file except in compliance with the License.
 ** You may obtain a copy of the License at
 **
 **     http://www.apache.org/licenses/LICENSE-2.0
 **
 ** Unless required by applicable law or agreed to in writing, software
 ** distributed under the License is distributed on an "AS IS" BASIS,
 ** WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 ** See the License for the specific language governing permissions and
 ** limitations under the License.
 */
import { Temporal } from "proposal-temporal";
import { Record, Tuple, Box } from "@bloomberg/record-tuple-polyfill";

// Our collection of timeZones
let timeZones = #[];

// Reference to our table
const table = document.getElementById("meeting-planner");

// Handle Form
const form = document.querySelector("form");
form.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const name = form.elements["name"].value;
  const tz = Temporal.TimeZone.from(form.elements["timezone"].value);
  timeZones = timeZones.pushed(#{ name, boxedTz: Box(tz) });
  table.innerHTML = "";
  renderTable();
  getPreferredTimes();
});

const renderTable = () => {
  // Display local time zone and three others
  const here = Temporal.now.timeZone();
  const now = Temporal.now.absolute();

  // Start the table at midnight local time
  const calendarNow = now.toDateTime(here);
  const startTime = calendarNow
    .with(Temporal.Time.from("00:00")) // midnight
    .toAbsolute(here);

  // Build the table
  timeZones.forEach(({ name, boxedTz }) => {
    const tz = boxedTz.unbox();

    const row = document.createElement("tr");

    const title = document.createElement("td");
    title.textContent = `${name} (UTC${tz.getOffsetStringFor(now)})`;
    row.appendChild(title);

    for (let hours = 0; hours < 24; hours++) {
      const cell = document.createElement("td");

      const dt = startTime.plus({ hours }).toDateTime(tz);
      cell.className = `time-${dt.hour}`;

      // Highlight the current hour in each row
      if (hours === calendarNow.hour) cell.className += " time-current";

      // Show the date in midnight cells
      let formatOptions;
      if (dt.hour === 0) {
        formatOptions = { month: "short", day: "numeric" };
      } else {
        formatOptions = { hour: "numeric" };
      }
      cell.textContent = dt.toLocaleString(undefined, formatOptions);
      row.appendChild(cell);
    }

    table.appendChild(row);
  });
};

const getPreferredTimes = () => {
  // Display local time zone and three others
  const here = Temporal.now.timeZone();
  const now = Temporal.now.absolute();

  // Start the table at midnight local time
  const calendarNow = now.toDateTime(here);
  const startTime = calendarNow
    .with(Temporal.Time.from("00:00")) // midnight
    .toAbsolute(here);

  // Start with an array representing each hour of the day
  const referenceHours = new Array(24).fill(0);

  timeZones.forEach(({ boxedTz }) => {
    const tz = boxedTz.unbox();
    for (let hours = 0; hours < 24; hours++) {
      const dt = startTime.plus({ hours }).toDateTime(tz);
      // Set null all the hours this timezone cannot do
      referenceHours[hours] = referenceHours[hours] += getHourScore(dt);
    }
  });
  const result = referenceHours.reduce(
    (acc, v, i) => {
      if (v > acc.score) {
        return { idx: i, score: v };
      }
      return acc;
    },
    { idx: 0, score: 0 }
  );

  setBorder(result.idx);
};

/**
 *
 * @param {number} idx
 * @returns {void}
 */
const setBorder = (idx) => {
  const tds = document.querySelectorAll(`td:nth-child(${idx + 2})`);
  tds.forEach((td) => {
    td.classList.add("best-time");
  });
};

/**
 *
 * @param {Temporal.DateTime} dt
 * @returns {number} score
 */
const getHourScore = (dt) => {
  const hour = dt.hour;
  console.log(hour);
  if (hour < 22 && hour > 18) {
    // Late
    return 1;
  } else if (hour < 8 || hour > 17) {
    // unavailable
    return 0;
  } else {
    // Available
    return 2;
  }
};
