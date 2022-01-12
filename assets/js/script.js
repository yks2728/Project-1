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
if (window.searchCount === 0) {
    var titleData = [];
    var dataElement = {};
} else {
    var titleData = localStorage.getItem(titleData);
    titleData = JSON.parse(titleData);
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
                console.log(data);
                if (data.results.length > 0) {
                    displayRandomGenres(data, genre);
                    var apiUrlGenrePage2 = "https://imdb-api.com/API/AdvancedSearch/" + apiKey2 + "/?genres=" + genre + "&page=2";

                        fetch(apiUrlGenrePage2)
                            .then(response => response.json())
                            .then(data=> {
                                console.log(data);
                                displayRandomGenresPg2(data);
                            })
                } else { 
                    console.log("Error: No results found")
                }
            });
}

function 

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
        var title = data.Title;
        dataElement.title = title;

        var year = data.Year;
        dataElement.year = year;

        var actors = data.Actors;
        dataElement.actors = actors;

        var runtime = data.Runtime;
        dataElement.runtime = runtime;

        var director = data.Director;
        dataElement.director = director;

        var rating = data.Rating;
        dataElement.rating = rating;

        var awards = data.Awards;
        dataElement.awards = awards;

        var image = data.Poster;
        dataElement.image = image;

        var plot = data.Plot;
        dataElement.plot = plot;

        dataElement.rottenTom = rottenTom;
        dataElement.genreList = genreArr;

        localStorage.setItem("searchCount", window.searchCount)
        dataElement.searchCount = window.searchCount;

        titleData.push(dataElement);
        localStorage.setItem("titleData", JSON.stringify(titleData));
    }

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

function displayLinkedTitle(data) {}

function displayRandomGenres(data, genre) {
    // remove elements on the page first for searching additional times
    $(".main-title").remove();
    $(".secondary-data").remove();
    $(".secondary-img").remove()

    // one div showing search parameters
    var mainTitleDiv = $("<div></div>", { id: "main-title", class: "main-title col s12 m6 l6 xl6" });
    $(mainTitleDiv).appendTo("#row-1");
    var mainTitleData = $("<p></p>", { id: "main-data", class: "main-data" });
    $(mainTitleData).html("Search: " + genre);
    $(mainTitleData).appendTo(mainTitleDiv);

    var secondaryDataDiv = $("<div></div>", { id: "secondary-data-div", class: "secondary-data col s12" }); 
    $(secondaryDataDiv).appendTo("#row-2");
    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data" });
    
    // create links which correspond to the data returned and lead to a title display page
    for (var a = data.results, i = a.length; i--; ) {
        var random = a.splice(Math.floor(Math.random() * (i + 1)), 1)[0];
        $(secondaryData).html() += "<a onclick='a"+ i + "1' id='a" + i + "1'>" + data.results[i].title + "</a>";
        var aLink = document.querySelector("#a" + i + "1");
        aLink.addEventListener('click', fetchLinkedTitle(link));

    }
   
    
    $(secondaryData).appendTo(secondaryDataDiv);
}

function displayGenresList() {
    // remove elements on the page first for searching additional times
    $(".main-title").remove();
    $(".secondary-data").remove();
    $(".secondary-img").remove()

    // one primary div which displays a list of genres;
    var secondaryDataDiv = $("<div></div>", { id: "secondary-data-div", class: "secondary-data col s6" }); 
    $(secondaryDataDiv).appendTo("#row-2");
    var secondaryDataDiv2 = $("<div></div>", { id: "secondary-data-div-2", class: "secondary-data col s6" });
    $(secondaryDataDiv2).appendTo("#row-2");
    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data gold center right" });
    var secondaryData2 = $("<p></p>", { id: "secondary-data-2", class: "secondary-data gold center left" });

    // list of genres
    $(secondaryData).html("Use commas for multiples: <br>Action<br>Adventure<br>Animation<br>Biography<br>Comedy<br>Crime<br>Documentary<br>Drama<br>Family<br>Fantasy<br>Film-Noir<br>Game-Show<br>History");
    $(secondaryData).appendTo(secondaryDataDiv);
    $(secondaryData2).html("<br>Horror<br>Music<br>Musical<br>Mystery<br>News<br>Reality-TV<br>Romance<br>Sci-Fi<br>Sport<br>Talk-Show<br>Thriller<br>War<br>Western");
    $(secondaryData2).appendTo(secondaryDataDiv2);
    var closeBtn = $("<button></button>", { id: "close-btn", class: "inline waves-effect waves-light btn-small" });
    $(closeBtn).html("Close");
    $(closeBtn).appendTo(secondaryDataDiv);

    function clearGenresList() {
        $(".secondary-data").remove();
    }

    var closeBtnEl = document.querySelector("#close-btn");
    closeBtnEl.addEventListener("click", clearGenresList);
}

// query selectors for the search by title form
var searchFormEl = document.querySelector("#search-form");
var searchNameEl = document.querySelector("#name");
var genresIdeasBtn = document.querySelector("#genres-ideas");

// default search is by title
searchFormEl.addEventListener("submit", formSubmitHandler);
genresIdeasBtn.addEventListener("click", displayGenresList);

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