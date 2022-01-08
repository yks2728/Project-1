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








// query selectors for the search by title form
var searchFormEl = document.querySelector("#search-form");
var searchNameEl = document.querySelector("#name");
searchFormEl.addEventListener("submit", formSubmitHandler);