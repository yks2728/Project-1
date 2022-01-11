$(document).ready(function(){
    $('.modal').modal();
});

//var apiKey = "k_esgvbo9o";
var apiKey = "k_n93546yy";
var searchCount = localStorage.getItem("searchCount");
var isNewSearch = true;
var isNewGenre = true;

if (!searchCount) {
    var searchCount = 0;
    searchCount = window.searchCount;
} else {
    searchCount = window.searchCount;
}

// initialize empty arrays and obj. if it's a new search, otherwise get from LS
if (window.searchCount === 0) {
    var titleData = [];
    var dataElement = {};
} else {
    var titleData = localStorage.getItem(titleData);
    titleData = JSON.parse(titleData);
    var dataElement = {};
}

function getTitle(name) {
    var apiUrlName = "https://imdb-api.com/en/API/SearchTitle/" + apiKey + "/" + name;
        fetch(apiUrlName)
            .then(response=> response.json())
            .then(data=> {
                console.log(data);
                if (data.results.length > 0) {
                    var searchID = data.results[0].id;
                    var apiUrlName2 = "https://imdb-api.com/en/API/Title/" + apiKey + "/" + searchID;

                        fetch(apiUrlName2)
                            .then(response => response.json())
                            .then(data=> {
                                console.log(data)
                                displayMainTitle(data);
                            });
                } else { console.log("Error: No results found"); }
            });
}

// used to submit the search for a title
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

function displayMainTitle(data) {
    // remove elements on the page if searching additional times
    $(".main-title").remove();
    $(".secondary-data").remove();
    $(".secondary-img").remove();

    // one div showing title and year released
    var mainTitleDiv = $("<div></div>", { id: "main-title", class: "main-title col s12 m6 l6 xl6" });
    $(mainTitleDiv).appendTo("#row-1");
    var mainTitleData = $("<p></p>", { id: "main-data", class: "main-data" });
    $(mainTitleData).html(data.title + "<br>" + "<em>" + data.year + "</em>" + "<br>");
    $(mainTitleData).appendTo(mainTitleDiv);

    // two divs side by side, or full length if mobile 
    var secondaryDataDiv = $("<div></div>", { id: "secondary-data-div", class: "secondary-data col s12 m8 l8 xl8" });
    var secondaryImgDiv = $("<div></div>", { id: "secondary-img-div", class: " secondary-img col s12 m4 l4 xl4" }); 
    $(secondaryDataDiv).appendTo("#row-2");
    $(secondaryImgDiv).appendTo("#row-2");
    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data" });
    $(secondaryData).html("<span class='gold'>Stars:</span> " + data.stars + "<br><span class='gold'>Runtime:</span><em> " + data.runtimeStr + "</em><br><span class='gold'>Director:</span> " + data.directors + "<br><span class='gold'>Companies:</span> " + data.companies + "<br><span class='gold'>Content Rating:</span> " + data.contentRating + "<br><span class='gold'>Awards:</span> " + data.awards);
    $(secondaryImgDiv).prepend('<img id="poster-img" src="' + data.image + '" width="285" height="440.39"/>');
    $("#poster-img").appendTo(secondaryImgDiv);
    $(secondaryData).appendTo(secondaryDataDiv);
    $(secondaryDataDiv).append('<p>' + data.plot + '</p>'); 

    function saveTitleData(data) {
        if (titleData.length > 0) {
            // confirm if a title has already been searched for
            for (i = 0; i < titleData.length; i++) {
                if (titleData[i].title === data.title) {
                    isNewSearch = false;
                } else {
                    isNewSearch = true;
                }
            }
        }

        if (isNewSearch === true) {
            window.searchCount += 1;
        }

        var title = data.title;
        dataElement.title = title;

        var year = data.year;
        dataElement.year = year;

        var stars = data.stars;
        dataElement.stars = stars;

        var runtimeStr = data.runtimeStr;
        dataElement.runtimeStr = runtimeStr;

        var directors = data.directors;
        dataElement.directors = directors;

        var companies = data.companies;
        dataElement.companies = companies;

        var contentRating = data.contentRating;
        dataElement.contentRating = contentRating;

        var awards = data.awards;
        dataElement.contentRating = awards;

        var image = data.image;
        dataElement.image = image;

        var plot = data.plot;
        dataElement.plot = plot;

        var genreList = data.genreList;
        dataElement.genreList = genreList;

        localStorage.setItem("searchCount", window.searchCount)
        dataElement.searchCount = window.searchCount;

        titleData.push(dataElement);
        localStorage.setItem("titleData", JSON.stringify(titleData));
    }

    if (isNewSearch === true) {
        for (let i = 0; i < data.genreList.length; i++) {
            var currentBtn = JSON.stringify(data.genreList[i].value)
            currentBtn = currentBtn.replace(/\"/g, "");
            $("#button-div").append("<button id='btn" + currentBtn + "' class='inline waves-effect waves-light btn-small'>" + currentBtn + "</button>");  
        }
    }
    // run function to increase count (if isNewSearch) and set items to LS
    saveTitleData(data); 

    titleData = localStorage.getItem("titleData")
    titleData = JSON.parse(titleData);
}

// query selectors for the search by title form
var searchFormEl = document.querySelector("#search-form");
var searchNameEl = document.querySelector("#name");
searchFormEl.addEventListener("submit", formSubmitHandler);