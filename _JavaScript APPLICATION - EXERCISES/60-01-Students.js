function studentList() {
    const kinveyBaseUrl = "https://baas.kinvey.com/";
    const kinveyAppKey = "kid_BJXTsSi-e";
    const kinveyAppSecret = "447b8e7046f048039d95610c1b039390";
    const kinveyAppAuthHeaders = {'Authorization': "Basic " + btoa(kinveyAppKey + ":" + kinveyAppSecret)};

    sessionStorage.clear();
    loginUser();

    // LOGIN User
    function loginUser() {
        // in POSTMAN -> BODY -> Content-type: application/json
        let userData = {
            username: "guest",
            password: "guest"
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
            loadStudents();
            //alert("LogIn successful!");
        }
    }

    function saveAuthInSession(userInfo) {
        let userAuth = userInfo._kmd.authtoken; // GET AuthToken from Kinvey
        sessionStorage.setItem('authToken', userAuth); // Save in SESSION
        let userId = userInfo._id; // GET LOGIN USER's ID
        sessionStorage.setItem('userId', userId); // Save user ID in session
        let username = userInfo.username; // GET USERNAME
    };

    function loadStudents() {
        $.ajax({
            method: "GET",
            url: kinveyBaseUrl + "appdata/" + kinveyAppKey + "/students",
            headers: getKinveyUserAuthHeaders(),
            success: loadStudentSuccess,
            error: handleAjaxError
        });

        function loadStudentSuccess(students) {
            let studentList = $("table > tbody");
            for (let student of students.sort(function(a,b) { return a.ID - b.ID }) ) {
                //console.log(student.FirstName);
                studentList.append($("<tr>").append(
                    $("<td>").text(student.ID),
                    $("<td>").text(student.FirstName),
                    $("<td>").text(student.LastName),
                    $("<td>").text(student.FacultyNumber),
                    $("<td>").text(student.Grade)
                ));
            }
            studentList.appendTo($("#result"));
        }
    };




    function getKinveyUserAuthHeaders(){
        return {
            "Authorization": "Kinvey " + sessionStorage.getItem("authToken")
        }
    };

    function handleAjaxError(response) {
        let errorMsg = JSON.stringify(response);
        if (response.readyState === 0) {
            errorMsg = "Cannot connect due to network error.";
        }

        if (response.responseJSON && response.responseJSON.description) {
            errorMsg = response.responseJSON.description;
        }
        //alert(errorMsg);
    }

}