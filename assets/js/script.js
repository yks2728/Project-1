var apiKey = "k_esgvbo9o";

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
    mainTitleDiv.appendTo("#row-1");
    var mainTitleData = $("<p></p>", { id: "main-data", class: "main-data" });
    mainTitleData.html(data.title + "<br>" + "<em>" + data.year + "</em>" + "<br>");
    mainTitleData.appendTo(mainTitleDiv);

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
    $(secondaryDataDiv).append('<div id="plot" class="modal"><div class="modal-content"><h4>Plot Summary: </h4><p>' + data.plot + '</p></div><div class="modal-footer"><button class="modal-close waves-effect waves-green btn-flat">Close</button></div></div>')
    $(secondaryDataDiv).append("<button data-target='plot' class='btn modal-trigger'>Display plot summary</button>"); 
}

// query selectors for the search by title form
var searchFormEl = document.querySelector("#search-form");
var searchNameEl = document.querySelector("#name");
searchFormEl.addEventListener("submit", formSubmitHandler);