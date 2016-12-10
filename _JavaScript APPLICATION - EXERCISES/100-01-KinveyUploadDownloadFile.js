let appKey = 'kid_HJcG4H0fx';
let appSecret = 'e35eef88060b4a3093f9d74988cedf23';
let baseURL = 'https://baas.kinvey.com/';
let guestCredentials = btoa("guest:guest");

$('#upload-file-button').click(function () {
    let file = $('#uploaded-file')[0].files[0];
    //console.log(file);

    let metaData = {
        '_filename': file.name,
        'size': file.size,
        'mimeType': file.type
    };

    upload(metaData, file);

});

function upload(data, file) {
    let requestURL = baseURL + 'blob/' + appKey;
    let requestHeaders = {
        'Authorization': 'Basic ' + guestCredentials,
        'Content-Type': 'application/json',
        'X-Kinvey-Content-Type': data.mimeType
    };

    $.ajax(
        {
            method: 'POST',
            url: requestURL,
            headers: requestHeaders,
            data: JSON.stringify(data)
        }
    ).then (function (success) {
        //console.log(success);
        let innerHeaders = success._requiredHeaders;
        innerHeaders['Content-Type'] = file.type;

        let uploadURL = success._uploadURL;
        let element_id = success._id;

        $.ajax(
            {
                method: 'PUT',
                url: uploadURL,
                headers: innerHeaders,
                processData: false,
                data: file
            }
        ).then(function (success) {
            //console.log('Successfully uploaded file!');
            $('#elements').append(
                '<li id="' + element_id + '">' +
                    '   ' + file.name +
                    '   <button id="download-button">Download</button>' +
                    '</li>'
            );

            $('#download-button').click(function () {
                let inner_id = $(this).parent().attr('id');
                download(inner_id);
            });
        }).catch(function (error) {
            console.log(error);
        })
        }
    ).catch(function (error) {
        console.log(error);
    });
}

function download(id) {
    let requestURL = baseURL + 'blob/' + appKey + '/' + id;
    let requestHeaders = {
        'Authorization': 'Basic ' + guestCredentials,
        'Content-Type': 'application/json',
    };

    $.ajax(
        {
            method: 'GET',
            url: requestURL,
            headers: requestHeaders
        }
    ).then(function (success) {
        //console.log(success);
        let url = success._downloadURL;
        let link = document.createElement("a");
        link.download = url.substr(url.lastIndexOf('/'));
        link.href = url;
        link.click();

    }).catch(function (error) {
        console.log(error);
    })
}