$(document).ready(function(){
    $('.modal').modal();
    $('select').formSelect();
});

//omdb key
var apiKey = "90e49496";

var apiKey2 = "k_esgvbo9o";
//var apiKey2 = "k_n93546yy";

var searchCount = localStorage.getItem("searchCount");
searchCount = parseInt(searchCount);
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
    var mostPopular = []
    var popularElement = {
        items: []
    }
    var mostPopular2 = []
    var popularElement2 = {
        items: []
    }
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
    var mostPopular = localStorage.getItem("mostPopular");
    mostPopular = JSON.parse(mostPopular);
        if (!mostPopular) {
            var mostPopular = []
            var popularElement = {
                items: []
            }
        }
    var mostPopular2 = localStorage.getItem("mostPopular2");
    mostPopular2 = JSON.parse(mostPopular2);
        if (!mostPopular2) {
            var mostPopular2 = []
            var popularElement2 = {
                items: []
            }
        }
    var dataElement = {};
    var genreElement = {
        results: []
    };
}

// from stack overflow, for capitalizing first letter of strings
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
                } else if (data.Error === "Movie not found!") { var error = "No results found"; displayError(error); }
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
                    var error = "No results found"; 
                    displayError(error);
                }
            });
    } else { recallGenreSearch(genreRecallArr) };
}
// movies
function getMostPopular() {
    var apiMostPopular = "https://imdb-api.com/en/API/MostPopularMovies/" + apiKey2
    fetch(apiMostPopular)
            .then(response=> response.json())
            .then(data=> {
                console.log(data);
                if (data.errorMessage === "") {
                    displayMostPopular(data);
                } else { 
                    var error = "Fetch failed"; 
                    displayError(error);
                }
            });
}
// shows
function getMostPopular2() {
    var apiMostPopular2 = "https://imdb-api.com/en/API/MostPopularTVs/" + apiKey2
    fetch(apiMostPopular2)
            .then(response=> response.json())
            .then(data=> {
                console.log(data);
                if (data.errorMessage === "") {
                    displayMostPopular2(data);
                } else { 
                    var error = "Fetch failed"; 
                    displayError(error);
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
        var error = "Please enter a title!";
        displayError(error)
    }
};

// used to submit the search for genre(s) via imdb api adv. search
var formSubmitHandler2 = function(event) {
    event.preventDefault();

    var searchGenre = searchNameEl.value.trim();
    if (searchGenre) {
        searchGenre = toTitleCase(searchGenre);
        // for dashes and capitalizing first letter after them, such as
        // in Sci-Fi, for some reason that formatting is important to the search
        searchGenre = searchGenre.replace(/\-[a-z]/g, match => match.toUpperCase());
        getGenres(searchGenre);
        searchNameEl.value = "";
    } else {
        var error = "Please enter a genre!";
        displayError(error);
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
            var rottenTom = JSON.stringify(data.Ratings[1].Value);
            rottenTom = rottenTom.replace(/[{}]/g, '');
            rottenTom = rottenTom.replace(/\"/g, "");
            var source = data.Ratings[1].Source;
        } else { 
            var rottenTom = "N/A" }
            var source = "Rotten Tomatoes"
        if (data.Ratings[1]) {
            $(secondaryData).html("<span class='gold'>Stars:</span> " + data.Actors + "<br><span class='gold'>Runtime:</span><em> " + data.Runtime + "</em><br><span class='gold'>Genres:</span> " + data.Genre + "<br><span class='gold'>Director:</span> " + data.Director +  "<br><span class='gold'>Content Rating:</span> " + data.Rated + "<br><span class='gold'>Awards:</span> " + data.Awards + "<br><span class='gold'>" + source + ":</span> " + rottenTom);
        } else {
            $(secondaryData).html("<span class='gold'>Stars:</span> " + data.Actors + "<br><span class='gold'>Runtime:</span><em> " + data.Runtime + "</em><br><span class='gold'>Genres:</span> " + data.Genre + "<br><span class='gold'>Director:</span> " + data.Director +  "<br><span class='gold'>Content Rating:</span> " + data.Rated + "<br><span class='gold'>Awards:</span> " + data.Awards + "<br><span class='gold'>Rotten Tomatoes: </span>" + rottenTom)
        }
    $(secondaryImgDiv).prepend('<img id="poster-img" src="' + data.Poster + '" width="285" height="440.39"/>');
    $("#poster-img").appendTo(secondaryImgDiv);
    $(secondaryData).appendTo(secondaryDataDiv);
    $(secondaryDataDiv).append("<button data-target='plot' class='padding btn modal-trigger bottom'>Display plot summary</button>"); 
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

        dataElement.source = source;
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
        recentBtn.classList = "inline waves-effect waves-light btn-small clear";
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

    $(secondaryData).html("<span class='gold'>Stars:</span> " + arr.actors + "<br><span class='gold'>Runtime:</span><em> " + arr.runtime + "</em><br><span class='gold'>Genres:</span> " + arr.genres + "<br><span class='gold'>Director:</span> " + arr.director +  "<br><span class='gold'>Content Rating:</span> " + arr.rating + "<br><span class='gold'>Awards:</span> " + arr.awards + "<br><span class='gold'>" + arr.source + ":</span> " + arr.rottenTom);
    $(secondaryImgDiv).prepend('<img id="poster-img" src="' + arr.image + '" width="285" height="440.39"/>');
    $("#poster-img").appendTo(secondaryImgDiv);
    $(secondaryData).appendTo(secondaryDataDiv);
    $(secondaryDataDiv).append("<button data-target='plot' class='padding btn modal-trigger bottom'>Display plot summary</button>"); 
    $("#para").html(arr.plot);
}

// this function is for displaying titles from a supplied genre(s)
function displayNamesViaGenre(data, genre) {
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
    
    var textMark = 0;
    // populate the list, style it with different colors to create a smooth blend
    for (var i = 0; i < data.results.length && i < 50; i++) {
        textMark = i;
        secondaryDataEl.innerHTML += "<a id='a" + i + "1'>" + data.results[i].title + "</a><br>";

        switch(textMark) {
            case 0: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 2: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 4: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 6: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 8: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 10:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 12:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 14:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 16:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 18:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 20:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 22:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 24:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 26:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 28:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 30:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 32:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 34:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 36:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 38:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 40:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 42:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 44:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 46:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 48:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            default: 
                    $("#a" + i + "1").addClass("style1")
        }
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
        recentBtn.classList = "inline waves-effect waves-light btn-small green lighten-2 clear";
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

// for recalling a previous search for genre(s)
function recallGenreSearch(arr) {
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
    // fill the search description div
    $(mainTitleData).html("Search: " + string);
    $(mainTitleData).appendTo(mainTitleDiv);

    // another div showing a list of items which fall under the genre(s)
    var secondaryDataDiv = $("<div></div>", { id: "secondary-data-div", class: "secondary-data col s12" }); 
    $(secondaryDataDiv).appendTo("#row-2");
    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data" });
    $(secondaryData).appendTo(secondaryDataDiv);
    var secondaryDataEl = document.querySelector("#secondary-data");

    var placeKeeper = 0;
    // style it with different colors to create a smooth blend
    for (let i = 0; i < arr.results.length && i < 50; i++) {
        placeKeeper = i;
        secondaryDataEl.innerHTML += "<a id='a" + i + "1'>" + arr.results[i].title + "</a><br>";

        switch(placeKeeper) {
            case 0: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 2: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 4: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 6: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 8: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 10:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 12:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 14:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 16:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 18:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 20:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 22:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 24: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 26: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 28: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 30: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 32: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 34:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 36:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 38:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 40:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 42:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 44:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 46:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 48:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            default: 
                    $("#a" + i + "1").addClass("style1")
        }
    }
    
    if (placeKeeper > 0 && placeKeeper < 50) {
        var pg1Button = $("<button></button>", { id: "page-1", class: "inline waves-effect waves-light btn-small" });
        $(pg1Button).text("Show next page");
        $(pg1Button).appendTo(secondaryDataDiv)
        page = "2"
        $(document).on('click','#page-1',function() { 
            recDisplayPage2(arr);
        });
    }
}

// display page 2 of a stored array from a genre(s) listing
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

    var placeKeeper = 0;
    // style it with different colors to create a smooth blend
    for (let i = 50; i < arr.results.length && i < 100; i++) {
        placeKeeper = i;
        secondaryDataEl.innerHTML += "<a id='a" + i + "1'>" + arr.results[i].title + "</a><br>";

        switch(placeKeeper) {
            case 50: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 52: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 54: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 56: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 58: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 60:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 62:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 64:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 66:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 68:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 70:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 72:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 74: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 76: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 78: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 80: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 82: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 84:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 86:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 88:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 90:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 92:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 94:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 96:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 98:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            default: 
                    $("#a" + i + "1").addClass("style1")
        }
    }

    if (placeKeeper > 50 && placeKeeper < 100) {
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

// display page 3 of a stored array from a genre(s) listing
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
    
    var placeKeeper = 0;
    // style it with different colors to create a smooth blend
    for (let i = 100; i < arr.results.length && i < 150; i++) {
        placeKeeper = i;
        secondaryDataEl.innerHTML += "<a id='a" + i + "1'>" + arr.results[i].title + "</a><br>";

        switch(placeKeeper) {
            case 100: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 102: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 104: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 106: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 108: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 110:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 112:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 114:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 116:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 118:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 120:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 122:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 124: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 126: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 128: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 130: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 132: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 134:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 136:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 138:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 140:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 142:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 144:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 146:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 148:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            default: 
                    $("#a" + i + "1").addClass("style1")
        }
    }

    if (placeKeeper > 100 && placeKeeper < 150) {
        var pg3ButtonB = $("<button></button>", { id: "page-3b", class: "inline waves-effect waves-light btn-small" });
        $(pg3ButtonB).text("Show previous page");
        $(pg3ButtonB).appendTo(secondaryDataDiv);
        page = "2";
        $(document).on('click','#page-3b',function() { 
            recDisplayPage2(arr);
        });     
    }
}

// this is a sampler of genres for the user to use in their searches
function displayGenresList() {
    $(".main-title").remove();
    $(".secondary-data").remove();
    $(".secondary-img").remove();

    // two formatted divs side by side which display a list of sample genres
    var commasDiv = $("<div></div>", { id: "new-div", class: "secondary-data new-div col s12" });
    $(commasDiv).appendTo("#row-2");
    var secondaryDataDiv = $("<div></div>", { id: "secondary-data-div", class: "secondary-data col s6" }); 
    $(secondaryDataDiv).appendTo("#row-2");
    var secondaryDataDiv2 = $("<div></div>", { id: "secondary-data-div-2", class: "secondary-data col s6" });
    $(secondaryDataDiv2).appendTo("#row-2");

    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data gold center right" });
    var secondaryData2 = $("<p></p>", { id: "secondary-data-2", class: "secondary-data gold center left" });
    var secondaryData3 = $("<p></p>", { id: "secondary-data-3", class: "secondary-data new-div" });
    var secondaryBtnDiv = $("<div></div>", { class: "secondary-data col s12" }); 
    $(secondaryBtnDiv).appendTo("#row-2");

    // list of genres
    $(secondaryData3).appendTo(commasDiv);
    $(secondaryData3).html("<span style='color: #9c9c9c'>Use commas (multiple genres)</span>");
    $(secondaryData).html("Action<br>Adventure<br>Animation<br>Biography<br>Comedy<br>Crime<br>Documentary<br>Drama<br>Family<br>Fantasy<br>Film-Noir<br>Game-Show<br>History<br>");
    $(secondaryData).appendTo(secondaryDataDiv);
    $(secondaryData2).html("Horror<br>Music<br>Musical<br>Mystery<br>News<br>Reality-TV<br>Romance<br>Sci-Fi<br>Sport<br>Talk-Show<br>Thriller<br>War<br>Western<br>");
    $(secondaryData2).appendTo(secondaryDataDiv2);
    var closeBtn = $("<button></button>", { id: "close-btn", class: "inline waves-effect waves-light btn-small light-blue darken-3" });
    $(closeBtn).html("Close");
    $(closeBtn).appendTo(secondaryBtnDiv);
    var clearBtn = $("<button></button>", {id: "clear-btn", class: "inline waves-effect waves-light btn-small light-blue darken-3" });
    $(clearBtn).html("Clear buttons");
    $(clearBtn).appendTo(secondaryBtnDiv);

    function clearGenresList() {
        $(".secondary-data").remove();
    }

    var closeBtnEl = document.querySelector("#close-btn");
    closeBtnEl.addEventListener("click", clearGenresList);  
    var clearBtnEl = document.querySelector("#clear-btn");
    clearBtnEl.addEventListener("click", function() {
        $(".clear").remove();
        
        localStorage.removeItem("titleData");
        localStorage.removeItem("searchCount");
        localStorage.removeItem("genreData");
        localStorage.removeItem("mostPopular");
        localStorage.removeItem("mostPopular2");

        window.searchCount = 0;
        var titleData = [];
        var dataElement = {};
        var genreData = [];
        var genreElement = {
            results: []
        };
        var mostPopular = []
        var popularElement = {
            items: []
        }
        var mostPopular2 = []
        var popularElement2 = {
            items: []
        }
    });
}

// this is a list of the most popular films being displayed via getMostPopular()
function displayMostPopular(data) {
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
    $(mainTitleData).html("Search: Most Popular Films");
    $(mainTitleData).appendTo(mainTitleDiv);

    // another div showing a list of items
    var secondaryDataDiv = $("<div></div>", { id: "secondary-data-div", class: "secondary-data col s12" }); 
    $(secondaryDataDiv).appendTo("#row-2");
    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data" });
    $(secondaryData).appendTo(secondaryDataDiv);
    var secondaryDataEl = document.querySelector("#secondary-data");
    
    var textMark = 0;
    // populate the list, style it with different colors to create a smooth blend
    for (var i = 0; i < data.items.length && i < 100; i++) {
        textMark = i;
        secondaryDataEl.innerHTML += "<a id='a" + i + "1'>" + data.items[i].title + "</a><br>";

        switch(textMark) {
            case 0: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 2: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 4: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 6: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 8: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 10:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 12:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 14:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 16:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 18:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 20:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 22:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 24: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 26: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 28: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 30: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 32: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 34:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 36:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 38:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 40:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 42:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 44:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 46:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 48:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 50:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 52:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 54:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 56:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 58:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 60:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 62:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 64:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 66:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 68:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 70:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 72:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 74:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 76:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 78:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 80:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 82:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 84:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 86:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 88:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 90:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 92:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 94:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 96:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 98:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            default: 
                    $("#a" + i + "1").addClass("style1")
        }
    }

    // increment the search count
    window.searchCount += 1;

    function savePopularListing(data) {
        localStorage.setItem("searchCount", window.searchCount)
        var popularElement = {
            items: []
        }
        // save the listing as an array to be stored
            for (let i = 0; i < data.items.length; i++) {
                popularElement.items.push(data.items[i]);
            }
        popularElement.searchCount = window.searchCount;
        mostPopular.push(popularElement);
        localStorage.setItem('mostPopular', JSON.stringify(mostPopular));
    }

    savePopularListing(data);

    // refresh and parse the titleData array
    mostPopular = localStorage.getItem("mostPopular")
    mostPopular = JSON.parse(mostPopular);
}

// this is a listing of popular shows being displayed via getMostPopular2()
function displayMostPopular2(data) {
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
    $(mainTitleData).html("Search: Most Popular Shows");
    $(mainTitleData).appendTo(mainTitleDiv);

    // another div showing a list of items
    var secondaryDataDiv = $("<div></div>", { id: "secondary-data-div", class: "secondary-data col s12" }); 
    $(secondaryDataDiv).appendTo("#row-2");
    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data" });
    $(secondaryData).appendTo(secondaryDataDiv);
    var secondaryDataEl = document.querySelector("#secondary-data");
    
    var textMark = 0;
    // populate the list, style it with different colors to create a smooth blend
    for (var i = 0; i < data.items.length && i < 100; i++) {
        textMark = i;
        secondaryDataEl.innerHTML += "<a id='a" + i + "1'>" + data.items[i].title + "</a><br>";

        switch(textMark) {
            case 0: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 2: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 4: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 6: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 8: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 10:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 12:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 14:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 16:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 18:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 20:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 22:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 24: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 26: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 28: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 30: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 32: $("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 34:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 36:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 38:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 40:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 42:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 44:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 46:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 48:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 50:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 52:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 54:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 56:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 58:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 60:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 62:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 64:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 66:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 68:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 70:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 72:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 74:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 76:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 78:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 80:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 82:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 84:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 86:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 88:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 90:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            case 92:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style3");
                    break;
            case 94:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style4");
                    break;
            case 96:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style5");
                    break;
            case 98:$("#a" + i + "1").removeClass();
                    $("#a" + i + "1").addClass("style2");
                    break;
            default: 
                    $("#a" + i + "1").addClass("style1")
        }
    }
    // increment the search count
    window.searchCount += 1;

    function savePopularListing2(data) {
        localStorage.setItem("searchCount", window.searchCount)
        var popularElement2 = {
            items: []
        }
        // save the listing as an array to be stored
            for (let i = 0; i < data.items.length; i++) {
                popularElement2.items.push(data.items[i]);
            }
        popularElement2.searchCount = window.searchCount;
        mostPopular2.push(popularElement2);
        localStorage.setItem('mostPopular2', JSON.stringify(mostPopular2));
    }

    savePopularListing2(data);

    // refresh and parse the titleData array
    mostPopular2 = localStorage.getItem("mostPopular2")
    mostPopular2 = JSON.parse(mostPopular2);
}

// this function recalls the list of either popular films 
// or shows depending on the variable show which is passed 
function recallPopular(show, arr) {
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
    if (show === true) {
        $(mainTitleData).html("Search: Most Popular Show");
    } else { 
        $(mainTitleData).html("Search: Most Popular Film")}
    $(mainTitleData).appendTo(mainTitleDiv);

    // another div showing a list of items
    var secondaryDataDiv = $("<div></div>", { id: "secondary-data-div", class: "secondary-data col s12" }); 
    $(secondaryDataDiv).appendTo("#row-2");
    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data" });
    $(secondaryData).appendTo(secondaryDataDiv);
    var secondaryDataEl = document.querySelector("#secondary-data");
    
    var textMark = 0;
    // populate the list, style it with different colors to create a smooth blend.
    // pass in show to tell the app whether this is a movie or show that it is recalling 
    if (show === true) { // show
        for (var i = 0; i < mostPopular2[0].items.length; i++) {
            textMark = i;
            secondaryDataEl.innerHTML += "<a id='a" + i + "1'>" + mostPopular2[0].items[i].title + "</a><br>";
    
            switch(textMark) {
                case 0: $("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 2: $("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 4: $("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 6: $("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 8: $("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 10:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 12:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 14:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 16:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 18:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 20:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 22:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 24:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 26:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 28:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 30:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 32:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 34:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 36:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 38:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 40:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 42:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 44:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 46:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 48:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 50:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 52:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 54:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 56:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 58:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 60:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 62:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 64:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 66:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 68:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 70:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 72:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 74:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 76:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 78:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 80:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 82:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 84:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 86:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 88:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 90:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 92:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 94:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 96:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 98:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                default: 
                        $("#a" + i + "1").addClass("style1")
            }
        }
    } else { // film
        for (var i = 0; i < mostPopular[0].items.length; i++) {
            textMark = i;
            secondaryDataEl.innerHTML += "<a id='a" + i + "1'>" + mostPopular[0].items[i].title + "</a><br>";
    
            switch(textMark) {
                case 0: $("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 2: $("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 4: $("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 6: $("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 8: $("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 10:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 12:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 14:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 16:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 18:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 20:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 22:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 24: $("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 26: $("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 28: $("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 30: $("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 32: $("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 34:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 36:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 38:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 40:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 42:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 44:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 46:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 48:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 50:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 52:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 54:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 56:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 58:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 60:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 62:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 64:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 66:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 68:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 70:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 72:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 74:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 76:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 78:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 80:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 82:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 84:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 86:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 88:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 90:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                case 92:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style3");
                        break;
                case 94:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style4");
                        break;
                case 96:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style5");
                        break;
                case 98:$("#a" + i + "1").removeClass();
                        $("#a" + i + "1").addClass("style2");
                        break;
                default: 
                        $("#a" + i + "1").addClass("style1")
            }
        }
    }
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

function displayError(error) { 
    $(".main-title").remove();
    $(".secondary-data").remove();
    $(".secondary-img").remove();
    $("#page-1").remove();
    $("#page-2").remove();
    $("#page-2b").remove();
    $("#page-3").remove();
    $("#page-3b").remove();

    // one div showing errors
    var mainTitleDiv = $("<div></div>", { id: "main-title", class: "main-title col s12 m6 l6 xl6" });
    $(mainTitleDiv).appendTo("#row-1");
    var mainTitleData = $("<p></p>", { id: "main-data", class: "main-data" });
    $(mainTitleData).html("<em>Error:</em> " + error);
    $(mainTitleData).appendTo(mainTitleDiv);
}

function loadButtonsFirst() {
// this function loads the buttons if there are any in LS on page load
    if (window.searchCount > 0) {
        for (let i = 0; i < titleData.length; i++) { 
            // create a recent button iteration loop with the id# of the buttons
            var recentBtn = document.createElement("button");
            recentBtn.textContent = "" + titleData[i].title;
            var buttonDiv = document.querySelector("#button-div");
            recentBtn.setAttribute("id", "btn" + (titleData[i].searchCount));
            recentBtn.classList = "inline waves-effect waves-light btn-small clear";
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
            recentBtn.classList = "inline waves-effect waves-light btn-small green lighten-2 clear"
            buttonDiv.appendChild(recentBtn);
                // jquery button assignments 
                $(document).on('click','#btn' + (genreData[i].searchCount),function() {
                    // this function has datapoints from genreData
                    recallGenreSearch(genreData[i]);
                });
        }
    }
}

// if mostPopular exists in LS recall, otherwise get new listing
var newBtn = $("<button></button>", { id: "most-popular", class: "inline waves-effect waves-light btn-small cyan darken-3" });
$(newBtn).html("Top 100 Films");
$(newBtn).appendTo("#button-div"); 
$(newBtn).on("click", function() {
    if (mostPopular.length > 0) {
        var show = false;
        recallPopular(show, mostPopular);
    } else {
        getMostPopular();
    }
});

// if mostPopular2 exists in LS recall, otherwise get new listing
var newBtn = $("<button></button>", { id: "most-popular2", class: "inline waves-effect waves-light btn-small teal darken-2" });
$(newBtn).html("Top 100 Shows");
$(newBtn).appendTo("#button-div"); 
$(newBtn).on("click", function() {
    if (mostPopular2.length > 0) {
        var show = true;
        recallPopular(show, mostPopular2);
    } else {
        getMostPopular2();
    }
});

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