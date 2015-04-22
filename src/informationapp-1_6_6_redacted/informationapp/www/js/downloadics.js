/**
 * Created by rmurray1 on 4/21/15.
 */

    // "http://54.183.5.196/veniapi/calendaritems/GGG"

        var fileTransfer = new FileTransfer();
        var uri = encodeURI("http://54.183.5.196/veniapi/calendaritems/GGG");

        fileTransfer.download(
            uri,
            filePath,
            function(entry) {
                console.log("download complete: " + entry.fullPath);
            },
            function(error) {
                console.log("download error source " + error.source);
                console.log("download error target " + error.target);
                console.log("upload error code" + error.code);
            },
            false,
            {
                headers: {
                    "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
                }
            }
        );
