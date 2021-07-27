// People Data
fetch('people.json')
	.then(function (response) {
		return response.json();
	})
	.then(function (data) {
		var mainContainer = document.getElementById("personnel");
		for (var i = 0; i < data.length; i++) {
			var figure = document.createElement("figure");
			figure.innerHTML = '<h3>' + data[i].name + '</h3><h4>' + data[i].position + '</h4><img alt="a illustration of a face" src="' + data[i].img + '"/><hr><p>' + data[i].bio + '</p>';
			mainContainer.appendChild(figure);
		}
	})
	.catch(function (err) {
		console.log(err);
	});

// Shows Data
fetch('shows.json')
	.then(function (response) {
		return response.json();
	})
	.then(function (data) {
		var showContainer = document.getElementById("shows");
		var pastContainer = document.getElementById("past");
		const dateOptions = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' };
		const timeOptions = { hour12: true, hour: 'numeric', minute: '2-digit'};
		const result = data.filter(e => new Date(e.date) > new Date());
		const past = data.filter(e => new Date(e.date) < new Date());

		if (!result.length) {
			var figure = document.createElement("figure");
			figure.innerHTML = '<figcaption class="empty">No Upcoming Shows</figcaption>';
			showContainer.appendChild(figure);
		} else {
			for (var i = 0; i < result.length; i++) {
				var figure = document.createElement("figure");
				var date = new Date(result[i].date);
				figure.innerHTML = '<h3>' + date.toLocaleDateString('en-US', dateOptions) + '</h3><figcaption><a target="_blank" href="https://www.google.com/maps/search/?api=1&query='+ result[i].venue +'">' + result[i].venue + '</a><small>' + result[i].city + '</small><small>' + date.toLocaleTimeString('en-US', timeOptions) + ' &bull; ' + result[i].price + '</small></figcaption><hr><p>' + result[i].info + ' <a href="' + result[i].link + '" target="_blank">More Info...</a></p>';
				showContainer.appendChild(figure);
			}
		}

		if (!past.length) {
			var pastRow = document.createElement("tr");
			pastRow.innerHTML = '<td class="empty">No Past Shows</td>';
			pastContainer.appendChild(pastRow);
		} else {
			for (var i = 0; i < past.length; i++) {
				var pastRow = document.createElement("tr");
				var date = new Date(past[i].date);
				pastRow.innerHTML = '<td>' + date.toLocaleDateString('en-US', dateOptions) + '</td><td>'+ past[i].venue + '</td><td>' + past[i].city + '</td>';
				pastContainer.appendChild(pastRow);
			}
		}
	})
	.catch(function (err) {
		console.log(err);
	});

// Setlist Data
fetch('setlist.json')
	.then(function (response) {
		return response.json();
	})
	.then(function (data) {
		var setlistContainer = document.getElementById("setlist");

		if (!data.length) {
			var setRow = document.createElement("tr");
			setRow.innerHTML = '<td class="empty">Looks like we don\'t know any songs...</td>';
			setlistContainer.appendChild(setRow);
		} else {
			for (var i = 0; i < data.length; i++) {
				var setRow = document.createElement("tr");
				setRow.innerHTML = '<td>' + (i+1) + '</td><td>' + data[i].artist + '</td><td>'+ data[i].song + '</td><td>' + data[i].year + '</td>';
				setlistContainer.appendChild(setRow);
			}
		}
	})
	.catch(function (err) {
		console.log(err);
	});