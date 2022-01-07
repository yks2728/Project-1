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
    var mainTitleDiv = $("<div></div>", { id: "main-title", class: "main-title col s12 m6 l6 xl6" });
    mainTitleDiv.appendTo("#row-1");
    var mainTitleData = $("<p></p>", { id: "main-data", class: "main-data" });
    mainTitleData.html(data.title + "<br>" + "<em>" + data.year + "</em>" + "<br>");
    mainTitleData.appendTo(mainTitleDiv);
}

// query selectors for the search by title form
var searchFormEl = document.querySelector("#search-form");
var searchNameEl = document.querySelector("#name");
searchFormEl.addEventListener("submit", formSubmitHandler);