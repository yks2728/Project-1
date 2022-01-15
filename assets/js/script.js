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
var isNewGenre = true;

if (!searchCount) {
    var searchCount = 0;
}

// initialize empty arrays and obj. if it's 
// an initial search, otherwise get from LS
if (window.searchCount === 0) {
    var titleData = [];
    var dataElement = {};
    var genreData = [];
    var genreElement = {};
} else {
    var titleData = localStorage.getItem(titleData);
    titleData = JSON.parse(titleData);
    if (!titleData) {
        var titleData = [];
    }
    var genreData = localStorage.getItem(genreData);
    genreData = JSON.parse(genreData);
    if (!genreData) {
        var genreData = [];
    }
    var dataElement = {};
    var genreElement = {};
}

// omdb api search for title, returns first result
// in the primary display via displayMainTitle()
function getTitle(name) {
    var apiUrlTitle = "https://www.omdbapi.com/?apikey=" + apiKey + "&s=" + name;
        fetch(apiUrlTitle)
            .then(response=> response.json())
            .then(data=> {
                console.log(data);
                if (data.Response === "True") {
                    var imdbID = data.Search[0].imdbID;
                    var apiUrlTitle2 = "https://www.omdbapi.com/?apikey=" + apiKey + "&i=" + imdbID + "&plot=full";
                        fetch(apiUrlTitle2)
                            .then(response => response.json())
                            .then(data=> {
                                console.log(data)
                                displayMainTitle(data);
                            });
                } else if (data.Error === "Movie not found!") { console.log("Error: No results found"); }
            });
}

// imdb api advanced search for genre(s), 
// use commas and spaces for multiple genres
function getGenres(genre) {
    var apiUrlGenre = "https://imdb-api.com/API/AdvancedSearch/" + apiKey2 + "/?genres=" + genre;

        if (genreData.length > 0) {
            // confirm if genre(s) is(are) a new unique search 
            // and isn't(aren't) stored already by using a boolean
            for (i = 0; i < genreData.length; i++) {
                var string = genreData[i].queryString.replace('?genres=','');
                if (string === genre) {
                    isNewGenre = false;
                    var genreRecallArr = genreData[i];
                    break;
                } else {
                    isNewGenre = true;
                }
            }
        }

    if (isNewGenre === true) {
        fetch(apiUrlGenre)
            .then(response=> response.json())
            .then(data=> {
                console.log(data);
                if (data.results.length > 0) {
                    displayNamesViaGenre(data, genre);
                } else { 
                    console.log("Error: No results found")
                }
            });
    } else { recallGenreSearch(genreRecallArr) };
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

// used to submit the search for genre(s) via imdb api adv. search
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
    if (data.Ratings[1]) {
    var rottenTom = JSON.stringify(data.Ratings[1]);
    rottenTom = rottenTom.replace(/[{}]/g, '');
    rottenTom = rottenTom.replace(/\"/g, "");
    rottenTom = rottenTom.replace('Source:Rotten Tomatoes,Value:', '');
    } else { var rottenTom = "Unavailable" }

    $(secondaryData).html("<span class='gold'>Stars:</span> " + data.Actors + "<br><span class='gold'>Runtime:</span><em> " + data.Runtime + "</em><br><span class='gold'>Genres:</span> " + data.Genre + "<br><span class='gold'>Director:</span> " + data.Director +  "<br><span class='gold'>Content Rating:</span> " + data.Rated + "<br><span class='gold'>Awards:</span> " + data.Awards + "<br><span class='gold'>Rotten Tomatoes:</span> " + rottenTom);
    $(secondaryImgDiv).prepend('<img id="poster-img" src="' + data.Poster + '" width="285" height="440.39"/>');
    $("#poster-img").appendTo(secondaryImgDiv);
    $(secondaryData).appendTo(secondaryDataDiv);
    $(secondaryDataDiv).append("<button data-target='plot' class='btn modal-trigger bottom'>Display plot summary</button>"); 
    $("#para").html(data.Plot);

    function saveTitleData(data) {
        // set the variables in LS
        var title = data.Title;
        dataElement.title = title;

        var year = data.Year;
        dataElement.year = year;

        var actors = data.Actors;
        dataElement.actors = actors;

        var runtime = data.Runtime;
        dataElement.runtime = runtime;

        var genres = data.Genre
        dataElement.genres = genres; 

        var director = data.Director;
        dataElement.director = director;

        var rating = data.Rated;
        dataElement.rating = rating;

        var awards = data.Awards;
        dataElement.awards = awards;

        var image = data.Poster;
        dataElement.image = image;

        var plot = data.Plot;
        dataElement.plot = plot;

        dataElement.rottenTom = rottenTom;

        localStorage.setItem("searchCount", window.searchCount)
        dataElement.searchCount = window.searchCount;

        titleData.push(dataElement);
        localStorage.setItem("titleData", JSON.stringify(titleData));
    }

    if (titleData.length > 0) {
        // confirm if a title has already been searched for by using a boolean
        for (i = 0; i < titleData.length; i++) {
            if (titleData[i].title === data.Title) {
                isNewSearch = false;
            } else {
                isNewSearch = true;
            }
        }
    }
    
    // if this search has not yet been registered, add a new button
    if (isNewSearch === true) {
        var recentBtn = document.createElement("button");
        recentBtn.textContent = "" + data.Title;
        var buttonDiv = document.querySelector("#button-div");
        // if isNewSearch increment the search count
        window.searchCount += 1;
        recentBtn.setAttribute("id", "btn" + window.searchCount)
        recentBtn.classList = "inline waves-effect waves-light btn-small";
        buttonDiv.appendChild(recentBtn);
    }

    if (isNewSearch === true) {
        saveTitleData(data); 
    }

    // refresh and parse the titleData array
    titleData = localStorage.getItem("titleData")
    titleData = JSON.parse(titleData);

    // create recent search buttons' "on click" assignments
    for (let i = 0; i < titleData.length; i++) {
        $(document).on('click','#btn' + titleData[i].searchCount,function() {
            // remove whats on the page first
            $(".main-title").remove();
            $(".secondary-data").remove();
            $(".secondary-img").remove();
            
            recallTitleSearch(titleData[i]);
        });
    }
}

function recallTitleSearch(arr) {
// is a copy of the 1st half of displayMainTitle() with datapoints relating to LS instead of
// the api call without any of the data saving and button adding of that function
    // remove elements on the page first
    $(".main-title").remove();
    $(".secondary-data").remove();
    $(".secondary-img").remove();

    // one div showing title and year released
    var mainTitleDiv = $("<div></div>", { id: "main-title", class: "main-title col s12 m6 l6 xl6" });
    $(mainTitleDiv).appendTo("#row-1");
    var mainTitleData = $("<p></p>", { id: "main-data", class: "main-data" });
    $(mainTitleData).html(arr.title + "<br>" + "<em>" + arr.year + "</em>" + "<br>");
    $(mainTitleData).appendTo(mainTitleDiv);

    // two divs side by side, or full length if mobile 
    var secondaryDataDiv = $("<div></div>", { id: "secondary-data-div", class: "secondary-data col s12 m8 l8 xl8" });
    var secondaryImgDiv = $("<div></div>", { id: "secondary-img-div", class: " secondary-img col s12 m4 l4 xl4" }); 
    $(secondaryDataDiv).appendTo("#row-2");
    $(secondaryImgDiv).appendTo("#row-2");
    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data" });

    $(secondaryData).html("<span class='gold'>Stars:</span> " + arr.actors + "<br><span class='gold'>Runtime:</span><em> " + arr.runtime + "</em><br><span class='gold'>Genres:</span> " + arr.genres + "<br><span class='gold'>Director:</span> " + arr.director +  "<br><span class='gold'>Content Rating:</span> " + arr.rating + "<br><span class='gold'>Awards:</span> " + arr.awards + "<br><span class='gold'>Rotten Tomatoes:</span> " + arr.rottenTom);
    $(secondaryImgDiv).prepend('<img id="poster-img" src="' + arr.image + '" width="285" height="440.39"/>');
    $("#poster-img").appendTo(secondaryImgDiv);
    $(secondaryData).appendTo(secondaryDataDiv);
    $(secondaryDataDiv).append("<button data-target='plot' class='btn modal-trigger bottom'>Display plot summary</button>"); 
    $("#para").html(arr.plot);
}

function displayNamesViaGenre(data, genre) {
    // remove elements on the page first
    $(".main-title").remove();
    $(".secondary-data").remove();
    $(".secondary-img").remove()

    // one div showing search parameters
    var mainTitleDiv = $("<div></div>", { id: "main-title", class: "main-title col s12 m6 l6 xl6" });
    $(mainTitleDiv).appendTo("#row-1");
    var mainTitleData = $("<p></p>", { id: "main-data", class: "main-data" });
    $(mainTitleData).html("Search: " + genre);
    $(mainTitleData).appendTo(mainTitleDiv);

    // another div showing a list of items which fall under the genre(s)
    var secondaryDataDiv = $("<div></div>", { id: "secondary-data-div", class: "secondary-data col s12" }); 
    $(secondaryDataDiv).appendTo("#row-2");
    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data" });
    $(secondaryData).appendTo(secondaryDataDiv);
    var secondaryDataEl = document.querySelector("#secondary-data");
    
    // populate the list
    for (var i = 0; i < data.results.length; i++) {
        secondaryDataEl.innerHTML += "<a id='a" + i + "1'>" + data.results[i].title + "</a><br>";
    }

    // increment the search count
    window.searchCount += 1;

    // if the data returned has 50 results, show pg. 2 btn
    if (data.results.length === 50) {
        var pg2Button = $("<button></button>", { id: "page-2", class: "inline waves-effect waves-light btn-small" });
        pg2Button.textContent = "Load next page"
        $(pg2Button).appendTo(secondaryDataDiv);
        var page = "2";
        $(document).on('click','#btnPg' + window.searchCount,function() { 
            getGenrePageX(genre, page);
        });     
    }

    // save the listing as a string to be stored
    var genreListing = secondaryDataEl.innerHTML;

    function saveGenreListing(genreListing, data) {
        genreElement.queryString = data.queryString;
        genreElement.genreListing = genreListing;
        genreElement.searchCount = window.searchCount;
        genreData.push(genreElement)

        localStorage.setItem("genreData", JSON.stringify(genreData));
    }

    // add a new button
        var recentBtn = document.createElement("button");
        var genresFormatted = data.queryString.replace('?genres=','');
        recentBtn.textContent = "" + genresFormatted;
        var buttonDiv = document.querySelector("#button-div");
        recentBtn.setAttribute("id", "btn" + window.searchCount)
        recentBtn.classList = "inline waves-effect waves-light btn-small green lighten-2";
        buttonDiv.appendChild(recentBtn);

    saveGenreListing(genreListing, data);

    // refresh and parse the titleData array
    genreData = localStorage.getItem("genreData")
    genreData = JSON.parse(genreData);

    // create recent search buttons' "on click" assignments
    for (let i = 0; i < genreData.length; i++) {
        $(document).on('click','#btn' + genreData[i].searchCount,function() {
            // remove whats on the page first
            $(".main-title").remove();
            $(".secondary-data").remove();
            $(".secondary-img").remove();
            
            recallGenreSearch(genreData[i]);
        });
    }
}

function recallGenreSearch(arr) {
    // remove elements on the page first
    $(".main-title").remove();
    $(".secondary-data").remove();
    $(".secondary-img").remove()

    // one div showing search parameters
    var mainTitleDiv = $("<div></div>", { id: "main-title", class: "main-title col s12 m6 l6 xl6" });
    $(mainTitleDiv).appendTo("#row-1");
    var mainTitleData = $("<p></p>", { id: "main-data", class: "main-data" });
    $(mainTitleData).html("Search: " + arr.queryString.replace('?genres=',''));
    $(mainTitleData).appendTo(mainTitleDiv);

    // another div showing a list of items which fall under the genre(s)
    var secondaryDataDiv = $("<div></div>", { id: "secondary-data-div", class: "secondary-data col s12" }); 
    $(secondaryDataDiv).appendTo("#row-2");
    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data" });
    $(secondaryData).appendTo(secondaryDataDiv);
    var secondaryDataEl = document.querySelector("#secondary-data");
    
    var secondaryDataContent = arr.genreListing;
    secondaryDataEl.innerHTML = secondaryDataContent;

    // if there's a page 2 saved, bring up a button for that page
    if (arr.genreListingPg2) {
        var pg2Button = $("<button></button>", { id: "page-2", class: "inline waves-effect waves-light btn-small" });
        pg2Button.textContent = "Show next page"
        $(pg2Button).appendTo(secondaryDataDiv);

        $(document).on('click','#btnPg' + window.searchCount,function() { 
            recDisplayPage2(arr);
        });     
    }
}


function getGenrePageX(genre, page) {
    var apiUrlGenrePg2 = "https://imdb-api.com/API/AdvancedSearch/" + apiKey2 + "/?genres=" + genre + "&page=" + page;
        fetch(apiUrlGenre)
            .then(response=> response.json())
            .then(data=> {
                console.log(data);
                if (page === "2") {
                displayPage2(data, genre);
                } else {
                displayPage3(data, genre);
                }
        });
}

function displayPage2(data, genre) {
    $("#secondary-data").remove();
    $("#btnPg" + window.searchCount).remove();

    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data" });
    $(secondaryData).appendTo(secondaryDataDiv);
    var secondaryDataEl = document.querySelector("#secondary-data");

    // populate the list
    for (var i = 0; i < data.results.length; i++) {
        secondaryDataEl.innerHTML += "<a id='a" + i + "1'>" + data.results[i].title + "</a><br>";
    }

    // if the data returned has 50 results, show pg. 2 btn
    if (data.results.length === 50) {
        var pg3Button = $("<button></button>", { id: "page-3", class: "inline waves-effect waves-light btn-small" });
        pg3Button.textContent = "Load next page"
        $(pg3Button).appendTo(secondaryDataDiv);
        page = "3";
        $(document).on('click','#btnPg' + window.searchCount,function() { 
            getGenrePageX(genre, page);
        });     
    }

    // save the listing as a string to be stored
    var genreListingPg2 = secondaryDataEl.innerHTML;

    function saveGenreListing2(listing) {
        var pg1 = localStorage.getItem("genreData");
        JSON.parse(pg1);

        var newPg1 = pg1.length;
        newPg1 = pg1[newPg1 - 1];

        var saveCount = newPg1.searchCount;
        var saveListing = newPg1.genreListing;
        var saveQuery = newPg1.queryString;

        pg1 = pg1.pop();
        newEl = {};
        newEl.searchCount = saveCount;
        newEl.genreListing = saveListing;
        newEl.genreListingPg2 = listing;
        newEl.queryString = saveQuery;
        pg1.push(newEl)

        localStorage.setItem("genreData", JSON.stringify(pg1));
    }

    saveGenreListing2(genreListingPg2)

    // refresh and parse the titleData array
    genreData = localStorage.getItem("genreData")
    genreData = JSON.parse(genreData);
}

function recDisplayPage2(arr) {
    $("#secondary-data").remove();
    $("#btnPg" + window.searchCount).remove();

    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data" });
    $(secondaryData).appendTo(secondaryDataDiv);
    var secondaryDataEl = document.querySelector("#secondary-data");

    secondaryDataEl.innerHTML = arr.genreListingPg2;

    if (arr.genreListingPg3) {
        var pg3Button = $("<button></button>", { id: "page-3", class: "inline waves-effect waves-light btn-small" });
        pg3Button.textContent = "Show next page"
        $(pg3Button).appendTo(secondaryDataDiv);
        $(document).on('click','#btnPg' + window.searchCount,function() { 
            recDisplayPage3(arr);
        });     
    }
}

function displayPage3(data, genre) {
    $("#secondary-data").remove();
    $("#btnPg" + window.searchCount).remove();
    
    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data" });
    $(secondaryData).appendTo(secondaryDataDiv);
    var secondaryDataEl = document.querySelector("#secondary-data");
    
    // populate the list
    for (var i = 0; i < data.results.length; i++) {
        secondaryDataEl.innerHTML += "<a id='a" + i + "1'>" + data.results[i].title + "</a><br>";
    }

    // save the listing as a string to be stored
    var genreListingPg3 = secondaryDataEl.innerHTML;

    function saveGenreListing3(listing) {
        var pg3 = localStorage.getItem("genreData");
        JSON.parse(pg3);

        var newPg3 = pg3.length;
        newPg3 = pg3[newPg3 - 1];

        var saveCount = newPg3.searchCount;
        var saveListing = newPg3.genreListing;
        var saveListing2 = newPg3.genreListingPg2;
        var saveQuery = newPg3.queryString;

        pg3 = pg3.pop();
        newEl = {};
        newEl.searchCount = saveCount;
        newEl.genreListing = saveListing;
        newEl.genreListingPg2 = saveListing2;
        newEl.genreListingPg3 = listing;
        newEl.queryString = saveQuery;
        pg3.push(newEl);

        localStorage.setItem("genreData", JSON.stringify(pg3));
    }

    saveGenreListing3(genreListingPg3)

    // refresh and parse the titleData array
    genreData = localStorage.getItem("genreData")
    genreData = JSON.parse(genreData);
}

function recDisplayPage3(arr) {
    $("#secondary-data").remove();
    $("#btnPg" + window.searchCount).remove();
    
    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data" });
    $(secondaryData).appendTo(secondaryDataDiv);
    var secondaryDataEl = document.querySelector("#secondary-data");
    
    secondaryDataEl.innerHTML = arr.genreListingPg3;
}

function displayGenresList() {
    // remove elements on the page first
    $(".main-title").remove();
    $(".secondary-data").remove();
    $(".secondary-img").remove()

    // two formatted divs side by side which display a list of sample genres
    var secondaryDataDiv = $("<div></div>", { id: "secondary-data-div", class: "secondary-data col s6" }); 
    $(secondaryDataDiv).appendTo("#row-2");
    var secondaryDataDiv2 = $("<div></div>", { id: "secondary-data-div-2", class: "secondary-data col s6" });
    $(secondaryDataDiv2).appendTo("#row-2");
    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data gold center right" });
    var secondaryData2 = $("<p></p>", { id: "secondary-data-2", class: "secondary-data gold center left" });
    var secondaryBtnDiv = $("<div></div>", { class: "secondary-data col s12" }); 
    $(secondaryBtnDiv).appendTo("#row-2");

    // list of genres
    $(secondaryData).html("<span style='color: #9c9c9c'>Use commas for multiple genres: </span><br>Action<br>Adventure<br>Animation<br>Biography<br>Comedy<br>Crime<br>Documentary<br>Drama<br>Family<br>Fantasy<br>Film-Noir<br>Game-Show<br>History");
    $(secondaryData).appendTo(secondaryDataDiv);
    $(secondaryData2).html("<br>Horror<br>Music<br>Musical<br>Mystery<br>News<br>Reality-TV<br>Romance<br>Sci-Fi<br>Sport<br>Talk-Show<br>Thriller<br>War<br>Western");
    $(secondaryData2).appendTo(secondaryDataDiv2);
    var closeBtn = $("<button></button>", { id: "close-btn", class: "inline waves-effect waves-light btn-small light-blue darken-3" });
    $(closeBtn).html("Close");
    $(closeBtn).appendTo(secondaryBtnDiv);

    function clearGenresList() {
        $(".secondary-data").remove();
    }

    var closeBtnEl = document.querySelector("#close-btn");
    closeBtnEl.addEventListener("click", clearGenresList);
}

// these functions were a quick solution but involve changing our 'save' code
// and storing all api calls in LS instead, which isn't ideal

//  function moviesFromLocalStorage () {
//      titleData.forEach(movie => {
//          var moviebutton = document.createElement("button");
//          moviebutton.innerText = movie.Title
//          moviebutton.onclick = searchMovie
//          document.getElementById("local-search").append(moviebutton);
//      })
//  }
//  moviesFromLocalStorage();
    
//  function searchMovie (event) {
//      console.log(event.target);
//      var movie = titleData.find(title => title.Title == event.target.innerText);
//      console.log(movie);
//      displayMainTitle(movie);
//  }

function loadButtonsFirst() {
// this function loads the buttons if there are any in LS on page load
    window.searchCount = parseInt(window.searchCount);
    if (window.searchCount > 0) {
        titleData = localStorage.getItem("titleData");
        titleData = JSON.parse(titleData);
        for (let i = 0; i < titleData.length; i++) { 
            // create a recent button iteration loop with the id# of the buttons
            var recentBtn = document.createElement("button");
            recentBtn.textContent = "" + titleData[i].title;
            var buttonDiv = document.querySelector("#button-div");
            recentBtn.setAttribute("id", "btn" + (titleData[i].searchCount));
            recentBtn.classList = "inline waves-effect waves-light btn-small";
            buttonDiv.appendChild(recentBtn);
                // jquery button assignments 
                $(document).on('click','#btn' + (titleData[i].searchCount),function() {
                    // remove page contents first when clicking recall buttons
                    $(".main-title").remove();
                    $(".secondary-data").remove();
                    $(".secondary-img").remove();
                    // this function has datapoints from titleData which is from LS on page load, unless it's initial
                    recallTitleSearch(titleData[i]);
                });
        }
    } 
}
// ^
loadButtonsFirst();

// query selectors for the search form
var searchFormEl = document.querySelector("#search-form");
var searchNameEl = document.querySelector("#name");
var genresIdeasBtn = document.querySelector("#genres-ideas");

// default search is by title, genre ideas button is always there
searchFormEl.addEventListener("submit", formSubmitHandler);
genresIdeasBtn.addEventListener("click", displayGenresList);

// toggle functionality to change the search type and the api call involved
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