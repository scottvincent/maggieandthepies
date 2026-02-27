// Shared date formatting options
const DATE_OPTIONS = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
const TIME_OPTIONS = { hour12: true, hour: 'numeric', minute: '2-digit' };

// Utility function for fetching JSON
const fetchJSON = (url) => fetch(url).then(response => response.json());

// Utility function to create and append elements
const createElement = (tag, innerHTML, parent) => {
  const element = document.createElement(tag);
  element.innerHTML = innerHTML;
  parent.appendChild(element);
  return element;
};

// Setlist sort comparator
const sortSetlist = (a, b) => {
  const stripThe = (name) => name.replace(/^The\s+/i, '').trim();
  const artistA = stripThe(a?.artist ? String(a.artist) : '');
  const artistB = stripThe(b?.artist ? String(b.artist) : '');
  const artistCompare = artistA.localeCompare(artistB, undefined, { sensitivity: 'base' });
  if (artistCompare !== 0) return artistCompare;

  const yearA = parseInt(a?.year || '', 10);
  const yearB = parseInt(b?.year || '', 10);
  const yearAValid = !isNaN(yearA);
  const yearBValid = !isNaN(yearB);
  if (yearAValid && yearBValid && yearA !== yearB) return yearA - yearB;
  if (yearAValid !== yearBValid) return yearAValid ? -1 : 1;

  const songA = (a?.song ? String(a.song) : '').trim();
  const songB = (b?.song ? String(b.song) : '').trim();
  return songA.localeCompare(songB, undefined, { sensitivity: 'base' });
};

// People Data
fetchJSON('people.json')
  .then(data => {
    const fragment = document.createDocumentFragment();
    data.forEach(person => {
      const figure = document.createElement('figure');
      figure.innerHTML = `<img alt="a picture of ${person.name} performing" src="${person.img}"/>
        <figcaption>${person.name}<small>${person.position}</small></figcaption>`;
      fragment.appendChild(figure);
    });
    document.getElementById('personnel').appendChild(fragment);
  })
  .catch(err => console.error('Error loading people:', err));

// Shows Data
fetchJSON('shows.json')
  .then(data => {
    const showContainer = document.getElementById('shows');
    const pastContainer = document.getElementById('past');
    const now = new Date();
    
    const upcomingShows = data.filter(show => new Date(show.startDate) > now);
    const pastShows = data
      .filter(show => new Date(show.startDate) < now)
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate)); // Newest first

    // Upcoming shows
    if (!upcomingShows.length) {
      createElement('figure', '<figcaption class="empty">No Upcoming Shows</figcaption>', showContainer);
    } else {
      const fragment = document.createDocumentFragment();
      upcomingShows.forEach(show => {
        const date = new Date(show.startDate);
        const venue = show.location?.name 
          ? `<a target="_blank" href="https://www.google.com/maps/search/?api=1&query=${show.location.name}">${show.location.name}</a>` 
          : '';
        const price = show.offers?.price ? ` &bull; $${show.offers.price}` : '';
        const link = show.url ? ` <a href="${show.url}" target="_blank">More Info...</a>` : '';

        const figure = document.createElement('figure');
        figure.innerHTML = `<h3>${date.toLocaleDateString('en-US', DATE_OPTIONS)}</h3>
          <figcaption>
            ${venue}
            <small>${show.location?.address || ''}</small>
            <small>${date.toLocaleTimeString('en-US', TIME_OPTIONS)}${price}</small>
          </figcaption><hr>
          <p>${show.description || ''}${link}</p>`;
        fragment.appendChild(figure);
      });
      showContainer.appendChild(fragment);
    }

    // Past shows
    if (!pastShows.length) {
      createElement('tr', '<td class="empty">No Past Shows</td>', pastContainer);
    } else {
      createElement('thead', '<tr class="sr-only"><th scope="col">Date</th><th scope="col">Venue</th></tr>', pastContainer);
      const fragment = document.createDocumentFragment();
      
      // Group shows by year
      let currentYear = null;
      const dateOptionsDay = { weekday: 'long' };
      const dateOptionsMonthDay = { month: 'long', day: 'numeric' };
      
      pastShows.forEach(show => {
        const date = new Date(show.startDate);
        const showYear = date.getFullYear();
        
        // Add year header row if year changed
        if (showYear !== currentYear) {
          currentYear = showYear;
          const yearRow = document.createElement('tr');
          yearRow.innerHTML = `<th colspan="2">${showYear}</th>`;
          fragment.appendChild(yearRow);
        }
        
        // Add show row without year
        const dayOfWeek = date.toLocaleDateString('en-US', dateOptionsDay);
        const monthDay = date.toLocaleDateString('en-US', dateOptionsMonthDay);
        const row = document.createElement('tr');
        row.innerHTML = `<td><small>${dayOfWeek}</small><br>${monthDay}</td>
          <td>${show.location?.name || ''}<br><small>${show.location?.address || ''}</small></td>`;
        fragment.appendChild(row);
      });
      pastContainer.appendChild(fragment);
    }
  })
  .catch(err => console.error('Error loading shows:', err));

// Setlist Data
fetchJSON('setlist.json')
  .then(data => {
    const setlistContainer = document.getElementById('setlist');

    if (!data.length) {
      createElement('tr', '<td class="empty">Looks like we don\'t know any songs...</td>', setlistContainer);
    } else {
      createElement('thead', '<tr class="sr-only"><th scope="col">Index</th><th scope="col">Artist</th><th scope="col">Song Title</th><th scope="col">Release Year</th></tr>', setlistContainer);
      
      const fragment = document.createDocumentFragment();
      data.sort(sortSetlist).forEach((song, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${index + 1}</td>
          <td>${song.artist}</td>
          <td>${song.song}</td>
          <td>${song.year}</td>`;
        fragment.appendChild(row);
      });
      setlistContainer.appendChild(fragment);
    }
  })
  .catch(err => console.error('Error loading setlist:', err));