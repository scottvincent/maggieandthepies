// Shared date formatting options
const DATE_OPTIONS = { weekday: "short", year: "numeric", month: "long", day: "numeric" };
const TIME_OPTIONS = { hour12: true, hour: "numeric", minute: "2-digit" };
const DAY_OPTIONS = { weekday: "long" };
const MONTH_DAY_OPTIONS = { month: "long", day: "numeric" };

const dateFormatter = new Intl.DateTimeFormat("en-US", DATE_OPTIONS);
const timeFormatter = new Intl.DateTimeFormat("en-US", TIME_OPTIONS);
const dayFormatter = new Intl.DateTimeFormat("en-US", DAY_OPTIONS);
const monthDayFormatter = new Intl.DateTimeFormat("en-US", MONTH_DAY_OPTIONS);

// Utility function for fetching JSON
const fetchJSON = (url) =>
  fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    return response.json();
  });

// Utility function to create and append elements
const createElement = (tag, innerHTML, parent) => {
  const element = document.createElement(tag);
  element.innerHTML = innerHTML;
  parent.appendChild(element);
  return element;
};

// Setlist sort comparator
const sortSetlist = (a, b) => {
  const stripThe = (name) => name.replace(/^The\s+/i, "").trim();
  const artistA = stripThe(a?.artist ? String(a.artist) : "");
  const artistB = stripThe(b?.artist ? String(b.artist) : "");
  const artistCompare = artistA.localeCompare(artistB, undefined, { sensitivity: "base" });
  if (artistCompare !== 0) return artistCompare;

  const yearA = parseInt(a?.year || "", 10);
  const yearB = parseInt(b?.year || "", 10);
  const yearAValid = !isNaN(yearA);
  const yearBValid = !isNaN(yearB);
  if (yearAValid && yearBValid && yearA !== yearB) return yearA - yearB;
  if (yearAValid !== yearBValid) return yearAValid ? -1 : 1;

  const songA = (a?.song ? String(a.song) : "").trim();
  const songB = (b?.song ? String(b.song) : "").trim();
  return songA.localeCompare(songB, undefined, { sensitivity: "base" });
};

// People Data
const teamBannerSvg = `
  <svg class="team-banner" viewBox="0 0 131.66183 79.176903" aria-hidden="true" focusable="false">
    <g transform="translate(20.245031,15.912448) scale(0.85, 1.3)">
      <g>
        <path d="m -20.0734,32.05221 8,17 6.00241,0.92417 -1.50241,13.07583 30.09262,-9.44365 41.06468,-9.69713 c 0,0 17.45114,-4.58631 26.85574,-7.11134 16.47986,-4.42466 20.25842,-13.83519 20.38342,-18.21019 1.0625,-2.71875 -0.11677,-30.783301 -0.11677,-30.783301 -0.003,-0.726468 0.0834,-2.6126 -1.41356,-3.46427 l -0.0715,3.2794 c -1.72517,7.64159 -8.32748,14.570481 -22.29466,21.680481 -8.10983,4.12832 -107,22.75 -107,22.75 z" style="fill:#000;fill-opacity:1;fill-rule:evenodd;stroke:#000;stroke-width:.3;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"/></g>
      <g>
        <path d="m -19.51256,25.19052 8.25,16.75 -3.75,16 c 0,0 30.07129,-8.36569 41.84986,-10.51311 18.2677,-3.33049 50.61126,-9.23206 63.57692,-12.85301 10.37003,-3.51256 18.66941,-9.57106 18.71967,-18.22487 l 0.34283,-28.776968 c -0.75,3.9375 -9.14171,12.153808 -20.73928,14.617958 z" style="fill:var(--theme-pink);fill-opacity:1;fill-rule:evenodd;stroke:#000;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"/>
      </g>
    </g>
  </svg>`;

const positionBannerSvg = `
  <svg class="position-banner" viewBox="0 0 69.49556 65.326904" aria-hidden="true" focusable="false">
    <g transform="translate(-185.6569,-223.70495)">
      <g transform="translate(50,38)">
        <g transform="translate(-81,-106)">
          <path d="m 216.76692,352.85095 c -0.82075,-7.07106 4.02479,-29.46399 4.02479,-29.46399 0,0 5.37298,-12.27344 14.04754,-13.81608 l 45.1359,-8.02677 c 0,0 2.09043,-2.89688 5.69975,-5.1466 l -2.93152,18.56621 2.42759,5.54867 -53.53502,14.48708 c -1.625,1.25 -9.91711,3.59208 -11.78959,11.9696 0,0 -0.10004,4.09271 0.3205,10.06278 l -1.93646,-2.1652" style="fill:#000;fill-rule:evenodd"/>
          <path d="m 216.9069,350.06389 0.0217,-26.79097 c 0,0 -0.94157,-12.16645 12.23214,-15.44643 l 43.75,-10.89286 c 0,0 6.78572,-1.87499 10.08929,-4.55357 l -3.75,14.28571 6.51786,10.71429 -54.92858,15.51786 c 0,0 -8.18445,3.31242 -11.57142,11.96428 l -1.44322,3.68664 -0.81888,2.47806" style="fill:var(--theme-light-blue);fill-opacity:1;fill-rule:evenodd;stroke:#000;stroke-width:.5;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"/>
        </g>
      </g>
    </g>
  </svg>`;

fetchJSON("people.json")
  .then((data) => {
    // Seeded random function based on person.id for consistent tilts
    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const fragment = document.createDocumentFragment();
    data.forEach((person, index) => {
      const card = document.createElement("div");
      card.className = "baseball-card";
      // Generate consistent tilt based on person's ID
      const randomTilt = (seededRandom(parseInt(person.id || index)) - 0.5) * 10;
      card.style.setProperty("--card-tilt", `${randomTilt}deg`);

      const flipper = document.createElement("div");
      flipper.setAttribute("aria-label", `${person.name} baseball card`);
      flipper.setAttribute("role", "button");
      flipper.setAttribute("tabindex", "0");
      flipper.className = "baseball-flipper";
      flipper.innerHTML = `
        <section class="front">
          <address class="player-name">${person.name}</address>
          <div class="player-photo" style="background-image:url('${person.img}')"></div>
          <p class="position">${person.position}</p>
          <img src="/logos/SVG/MATP-White-Text-Outline.svg" alt="" class="team-logo" aria-hidden="true">
          ${teamBannerSvg}
          ${positionBannerSvg}
        </section>
        <section class="back">
        </section>`;

      const toggleFlip = () => flipper.classList.toggle("flipped");
      flipper.addEventListener("click", toggleFlip);
      flipper.addEventListener("keydown", (e) => {
        if (e.code === "Space" || e.code === "Enter") {
          e.preventDefault();
          toggleFlip();
        }
      });

      card.appendChild(flipper);
      fragment.appendChild(card);
    });
    document.getElementById("personnel").appendChild(fragment);
  })
  .catch((err) => console.error("Error loading people:", err));

// Shows Data
fetchJSON("shows.json")
  .then((data) => {
    const showContainer = document.getElementById("shows");
    const pastContainer = document.getElementById("past");
    const now = new Date();

    // Parse each date once and reuse it for filtering, sorting, and formatting.
    const showsWithDate = data.map((show) => ({
      ...show,
      _parsedDate: new Date(show.startDate),
    }));

    const upcomingShows = showsWithDate.filter((show) => show._parsedDate > now);
    const pastShows = showsWithDate.filter((show) => show._parsedDate < now).sort((a, b) => b._parsedDate - a._parsedDate); // Newest first

    // Upcoming shows
    if (!upcomingShows.length) {
      createElement("figure", '<figcaption class="empty">No Upcoming Shows</figcaption>', showContainer);
    } else {
      const fragment = document.createDocumentFragment();
      upcomingShows.forEach((show) => {
        const date = show._parsedDate;
        const venue = show.location?.name
          ? `<a target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(show.location.name)}">${show.location.name}</a>`
          : "";
        const price = show.offers?.price ? ` &bull; $${show.offers.price}` : "";
        const link = show.url ? ` <a href="${show.url}" target="_blank" rel="noopener noreferrer">More Info...</a>` : "";

        const figure = document.createElement("figure");
        figure.innerHTML = `<h3>${dateFormatter.format(date)}</h3>
          <figcaption>
            ${venue}
            <small>${show.location?.address || ""}</small>
            <small>${timeFormatter.format(date)}${price}</small>
          </figcaption><hr>
          <p>${show.description || ""}${link}</p>`;
        fragment.appendChild(figure);
      });
      showContainer.appendChild(fragment);
    }

    // Past shows
    if (!pastShows.length) {
      createElement("tr", '<td class="empty">No Past Shows</td>', pastContainer);
    } else {
      createElement("thead", '<tr class="sr-only"><th scope="col">Date</th><th scope="col">Venue</th></tr>', pastContainer);
      const fragment = document.createDocumentFragment();

      // Group shows by year
      let currentYear = null;

      pastShows.forEach((show) => {
        const date = show._parsedDate;
        const showYear = date.getFullYear();

        // Add year header row if year changed
        if (showYear !== currentYear) {
          currentYear = showYear;
          const yearRow = document.createElement("tr");
          yearRow.innerHTML = `<th colspan="2">${showYear}</th>`;
          fragment.appendChild(yearRow);
        }

        // Add show row without year
        const dayOfWeek = dayFormatter.format(date);
        const monthDay = monthDayFormatter.format(date);
        const row = document.createElement("tr");
        row.innerHTML = `<td><small>${dayOfWeek}</small><br>${monthDay}</td>
          <td>${show.location?.name || ""}<br><small>${show.location?.address || ""}</small></td>`;
        fragment.appendChild(row);
      });
      pastContainer.appendChild(fragment);
    }
  })
  .catch((err) => console.error("Error loading shows:", err));

// Setlist Data
fetchJSON("setlist.json")
  .then((data) => {
    const setlistContainer = document.getElementById("setlist");

    if (!data.length) {
      createElement("tr", '<td class="empty">Looks like we don\'t know any songs...</td>', setlistContainer);
    } else {
      createElement(
        "thead",
        '<tr class="sr-only"><th scope="col">Index</th><th scope="col">Artist</th><th scope="col">Song Title</th><th scope="col">Release Year</th></tr>',
        setlistContainer,
      );

      const fragment = document.createDocumentFragment();
      data.sort(sortSetlist).forEach((song, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${index + 1}</td>
          <td>${song.artist}</td>
          <td>${song.song}</td>
          <td>${song.year}</td>`;
        fragment.appendChild(row);
      });
      setlistContainer.appendChild(fragment);
    }
  })
  .catch((err) => console.error("Error loading setlist:", err));
