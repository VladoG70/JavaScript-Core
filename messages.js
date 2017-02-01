function startApp() {
    const kinveyBaseUrl = "https://baas.kinvey.com/";
    const kinveyAppKey = "kid_BkCYZK5me";
    const kinveyAppSecret = "8546c5a367274a77aef6ba4f188cb0b3";
    const kinveyAppAuthHeaders = {'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret)};
    let usernameApp = '';
    let userFullNameApp = '';

    sessionStorage.clear(); // Clear All Data from Session
    showView('viewAppHome');
    showHideMenuLinks();

    // Attach CLICK on App MENU
    $("#linkMenuAppHome").click(showHomeView); // -----
    $("#linkMenuLogin").click(showLoginView); // ----
    $("#linkMenuRegister").click(showRegisterView); // ----

    // Attach CLICK on USER MENU Only
    $("#linkMenuUserHome").click(showUserHomeView); // ----
    $("#linkMenuMyMessages").click(showMyMessagesView); // ----
    $("#linkMenuArchiveSent").click(showArchiveMsgView); // -------
    $("#linkMenuSendMessage").click(showSendMsgView); // --------
    $("#linkMenuLogout").click(logoutUser); // -------
    // Home screen
    $("#linkUserHomeMyMessages").click(showMyMessagesView);
    $("#linkUserHomeSendMessage").click(showSendMsgView);
    $("#linkUserHomeArchiveSent").click(showArchiveMsgView);

    // ------------------------- END ATTACH TITLE MENU CLICKS --------------------------------------

    // Attach CLICK on other forms BUTTONS
    // TODO: ------
    $("#formLogin").on("submit", loginUser); // -------
    $("#formRegister").on("submit", registerUser); // -------



    // ------------------------- END ATTACH OTHER Buttons CLICKS --------------------------------------


    // SHOW/HIDE MENU View --------------------------------
    function showHideMenuLinks() {
        if (sessionStorage.getItem('authToken')) {
            // We have LoggedIn user
            // ---- HIDE --------------
            $("#linkMenuAppHome").hide();
            $("#linkMenuLogin").hide();
            $("#linkMenuRegister").hide();
            // ---- SHOW ---
            $("#linkMenuUserHome").show();
            $("#linkMenuMyMessages").show();
            $("#linkMenuArchiveSent").show();
            $("#linkMenuSendMessage").show();
            $("#linkMenuLogout").show();
            $("#spanMenuLoggedInUser").show();
            //...
        } else {
            // NO LoggedIn user - if LogOUT or Beggining
            // ---- HIDE --------------
            $("#linkMenuUserHome").hide();
            $("#linkMenuMyMessages").hide();
            $("#linkMenuArchiveSent").hide();
            $("#linkMenuSendMessage").hide();
            $("#linkMenuLogout").hide();
            $("#spanMenuLoggedInUser").hide();
            // ----- SHOW -----------------------
            $("#linkMenuAppHome").show();
            $("#linkMenuLogin").show();
            $("#linkMenuRegister").show();
            //...
            //alert('TITLE NO LogedIn');
        }
    }
    // END ----> SHOW/HIDE MENU View --------------------------------

    // INFO MESSAGES controls -----------------------------------------
    // Attach CLICK on INFO MESSAGEs
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

    // SHOW ERROR Messages --------------------------
    function showError(errorMsg) {
        $('#errorBox').text("Error: " + errorMsg);
        $('#errorBox').show();
        //console.log(errorMsg + 'SHOW ERROR ????');
    }
    // END INFO messages controls -------------------------


    // SHOW VIEW ------------------------------------
    // HOME APP VIEW
    function showView(viewName) {
        // Hide all views and show the selected view only
        //$("header").hide(); // Hide ALL TITLE MENU links
        //$("main > div").hide(); // Hide ALL INFO Messages --- ERROR/Success/Load ...
        $("main > #loadingBox").hide(); // Hide ALL INFO Messages --- ERROR/Success/Load ...
        $("main > #infoBox").hide(); // Hide ALL INFO Messages --- ERROR/Success/Load ...
        $("main > #errorBox").hide(); // Hide ALL INFO Messages --- ERROR/Success/Load ...
        $("main > section").hide(); // Hide ALL INFO Messages --- ERROR/Success/Load ...


        $('#' + viewName).show(); // Show only the TEXT with ID viewName = viewHome

        //alert(viewName);
    }


    // showHomeView ----------------------
    function showHomeView() {
        showView('viewAppHome');
    }

    // showLoginView ------------------
    function showLoginView() {
        $('#formLogin').trigger('reset'); // Clear old data in form fields
        showView('viewLogin');
    }

    // showRegisterView ------------
    function showRegisterView() {
        $('#formRegister').trigger('reset'); // Clear old data in form fields
        showView('viewRegister');
    }

    // ---- USERs VIEWs ----------------------------------------
    // showUserHomeView ---------------
    function showUserHomeView() {
        $("#viewUserHomeHeading").text(`Welcome, ${usernameApp} !`);
        showView('viewUserHome');
    }

    // showMyMessagesView -------------
    function showMyMessagesView() {
        //$('#myMessages').empty();
        showView('viewMyMessages');
        receivedMessagesScreen();
    }

    // showArchiveMsgView ------------
    function showArchiveMsgView() {
        showView('viewArchiveSent');
    }

    // showSendMsgView ----------------
    function showSendMsgView() {
        $('#msgRecipientUsername').val(usernameApp);
        showView('viewSendMessage');
    }


    // Functions ------
    function receivedMessagesScreen() {
        let myMsg = `?query={"recipient_username":"${usernameApp}"}`;
        // LOAD Messages
        $.ajax({
            method: "GET",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/messages" + myMsg,
            headers: getKinveyUserAuthHeaders(),
            success: loadMsgSuccess,
            error: handleAjaxError
        });

        function loadMsgSuccess(messages) {
            showInfo('Loaded MyMessages successfully!');
            $("#myMessages").empty();
            if (messages.length == 0) {
                $('#myMessages').text('No messages in MyMessages.');
            } else {
                $('#myMessages').html(`There are <b>${messages.length}</b> MESSAGES in MyMessages!`);
                let msgTable = $('<table>').append($('<tr>')
                    .append('<th>From</th><th>Message</th>',
                        '<th>Date Received</th>'));

                for (let message of messages){
                    appendMsgRow(message, msgTable);
                }

                $('#myMessages').append(msgTable);
            }

            function appendMsgRow(message, msgTable) {
                let links = [];
                if (message._acl.creator == sessionStorage['userId']) {
                    let deleteLink = $('<a href="#">[Delete]</a>').click(function () { deleteMsg(message) });
                    links = [deleteLink];
                }

                if (message.recipient_username == sessionStorage['userId']) {
                    //console.log(message._kmd);

                    msgTable.append($('<tr>').append(
                        $('<td>').text(message.sender_username),
                        $('<td>').text(message.text),
                        $('<td>').text(message._kmd),
                        $('<td>').append(links)
                    ));
                }
            }
        }




        // FORMAT DATA
        function formatDate(dateISO8601) {
            let date = new Date(dateISO8601);
            if (Number.isNaN(date.getDate()))
                return '';
            return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
                "." + date.getFullYear() + ' ' + date.getHours() + ':' +
                padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

            function padZeros(num) {
                return ('0' + num).slice(-2);
            }
        }

        function formatSender(name, username) {
            if (!name)
                return username;
            else
                return username + ' (' + name + ')';
        }
    } // END received MSG


    // SEND MESSAGES ------------------
    function sendMessages() {
        let sendMsgData = {
            sender_username: usernameApp,
            sender_name: userFullNameApp,
            recipient_username: $("#msgRecipientUsername").val()
        };

        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/messages",
            headers: getKinveyUserAuthHeaders(),
            data: sendMsgData,
            success: sendMsgSuccess,
            error: handleAjaxError
        });

        function sendMsgSuccess(response) {
            showInfo('Message sent successfully!');
            showMyMessagesView();
        }
    }

    // DELETE MESSAGES -----------------------------------------------
    function deleteMsg(message) {
        $.ajax({
            method: "DELETE",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/messages/" + message._id,
            headers: getKinveyUserAuthHeaders(),
            success: deleteMessageSuccess,
            error: handleAjaxError
        });

        function deleteMessageSuccess(response) {
            showView('viewMyMessages');
            showInfo('Message deleted successfully!');
        }
    }



    // REGISTER, LogIn, LogOut -------------------------------------
    // REGISTER User
    function registerUser(event) {
        event.preventDefault();
        // in POSTMAN -> BODY -> Content-type: application/json
        let userRegData = {
            username: $("#formRegister input[name=username]").val(),
            password: $("#formRegister input[name=password]").val(),
            name: $("#formRegister input[name=name]").val()
        };

        // console.log(userRegData.username);
        // console.log(userRegData.password);
        // console.log(userRegData.name);


        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/",
            headers: kinveyAppAuthHeaders,
            data: userRegData, // in POSTMAN -> in BODY Content-type: application/json
            success: registerSuccess,
            error: handleAjaxError
        });

        function registerSuccess(userInfo) {
            saveAuthInSession(userInfo);
            showHideMenuLinks();
            showUserHomeView();
            showInfo('User registration successfully.');
        }
    }

    // LOGIN User
    function loginUser(event) {
        event.preventDefault();
        // in POSTMAN -> BODY -> Content-type: application/json

        let userData = {
            username: $("#formLogin input[name=username]").val(),
            password: $("#formLogin input[name=password]").val()
        };

        // console.log(userData.username);
        // console.log(userData.password);

        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/login",
            headers: kinveyAppAuthHeaders,
            data: userData, // in POSTMAN -> in BODY Content-type: application/json
            success: loginSuccess,
            error: handleAjaxError
        });


        function loginSuccess(userInfo) {
            // console.log(userInfo + 'LoginSuccess!');

                saveAuthInSession(userInfo);
                showHideMenuLinks();
                showUserHomeView();
                showInfo('LogedIn successfully!');
        }
    }

    // logoutUser -------
    function logoutUser(event) {
        event.preventDefault();
        // LogOUT
        usernameApp = '';
        userFullNameApp = '';

        $.ajax({
            method: "POST",
            url: kinveyBaseUrl + "user/" + kinveyAppKey + "/_logout",
            headers: getKinveyUserAuthHeaders(),
            success: logoutSuccess,
            error: handleAjaxError
        });

        function logoutSuccess(userInfo) {
            showInfo('LogedOUT successfully!');
           setTimeout(function() {
                showHideMenuLinks();
                sessionStorage.clear();
                showHideMenuLinks();
                showHomeView('viewAppHome');
           }, 3000);

        }

    }



    // Save CURRENT USER SESSION -------------------------------------------
    function saveAuthInSession(userInfo) {
        let userAuth = userInfo._kmd.authtoken; // GET AuthToken from Kinvey
        sessionStorage.setItem('authToken', userAuth); // Save in SESSION
        let userId = userInfo._id; // GET LOGIN USER's ID
        sessionStorage.setItem('userId', userId); // Save user ID in session
        let username = userInfo.username; // GET USERNAME
        $('#spanMenuLoggedInUser').text("Welcome, " + username + "!"); // ????????? da se PROMENI----------
        usernameApp = userInfo.username;
        userFullNameApp = userInfo.name;
    }

    // GET AuthHeaders from Session ----------------------------------
    function getKinveyUserAuthHeaders(){
        return {
            "Authorization": "Kinvey " + sessionStorage.getItem("authToken")
        }
    }

    // Handle If AJAX ERROR ------------------------------------------
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

} // END of startApp