function loadRepos() {
    $("#repos").empty();
    let url = "https://api.github.com/users/" +
        $("#username").val() + "/repos";
    // return - because of Judge
    return $.ajax({ url,
        success: displayRepos,
        error: displayError
    });

    function displayRepos(respos) {
        //console.log(respos);
        for (let repo of respos) {
            // console.log(repo.full_name);
            // console.log(repo.html_url);

            let link = $('<a>').text(repo.full_name);
            link.attr('href', repo.html_url);
            $("#repos").append($('<li>').append(link));
        }
    }
    function displayError(err) {
        $("#repos").append($("<li>Error</li>"));
    }

}
