function startApp() {
    const kinveyBaseUrl = "https://baas.kinvey.com/";
    const kinveyAppKey = "kid_Byj5ZHRzg";
    const kinveyAppSecret = "79f464e429a94d92b78a5967b7e76ddf";
    const kinveyAppAuthHeaders = {'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret)};
    let publisher = '';


    sessionStorage.clear(); // Clear All Data from Session
    showHideMenuLinks();
    showView('viewHome');

    // Attach CLICK on MENU
    $("#linkHome").click(showHomeView);
    $("#linkLogin").click(showLoginView);
    $("#linkRegister").click(showRegisterView);
    $("#linkListAds").click(showListAdsView);
    $("#linkCreateAd").click(showCreateAdsView);
    $("#linkLogout").click(logoutUser);

    // Attach CLICK on other forms BUTTONS
    $("#buttonRegisterUser").click(registerUser);
    $("#buttonLoginUser").click(loginUser);
    $("#buttonCreateAd").click(createAdvert);
    $("#buttonEditAd").click(editAdvert);

    // SHOW/HIDE MENU View
    function showHideMenuLinks() {
        $("#linkHome").show();
        if (sessionStorage.getItem('authToken')) {
            // We have LoggedIn user
            $("#linkLogin").hide();
            $("#linkRegister").hide();
            $("#linkListAds").show();
            $("#linkCreateAd").show();
            $("#linkLogout").show();
            $("#loggedInUser").show();
        } else {
            // NO LoggedIn user - if LogOUT or Beggining
            $("#linkLogin").show();
            $("#linkRegister").show();
            $("#linkListAds").hide();
            $("#linkCreateAd").hide();
            $("#linkLogout").hide();
            $("#loggedInUser").hide();
        }
    }

    // SHOW VIEW
    function showView(viewName) {
        // Hide all views and show the selected view only
        $('main > section').hide(); // Hide ALL MENU links
        $('#' + viewName).show(); // Show only the TEXT with ID viewName = viewHome
    }

    // Attach CLICK on MESSAGEs
    // POP-UP Info MESSIGES -> HIDE on CLICK over msg
    $("#infoBox, #errorBox").click(function() {
        $(this).fadeOut();
    });

    // Attach AJAX "loading" event listener
    // Prihvashta AJAX zaiavkite i pokazva INFO pri start i skriva pri KRAI na AJAX-zaiavkata
    $(document).on({
        ajaxStart: function() { $("#loadingBox").show() },
        ajaxStop: function() { $("#loadingBox").hide() }
    });

    // SHOW INFO Messages --------------------------
    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(function() {
            $('#infoBox').fadeOut();
        }, 3000);
    }

    // SHOW CREATE, DELETE --- INFO Messages --------------------------
    function showCreateDeleteAdvMessage(message) {
        $('#errorBox').text(message);
        $('#errorBox').show();
    }

    // SHOW ERROR Messages --------------------------
    function showError(errorMsg) {
        $('#errorBox').text("Error: " + errorMsg);
        $('#errorBox').show();
    }


    function showHomeView() {
        showView('viewHome');
    }

    function showLoginView() {
        $('#formLogin').trigger('reset'); // Clear old data in form fields
        showView('viewLogin');
    }

    function showRegisterView() {
        $('#formRegister').trigger('reset'); // Clear old data in form fields
        showView('viewRegister');
    }

    // SHOW ADVERTISEMENTS View
    function showListAdsView() {
        showView('viewAds');
        $("#ads").empty();
        listAdsView();
    }

    function showCreateAdsView() {
        $('#formCreateAd').trigger('reset'); // Clear old data in form fields
        showView('viewCreateAd');
        //createAdvert();
    }

    // REGISTER, LogIn, LogOut -------------------------------------
    // REGISTER User
    function registerUser() {
        // in POSTMAN -> BODY -> Content-type: application/json
        let userData = {
            username: $("#formRegister input[name=username]").val(),
            password: $("#formRegister input[name=passwd]").val()
        };

        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/",
            headers: kinveyAppAuthHeaders,
            data: userData, // in POSTMAN -> in BODY Content-type: application/json
            success: registerSuccess,
            error: handleAjaxError
        });

        function registerSuccess(userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            listAdsView();
            showInfo('User registration successfully.');
        }
    }

    // LOGIN User
    function loginUser() {
        // in POSTMAN -> BODY -> Content-type: application/json
        let userData = {
            username: $("#formLogin input[name=username]").val(),
            password: $("#formLogin input[name=passwd]").val()
        };

        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/login",
            headers: kinveyAppAuthHeaders,
            data: userData, // in POSTMAN -> in BODY Content-type: application/json
            success: loginSuccess,
            error: handleAjaxError
        });

        function loginSuccess(userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            showListAdsView();
            showInfo('LogedIn successfully!');
        }
    }

    // LOGOUT User
    function logoutUser() {
        publisher = '';
        sessionStorage.clear();
        showHideMenuLinks();
        showHomeView('viewHome');
    }


    // LIST All ADVERTISMENTS ---------------------------------------------
    function listAdsView() {
        $.ajax({
            method: "GET",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/adv",
            headers: getKinveyUserAuthHeaders(),
            success: loadAdvSuccess,
            error: handleAjaxError
        });

        function loadAdvSuccess(adverts) {
            showInfo('Loaded ADVERTISEMENTS successfully!');
            if (adverts.length == 0) {
                $('#ads').text('No books in the library.');
            } else {
                $('#ads').html(`There are <b>${adverts.length}</b> ADVERTISEMENTS registered!`);
                let advTable = $('<table>').append($('<tr>')
                    .append('<th>Title</th><th>Description</th>',
                        '<th>Publisher</th><th>Date of Publishing</th>',
                        '<th>Price</th><th>Action</th>'));

                for (let advert of adverts){
                    appendAdvertRow(advert, advTable);
                }

                $('#ads').append(advTable);
            }

            function appendAdvertRow(advert, advTable) {
                let links = [];
                if (advert._acl.creator == sessionStorage['userId']) {
                    let deleteLink = $('<a href="#">[Delete]</a>').click(function () { deleteAdvert(advert) });
                    let editLink = $('<a href="#">[Edit]</a>').click(function () { loadAdvertForEdit(advert) });
                    links = [deleteLink, ' ', editLink];
                }

                advTable.append($('<tr>').append(
                    $('<td>').text(advert.Title),
                    $('<td>').text(advert.Description),
                    $('<td>').text(advert.Publisher),
                    $('<td>').text(advert.Date_of_Publishing),
                    $('<td>').text(advert.Price),
                    $('<td>').append(links)
                ));
            }
        }
    }

    // CREATE ADVERTISEMENT ------------------------
    function createAdvert() {
        let advData = {
            Title: $("#formCreateAd input[name=title]").val(),
            Description: $("#formCreateAd textarea[name=description]").val(),
            Publisher: publisher,
            Date_of_Publishing: $("#formCreateAd input[name=datePublished]").val(),
            Price: $("#formCreateAd input[name=price]").val(),

        };

        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/adv",
            headers: getKinveyUserAuthHeaders(),
            data: advData,
            success: createAdvSuccess,
            error: handleAjaxError
        });

        function createAdvSuccess(response) {
            showListAdsView();
            showCreateDeleteAdvMessage(`Advertisement "${response.Title}" created successfully!`);
        }
    }

    // LOAD ADVERTISEMENT for edit
    function loadAdvertForEdit(advert) {
        $('#formEditAd').trigger('reset'); // Clear old data in form fields
        $.ajax({
            method: "GET",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/adv/" + advert._id,
            headers: getKinveyUserAuthHeaders(),
            success: loadAdvertForEditSuccess,
            error: handleAjaxError
        });

        function loadAdvertForEditSuccess(advert) {
            // This 2 fields are HIDDEN
            $("#formEditAd input[name=id]").val(advert._id);
            $("#formEditAd input[name=publisher]").val(advert.Publisher);

            $("#formEditAd input[name=title]").val(advert.Title);
            $("#formEditAd textarea[name=description]").val(advert.Description);
            $("#formEditAd input[name=datePublished]").val(advert.Date_of_Publishing);
            $("#formEditAd input[name=price]").val(advert.Price);

            showView('viewEditAd');
        }
    }

    // EDIT ADVERTISEMENT -------------------------------------------------
    function editAdvert() {
        let advData = {
            Title: $("#formEditAd input[name=title]").val(),
            Description: $("#formEditAd textarea[name=description]").val(),
            Publisher: $("#formEditAd input[name=publisher]").val(),
            Date_of_Publishing: $("#formEditAd input[name=datePublished]").val(),
            Price: $("#formEditAd input[name=price]").val(),

        };

        $.ajax({
            method: "PUT",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/adv/" + $("#formEditAd input[name=id]").val(),
            headers: getKinveyUserAuthHeaders(),
            data: advData,
            success: editAdvSuccess,
            error: handleAjaxError
        });

        function editAdvSuccess(response) {
            showListAdsView();
            showCreateDeleteAdvMessage(`Advertisement "${response.Title}" edited successfully!`);
        }
    }


    // DELETE ADVERTISEMENT -----------------------------------------------
    function deleteAdvert(advert) {
        $.ajax({
            method: "DELETE",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/adv/" + advert._id,
            headers: getKinveyUserAuthHeaders(),
            success: deleteAdvertSuccess,
            error: handleAjaxError
        });

        function deleteAdvertSuccess(response) {
            listAdsView();
            showCreateDeleteAdvMessage(`Advertisement ${advert.title} deleted successfully!`);
        }
    }

    // Save CURRENT USER SESSION -------------------------------------------
    function saveAuthInSession(userInfo) {
        let userAuth = userInfo._kmd.authtoken; // GET AuthToken from Kinvey
        sessionStorage.setItem('authToken', userAuth); // Save in SESSION
        let userId = userInfo._id; // GET LOGIN USER's ID
        sessionStorage.setItem('userId', userId); // Save user ID in session
        let username = userInfo.username; // GET USERNAME
        $('#loggedInUser').text("Welcome, " + username + "!");
        publisher = username;
    }

    // GET AuthHeaders from Session
    function getKinveyUserAuthHeaders(){
        return {
            "Authorization": "Kinvey " + sessionStorage.getItem("authToken")
        }
    }

    // Handle If AJAX ERROR --------------------
    function handleAjaxError(response) {
        let errorMsg = JSON.stringify(response);
        if (response.readyState === 0) {
            errorMsg = "Cannot connect due to network error.";
        }

        if (response.responseJSON && response.responseJSON.description) {
            errorMsg = response.responseJSON.description;
        }
        showError(errorMsg);
    }

} // End of startApp