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

// Our collection of timeZones
const timeZones = [];

// Reference to our table
const table = document.getElementById("meeting-planner");

// Handle Form
const form = document.querySelector("form");
form.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const name = form.elements["name"].value;
  const tz = Temporal.TimeZone.from(form.elements["timezone"].value);
  timeZones.push({ name, tz });
  table.innerHTML = "";
  renderTable();
  getPreferredTimes();
});

const renderTable = () => {
  // Start the table at midnight local time
  const startTime = Temporal.now.zonedDateTimeISO().startOfDay();

  // Build the table
  timeZones.forEach(({ name, tz }) => {
    const inTz = startTime.withTimeZone(tz);
    const row = document.createElement("tr");

    const title = document.createElement("td");
    title.textContent = `${tz.id} (UTC${inTz.offset})`;
    row.appendChild(title);

    for (let hours = 0; hours < 24; hours++) {
      const cell = document.createElement("td");

      const zdt = inTz.add({ hours });
      cell.className = `time-${zdt.hour}`;

      // Highlight the current hour in each row
      if (hours === inTz.hour) cell.className += " time-current";

      /* 
        // Uncomment code below after the `toLocaleString` polyfill bug is fixed

        // Show the date in midnight cells
        let formatOptions;
        if (dt.hour === 0) {
          formatOptions = { month: "short", day: "numeric" };
        } else {
          formatOptions = { hour: "numeric" };
        }
        cell.textContent = inTz.toLocaleString(undefined, formatOptions);
      */
      cell.textContent = zdt.hour.toString();
      
      row.appendChild(cell);
    }

    table.appendChild(row);
  });
};

  // Display local time zone and three others
const getPreferredTimes = () => {
  // Start with an array representing each hour of the day
  const referenceHours = new Array(24).fill(0);

  // Start the table at midnight local time
  const startTime = Temporal.now.zonedDateTimeISO().startOfDay();

  timeZones.forEach(({ tz }) => {
    const inTz = startTime.withTimeZone(tz);
    for (let hours = 0; hours < 24; hours++) {
      const zdt = inTz.add({ hours });
      // Set null all the hours this timezone cannot do
      referenceHours[hours] = referenceHours[hours] += getHourScore(zdt);
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
