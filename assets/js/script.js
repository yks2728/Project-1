$(document).ready(function(){
    $('.modal').modal();
    $('select').formSelect();
});

//omdb key
var apiKey = "90e49496";

//var apiKey2 = "k_esgvbo9o";
var apiKey2 = "k_n93546yy";

var searchCount = localStorage.getItem("searchCount");
searchCount = parseInt(searchCount)
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
    var genreElement = {
        results: []
    };
} else {
    var titleData = localStorage.getItem("titleData");
    titleData = JSON.parse(titleData);
    if (!titleData) {
        var titleData = [];
    }

    var genreData = localStorage.getItem("genreData");
    genreData = JSON.parse(genreData);
    if (!genreData) {
        var genreData = [];
    }
    var dataElement = {};
    var genreElement = {
        results: []
    };
}

// from stack overflow, for capitalizing
function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
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
// use commas for multiple genres, format spaces out
function getGenres(genre) {
    var apiUrlGenre = "https://imdb-api.com/API/AdvancedSearch/" + apiKey2 + "/?genres=" + genre + "&count=150";
    apiUrlGenre = apiUrlGenre.replace(/ /g, "");
        if (genreData.length > 0) {
            // confirm if genre(s) is(are) a new unique search 
            // and isn't(aren't) stored already by using a boolean
            for (i = 0; i < genreData.length; i++) {
                var string = genreData[i].queryString.replace('?genres=','');
                string = string.replace('%20','');
                string = string.replace('%20','');
                string = string.replace('&count=150', '')
                string = string.replace(/,/g, ', ')
            // this may be redundant toTileCase
                string = toTitleCase(string);
                string = string.replace(/\-[a-z]/g, match => match.toUpperCase());
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
        searchGenre = toTitleCase(searchGenre);
        searchGenre = searchGenre.replace(/\-[a-z]/g, match => match.toUpperCase());
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
    $("#page-1").remove();
    $("#page-2").remove();
    $("#page-2b").remove();
    $("#page-3").remove();
    $("#page-3b").remove();

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
    $("#page-1").remove();
    $("#page-2").remove();
    $("#page-2b").remove();
    $("#page-3").remove();
    $("#page-3b").remove();

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
    $("#page-1").remove();
    $("#page-2").remove();
    $("#page-2b").remove();
    $("#page-3").remove();
    $("#page-3b").remove();

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
    for (var i = 0; i < data.results.length && i < 50; i++) {
        secondaryDataEl.innerHTML += "<a id='a" + i + "1'>" + data.results[i].title + "</a><br>";
    }

    // increment the search count
    window.searchCount += 1;

    function saveGenreListing(genreElement) {
        var genreElement = {
            results: []
        };
        genreElement.queryString = data.queryString;
        localStorage.setItem("searchCount", window.searchCount)
        // save the listing as an array to be stored
            for (let i = 0; i < data.results.length; i++) {
                genreElement.results.push(data.results[i]);
            }
        genreElement.searchCount = window.searchCount;
        genreData.push(genreElement);
        localStorage.setItem('genreData', JSON.stringify(genreData));
    }

    // add a new button
        var recentBtn = document.createElement("button");
        var genresFormatted = data.queryString.replace('?genres=','');
        genresFormatted = genresFormatted.replace('%20','');
        genresFormatted = genresFormatted.replace('%20','');
        genresFormatted = genresFormatted.replace('&count=150', '')
        recentBtn.textContent = "" + genresFormatted;
        var buttonDiv = document.querySelector("#button-div");
        recentBtn.setAttribute("id", "btn" + window.searchCount)
        recentBtn.classList = "inline waves-effect waves-light btn-small green lighten-2";
        buttonDiv.appendChild(recentBtn);

    saveGenreListing();

    // refresh and parse the titleData array
    genreData = localStorage.getItem("genreData")
    genreData = JSON.parse(genreData);

    // if the data returned has 50 results, show pg. 2 btn
    if (data.results.length > 50) {
        var pg2Button = $("<button></button>", { id: "page-2", class: "inline waves-effect waves-light btn-small" });
        $(pg2Button).text("Load next page");
        $(pg2Button).appendTo(secondaryDataDiv);
        var page = "2";
        
        $(document).on('click','#page-2',function() { 
            recDisplayPage2(genreData[genreData.length - 1]);
        });     
    }

    // create recent search buttons' "on click" assignments
    for (let i = 0; i < genreData.length; i++) {
        $(document).on('click','#btn' + genreData[i].searchCount,function() {  
            recallGenreSearch(genreData[i]);
        });
    }
}

function recallGenreSearch(arr) {
    // remove elements on the page first
    $(".main-title").remove();
    $(".secondary-data").remove();
    $(".secondary-img").remove()
    $("#page-1").remove();
    $("#page-2").remove();
    $("#page-2b").remove();
    $("#page-3").remove();
    $("#page-3b").remove();

    // one div showing search parameters
    var mainTitleDiv = $("<div></div>", { id: "main-title", class: "main-title col s12 m6 l6 xl6" });
    $(mainTitleDiv).appendTo("#row-1");
    var mainTitleData = $("<p></p>", { id: "main-data", class: "main-data" });
    var string = arr.queryString.replace('?genres=','');
    string = string.replace('%20','');
    string = string.replace('%20','');
    string = string.replace('&count=150', '')
    $(mainTitleData).html("Search: " + string);
    $(mainTitleData).appendTo(mainTitleDiv);

    // another div showing a list of items which fall under the genre(s)
    var secondaryDataDiv = $("<div></div>", { id: "secondary-data-div", class: "secondary-data col s12" }); 
    $(secondaryDataDiv).appendTo("#row-2");
    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data" });
    $(secondaryData).appendTo(secondaryDataDiv);
    var secondaryDataEl = document.querySelector("#secondary-data");

    var placekeeper = 0;
    for (let i = 0; i < arr.results.length && i < 50; i++) {
        secondaryDataEl.innerHTML += "<a id='a" + i + "1'>" + arr.results[i].title + "</a><br>";
        placekeeper = i;
    }
    
    if (placekeeper > 0 && placekeeper < 50) {
        var pg1Button = $("<button></button>", { id: "page-1", class: "inline waves-effect waves-light btn-small" });
        $(pg1Button).text("Show next page");
        $(pg1Button).appendTo(secondaryDataDiv)
        page = "2"
        $(document).on('click','#page-1',function() { 
            recDisplayPage2(arr);
        });
    }
}

function recDisplayPage2(arr) {
    $("#secondary-data").remove();
    $("#page-1").remove();
    $("#page-2").remove();
    $("#page-2b").remove();
    $("#page-3").remove();
    $("#page-3b").remove();

    var secondaryDataDiv = document.querySelector("#secondary-data-div");
    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data" });
    $(secondaryData).appendTo(secondaryDataDiv);
    var secondaryDataEl = document.querySelector("#secondary-data");

    var placekeeper = 0;
    for (let i = 50; i < arr.results.length && i < 100; i++) {
        secondaryDataEl.innerHTML += "<a id='a" + i + "1'>" + arr.results[i].title + "</a><br>";
        placekeeper = i;
    }

    if (placekeeper > 50 && placekeeper < 100) {
        var pg2ButtonB = $("<button></button>", { id: "page-2b", class: "inline waves-effect waves-light btn-small" });
        $(pg2ButtonB).text("Show previous page");
        $(pg2ButtonB).appendTo(secondaryDataDiv);
        page = "1"
        $(document).on('click', '#page-2b', function() {
            recallGenreSearch(arr);
        });
        var pg2Button = $("<button></button>", { id: "page-2", class: "inline waves-effect waves-light btn-small" });
        $(pg2Button).text("Show next page");
        $(pg2Button).appendTo(secondaryDataDiv)
        page = "3"
        $(document).on('click','#page-2',function() { 
            recDisplayPage3(arr);
        });
    }  
}

function recDisplayPage3(arr) {
    $("#secondary-data").remove();
    $("#page-1").remove();
    $("#page-2").remove();
    $("#page-2b").remove();
    $("#page-3").remove();
    $("#page-3b").remove();
    
    var secondaryDataDiv = document.querySelector("#secondary-data-div");
    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data" });
    $(secondaryData).appendTo(secondaryDataDiv);
    var secondaryDataEl = document.querySelector("#secondary-data");
    
    var placekeeper = 0;
    for (let i = 100; i < arr.results.length && i < 150; i++) {
        secondaryDataEl.innerHTML += "<a id='a" + i + "1'>" + arr.results[i].title + "</a><br>";
        placekeeper = i;
    }

    if (placekeeper > 100 && placekeeper < 150) {
        var pg3ButtonB = $("<button></button>", { id: "page-3b", class: "inline waves-effect waves-light btn-small" });
        $(pg3ButtonB).text("Show previous page");
        $(pg3ButtonB).appendTo(secondaryDataDiv);
        page = "2";
        $(document).on('click','#page-3b',function() { 
            recDisplayPage2(arr);
        });     
    }
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
    if (window.searchCount > 0) {
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

        for (let i = 0; i < genreData.length; i++) {
            var recentBtn = document.createElement("button");
            var string = genreData[i].queryString.replace('?genres=','');
            string = string.replace('%20','');
            string = string.replace('%20','');
            string = string.replace('&count=150', '')
            recentBtn.textContent = "" + string;
            var buttonDiv = document.querySelector("#button-div");
            recentBtn.setAttribute("id", "btn" + (genreData[i].searchCount));
            recentBtn.classList = "inline waves-effect waves-light btn-small green lighten-2"
            buttonDiv.appendChild(recentBtn);
                // jquery button assignments 
                $(document).on('click','#btn' + (genreData[i].searchCount),function() {
                    // this function has datapoints from genreData
                    recallGenreSearch(genreData[i]);
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