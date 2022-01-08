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
    $(".main-title").remove();
    $(".secondary-data").remove();
    $(".secondary-img").remove();
    
    var mainTitleDiv = $("<div></div>", { id: "main-title", class: "main-title col s12 m6 l6 xl6" });
    mainTitleDiv.appendTo("#row-1");
    var mainTitleData = $("<p></p>", { id: "main-data", class: "main-data" });
    mainTitleData.html(data.title + "<br>" + "<em>" + data.year + "</em>" + "<br>");
    mainTitleData.appendTo(mainTitleDiv);

    var secondaryDataDiv = $("<div></div>", { id: "secondary-data-div", class: "secondary-data col s12 m8 l8 xl8" });
    var secondaryImgDiv = $("<div></div>", { id: "secondary-img-div", class: " secondary-img col s12 m4 l4 xl4" }); 
    secondaryDataDiv.appendTo("#row-2");
    secondaryImgDiv.appendTo("#row-2");
    var secondaryData = $("<p></p>", { id: "secondary-data", class: "secondary-data" });
    secondaryData.html("Stars: " + data.stars + "<br>Runtime: <em>" + data.runtimeStr + "</em><br>Director: " + data.directors + "<br>Companies: " + data.companies + "<br> Content Rating: " + data.contentRating + "<br>Awards: " + data.awards);
    $(secondaryImgDiv).prepend('<img id="poster-img" src="' + data.image + '" width="285" height="440.39"/>');
    $("#poster-img").appendTo(secondaryImgDiv);
    secondaryData.appendTo(secondaryDataDiv);
}

// query selectors for the search by title form
var searchFormEl = document.querySelector("#search-form");
var searchNameEl = document.querySelector("#name");
searchFormEl.addEventListener("submit", formSubmitHandler);