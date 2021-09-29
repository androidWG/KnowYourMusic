export async function popup(url) {
    console.log(`Opening popup with URL "${url}"`)
    const windowArea = {
        width: Math.floor(window.outerWidth * 0.3),
        height: Math.floor(window.outerHeight * 0.7),
    };

    if (windowArea.width < 450) {
        windowArea.width = 450;
    }
    if (windowArea.height < 630) {
        windowArea.height = 630;
    }
    windowArea.left = Math.floor(
        window.screenX + (window.outerWidth - windowArea.width) / 2
    );
    windowArea.top = Math.floor(
        window.screenY + (window.outerHeight - windowArea.height) / 8
    );

    const sep = url.indexOf("?") !== -1 ? "&" : "?";
    const formatted_url = `${url}${sep}`;
    const windowOpts = `toolbar=0,scrollbars=1,status=1,resizable=1,location=1,menuBar=0,
    width=${windowArea.width},height=${windowArea.height},
    left=${windowArea.left},top=${windowArea.top}`;

    const authWindow = window.open(
        formatted_url,
        "producthuntPopup",
        windowOpts
    );
    // Create IE + others compatible event handler
    const eventMethod = window.addEventListener
        ? "addEventListener"
        : "attachEvent";
    const eventer = window[eventMethod];
    const messageEvent =
        eventMethod === "attachEvent" ? "onmessage" : "message";

    // Listen to message from child window
    return new Promise((resolve, reject) => {
        eventer(
            messageEvent,
            (e) => {
                if (e.origin !== window.location.origin) {
                    authWindow.close();
                    console.log(`Origin ${e.origin} is different from current location ${window.location.origin}`);
                    reject("Not allowed");
                }

                if (e.data.response) {
                    authWindow.close();
                    resolve(e.data.response);
                } else {
                    authWindow.close();
                    reject("Unauthorised");
                }
            },
            false
        );
    });
}
