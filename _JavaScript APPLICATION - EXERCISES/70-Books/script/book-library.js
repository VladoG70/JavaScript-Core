function startApp() {
    const kinveyBaseUrl = "https://baas.kinvey.com/";
    const kinveyAppKey = "kid_HJcG4H0fx";
    const kinveyAppSecret = "e35eef88060b4a3093f9d74988cedf23";
    const kinveyAppAuthHeaders = {'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret)};


    sessionStorage.clear(); // Clear All Data from Session
    showHideMenuLinks();
    showView('viewHome');

    // Bind the navigation menu links with function
    $("#linkHome").click(showHomeView);
    $("#linkLogin").click(showLoginView);
    $("#linkRegister").click(showRegisterView);
    $("#linkListBooks").click(listBooks);
    $("#linkCreateBook").click(showCreateBookView);
    $("#linkLogout").click(logoutUser);

    // Bind the form submit BUTTONS
    $("#buttonLoginUser").click(loginUser);
    $("#buttonRegisterUser").click(registerUser);
    $("#buttonCreateBook").click(createBook);
    $("#buttonEditBook").click(editBook);

    // ERROR and other MESSAGES
    // Bind the info / error boxes: hide on click
    // POP-UP MESSIGES -> HIDE on CLICK over msg
    $("#infoBox, #errorBox").click(function() {
        $(this).fadeOut();
    });

    // Attach AJAX "loading" event listener
    // Prihvashta AJAX zaiavkite i pokazva INFO pri start i skriva pri KRAI na AJAX-zaiavkata
    $(document).on({
        ajaxStart: function() { $("#loadingBox").show() },
        ajaxStop: function() { $("#loadingBox").hide() }
    });


    function showHideMenuLinks() {
        $("#linkHome").show();
        if (sessionStorage.getItem('authToken')) {
            // We have LoggedIn user
            $("#linkLogin").hide();
            $("#linkRegister").hide();
            $("#linkListBooks").show();
            $("#linkCreateBook").show();
            $("#linkLogout").show();
        } else {
            // NO LoggedIn user - if LogOUT or Beggining
            $("#linkLogin").show();
            $("#linkRegister").show();
            $("#linkListBooks").hide();
            $("#linkCreateBook").hide();
            $("#linkLogout").hide();
        }
    }

    function showView(viewName) {
        // Hide all views and show the selected view only
        $('main > section').hide(); // Hide ALL MENU links
        $('#' + viewName).show(); // Show only the TEXT with ID viewName = viewHome
    }


    function showHomeView() {
        showView('viewHome');
    }

    function showLoginView() {
        showView('viewLogin');
        $('#formLogin').trigger('reset');
    }

    function showRegisterView() {
        $('#formRegister').trigger('reset');
        showView('viewRegister');
    }

    function showCreateBookView() {
        $('#formCreateBook').trigger('reset');
        showView('viewCreateBook');
    }

    function showInfo(message) {
        $('#infoBox').text(message);
        $('#infoBox').show();
        setTimeout(function() {
            $('#infoBox').fadeOut();
        }, 3000);
    }

    function showError(errorMsg) {
        $('#errorBox').text("Error: " + errorMsg);
        $('#errorBox').show();
    }

    function showCreateDeletedBookMessage(message) {
        $('#errorBox').text(message);
        $('#errorBox').show();
    }


    // Register
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
            listBooks();
            showInfo('User registration successful.');
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
            listBooks();
            showInfo('LogIn successful!');
        }
    }

    // Save CURRENT USER SESSION -------------------------------------------
    function saveAuthInSession(userInfo) {
        let userAuth = userInfo._kmd.authtoken; // GET AuthToken from Kinvey
        sessionStorage.setItem('authToken', userAuth); // Save in SESSION
        let userId = userInfo._id; // GET LOGIN USER's ID
        sessionStorage.setItem('userId', userId); // Save user ID in session
        let username = userInfo.username; // GET USERNAME
        $('#loggedInUser').text(
            "Welcome, " + username + "!");
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

    // LogOUT User - moje i samo s CLEAR na sesssionStorage
    // function logoutUser() {
    //     sessionStorage.clear();
    //     $("#loggedInUser").text("");
    //     showHideMenuLinks();
    //     showView('viewHome');
    //     showInfo("LogOut successful!")
    // }

    // LogOUT User
    function logoutUser() {

        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/_logout",
            headers: getKinveyUserAuthHeaders(),
            success: logOutSuccess,
            error: handleAjaxError
        });

        function logOutSuccess(userInfo) {
            sessionStorage.clear();
            $("#loggedInUser").text("");
            showHideMenuLinks();
            showView('viewHome');
            showInfo("LogOut successful!");
        }
    }

    // Manage BOOKS --------------------------------
    function listBooks() {
        $("#books").empty();
        showView('viewBooks');

        $.ajax({
            method: "GET",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/books",
            headers: getKinveyUserAuthHeaders(),
            success: loadBookSuccess,
            error: handleAjaxError
        });

        function loadBookSuccess(books) {
            //showHideMenuLinks();
            showInfo('Loading BOOKS successful!');
            //showInfo('Books loaded.');
            if (books.length == 0) {
                $('#books').text('No books in the library.');
            } else {
                $('#books').html(`There are <b>${books.length}</b> BOOKS in the library!`);

                let booksTable = $('<table>')
                    .append($('<tr>').append(
                        '<th>Title</th><th>Author</th>',
                        '<th>Description</th><th>Actions</th>'));
                for (let book of books){
                    appendBookRow(book, booksTable);
                }
                $("#books").append(booksTable);
            }
        }
    }

    function appendBookRow(book, booksTable) {
        let links = [];
        if (book._acl.creator == sessionStorage['userId']) {
            let deleteLink = $('<a href="#">[Delete]</a>').click(function () { deleteBook(book) });
            let editLink = $('<a href="#">[Edit]</a>').click(function () { loadBookForEditSuccess(book) });
            links = [deleteLink, ' ', editLink];
        }

        booksTable.append($('<tr>').append(
            $('<td>').text(book.title),
            $('<td>').text(book.author),
            $('<td>').text(book.description),
            $('<td>').append(links)
        ));

    }

    // CREATE BOOK
    function createBook() {
        let bookData = {
            title: $("#formCreateBook input[name=title]").val(),
            author: $("#formCreateBook input[name=author]").val(),
            description: $("#formCreateBook textarea[name=descr]").val()
        };

        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/books",
            headers: getKinveyUserAuthHeaders(),
            data: bookData,
            success: createBookSuccess,
            error: handleAjaxError
        });

        function createBookSuccess(response) {
            listBooks();
            showCreateDeletedBookMessage(`Book "${response.title}" created successfully!`);
        }
    }

    // EDIT BOOK
    function loadBookForEditSuccess(book) {
        $.ajax({
            method: "GET",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/books/" + book._id,
            headers: getKinveyUserAuthHeaders(),
            success: loadBookForEditSuccess,
            error: handleAjaxError
        });

        function loadBookForEditSuccess(book) {
            $("#formEditBook input[name=id]").val(book._id);
            $("#formEditBook input[name=title]").val(book.title);
            $("#formEditBook input[name=author]").val(book.author);
            $("#formEditBook textarea[name=descr]").val(book.description);

            showView('viewEditBook');
        }
    }

    function editBook() {
        let bookData = {
            title: $("#formEditBook input[name=title]").val(),
            author: $("#formEditBook input[name=author]").val(),
            description: $("#formEditBook textarea[name=descr]").val()
        };

        $.ajax({
            method: "PUT",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/books/" + $("#formEditBook input[name=id]").val(),
            headers: getKinveyUserAuthHeaders(),
            data: bookData, // in POSTMAN -> in BODY Content-type: application/json
            success: editBookSuccess,
            error: handleAjaxError
        });

        function editBookSuccess(response) {
            listBooks();
            showCreateDeletedBookMessage(`Book "${bookData.title}" edited successfully!`);
        }
    }

    // DELETE BOOK
    function deleteBook(book) {
        $.ajax({
            method: "DELETE",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/books/" + book._id,
            headers: getKinveyUserAuthHeaders(),
            success: deleteBookSuccess,
            error: handleAjaxError
        });

        function deleteBookSuccess(response) {
            listBooks();
            showCreateDeletedBookMessage(`Book ${book.title} deleted successfully!`);
        }
    }

    function getKinveyUserAuthHeaders(){
        return {
            "Authorization": "Kinvey " + sessionStorage.getItem("authToken")
        }
    }
}