$(document).ready(function(){
    $('.modal').modal();
    $('select').formSelect();
});

//omdb key
var apiKey = "90e49496";

//var apiKey2 = "k_esgvbo9o";
var apiKey2 = "k_n93546yy";

var searchCount = localStorage.getItem("searchCount");
var isNewSearch = true;

if (!searchCount) {
    var searchCount = 0;
    searchCount = window.searchCount;
} else {
    searchCount = window.searchCount;
}

// initialize empty arrays and obj. if it's an initial search, otherwise get from LS
if (!JSON.parse(localStorage.getItem("titleData"))) {
    var titleData = [];
    var dataElement = {};
} else {
    var titleData = JSON.parse(localStorage.getItem("titleData"));
    console.log(titleData);
    var dataElement = {};
}

// omdb api search for title, returns first result in the primary display via displayMainTitle()
function getTitle(name) {
    var apiUrlTitle = "http://www.omdbapi.com/?apikey=" + apiKey + "&s=" + name;
        fetch(apiUrlTitle)
            .then(response=> response.json())
            .then(data=> {
                console.log(data);
                if (data.Response === "True") {
                    var imdbID = data.Search[0].imdbID;
                    var apiUrlTitle2 = "http://www.omdbapi.com/?apikey=" + apiKey + "&i=" + imdbID + "&plot=full";

                       fetch(apiUrlTitle2)
                            .then(response => response.json())
                            .then(data=> {
                                console.log(data)
                                displayMainTitle(data);
                            });
                } else if (data.Error === "Movie not found!") { console.log("Error: No results found"); }
            });
}

// imdb api advanced search for genres, use commas for multiple keywords?, TO DO: returns a list in the primary display
function getGenres(genre) {
    var apiUrlGenre = "https://imdb-api.com/API/AdvancedSearch/" + apiKey2 + "/?genres=" + genre;
        fetch(apiUrlGenre)
            .then(response=> response.json())
            .then(data=> {
                if (data.results.length > 0) {
                    console.log(data);
                } else { 
                    console.log("Error: No results found")
                }
            });
}

// used to submit the search for a title via omdb api
var formSubmitHandler = function(event) {
    event.preventDefault();

    var searchName = searchNameEl.value.trim();
    if (searchName) {
        getTitle(searchName);
        searchNameEl.value = "";
    } else {
        alert("Please enter a title!");
    }
};

// used to submit the search for a single genre or multiples (use commas for that??)
var formSubmitHandler2 = function(event) {
    event.preventDefault();

    var searchGenre = searchNameEl.value.trim();
    if (searchGenre) {
        getGenres(searchGenre);
        searchNameEl.value = "";
    } else {
        alert("Please enter a genre!");
    }
};

function displayMainTitle(data) {
    console.log(data);
    // remove elements on the page first for searching additional times
    $(".main-title").remove();
    $(".secondary-data").remove();
    $(".secondary-img").remove();

    // one div showing title and year released
    var mainTitleDiv = $("<div></div>", { id: "main-title", class: "main-title col s12 m6 l6 xl6" });
    $(mainTitleDiv).appendTo("#row-1");
    var mainTitleData = $("<p></p>", { id: "main-data", class: "main-data" });
    $(mainTitleData).html(data.Title + "<br>" + "<em>" + data.Year + "</em>" + "<br>");
    $(mainTitleData).appendTo(mainTitleDiv);

    // two divs side by side, or full length if mobile 
    var secondaryDataDiv = $("<div></div>", { id: "secondary-data-div", class: "secondary-data col s12 m8 l8 xl8" });
    var secondaryImgDiv = $("<div></div>", { id: "secondary-img-div", class: " secondary-img col s12 m4 l4 xl4" }); 
    $(secondaryDataDiv).appendTo("#row-2");
    $(secondaryImgDiv).appendTo("#row-2");
    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data" });
    var rottenTom = JSON.stringify(data.Ratings[1]);
    rottenTom = rottenTom.replace(/[{}]/g, '');
    rottenTom = rottenTom.replace(/\"/g, "");
    rottenTom = rottenTom.replace('Source:Rotten Tomatoes,Value:', '');

    $(secondaryData).html("<span class='gold'>Stars:</span> " + data.Actors + "<br><span class='gold'>Runtime:</span><em> " + data.Runtime + "</em><br><span class='gold'>Director:</span> " + data.Director +  "<br><span class='gold'>Content Rating:</span> " + data.Rated + "<br><span class='gold'>Awards:</span> " + data.Awards + "<br><span class='gold'>Rotten Tomatoes:</span> " + rottenTom);
    $(secondaryImgDiv).prepend('<img id="poster-img" src="' + data.Poster + '" width="285" height="440.39"/>');
    $("#poster-img").appendTo(secondaryImgDiv);
    $(secondaryData).appendTo(secondaryDataDiv);
    $(secondaryDataDiv).append("<button data-target='plot' class='btn modal-trigger bottom'>Display plot summary</button>"); 
    $("#para").html(data.Plot);

    function saveTitleData(data) {
        // set the variables in LS
        // var title = data.Title;
        // dataElement.Title = title;

        // var year = data.Year;
        // dataElement.Year = year;

        // var actors = data.Actors;
        // dataElement.Actors = actors;

        // var runtime = data.Runtime;
        // dataElement.Runtime = runtime;

        // var director = data.Director;
        // dataElement.Director = director;

        // var rating = data.Rating;
        // dataElement.Rating = rating;

        // var awards = data.Awards;
        // dataElement.Awards = awards;

        // var image = data.Poster;
        // dataElement.Image = image;

        // var plot = data.Plot;
        // dataElement.Plot = plot;

        // dataElement.rottenTom = rottenTom;
        // dataElement.genreList = genreArr;

        // localStorage.setItem("searchCount", window.searchCount)
        // dataElement.searchCount = window.searchCount;
        console.log(titleData);
        console.log(data);
        titleData.push(data);
        localStorage.setItem("titleData", JSON.stringify(titleData));
    }
    console.log(titleData);
    if (titleData.length > 0) {
        // confirm if a title has already been searched for by using a boolean
        for (i = 0; i < titleData.length; i++) {
            if (titleData[i].title === data.title) {
                isNewSearch = false;
            } else {
                isNewSearch = true;
            }
        }
    }
    
    // only add buttons for genres if that genre has not appeared yet in a search
    if (isNewSearch === true) {
        var genreList = data.Genre;
        var genreArr = genreList.split(",").map(item => item.trim());
        if (window.searchCount > 0) {
            for (let y = 0; y < genreArr.length; y++) {
                var currentBtn = genreArr[y];
                if ($("#btn" + currentBtn).length == 1) {
                    // do nothing
                } else {
                    $("#button-div").append("<button id='btn" + currentBtn + "' class='inline waves-effect waves-light btn-small'>" + currentBtn + "</button>");
                }
            }
        } else {
            // this else signifies being a first search
            for (let i = 0; i < genreArr.length; i++) {
                var currentBtn = genreArr[i];
                $("#button-div").append("<button id='btn" + currentBtn + "' class='inline waves-effect waves-light btn-small'>" + currentBtn + "</button>");  
            }
        }

        // last part of this if isNewSearch is to increment the search count
        window.searchCount += 1;
    }

    // run function to set items to LS (this is after buttons have been added or not)
    saveTitleData(data); 

    // get the updated list from LS so the app has it before the next search
    titleData = localStorage.getItem("titleData")
    titleData = JSON.parse(titleData);
}

// query selectors for the search by title form
var searchFormEl = document.querySelector("#search-form");
var searchNameEl = document.querySelector("#name");
// default search is by title
searchFormEl.addEventListener("submit", formSubmitHandler);

function moviesFromLocalStorage () {
    console.log(titleData);
    titleData.forEach(movie => {
        var moviebutton = document.createElement("button");
        moviebutton.innerText = movie.Title
        moviebutton.onclick = searchMovie
        document.getElementById("local-search").append(moviebutton);
    })
}
moviesFromLocalStorage();

function searchMovie (event) {
    console.log(event.target);
    var movie = titleData.find(title => title.Title == event.target.innerText);
    console.log(movie);
    displayMainTitle(movie);
}


// toggle functionality to change the search type and the API call involved
$("#selection-type").on('change', function() {
    $("#name").attr('placeholder', 'Search ' + $("#selection-type").find(':selected').text());

    if ($("#selection-type").val() === "1") {
        searchFormEl.removeEventListener("submit", formSubmitHandler2); 
        searchFormEl.addEventListener("submit", formSubmitHandler);
    } else if ($("#selection-type").val() === "2") {
        searchFormEl.removeEventListener("submit", formSubmitHandler); 
        searchFormEl.addEventListener("submit", formSubmitHandler2);
    }
});