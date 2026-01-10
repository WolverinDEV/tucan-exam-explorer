console.log(`Generating a list of exam ids. Please wait...`);
const sessionId = location.search.match(/-N(\d+)/)[1];
await fetch(
    `?APPNAME=CampusNet&PRGNAME=EXAMRESULTS&ARGUMENTS=-N${sessionId},-N000325,-N999`
)
    .then((response) => response.text())
    .then((response) => {
        if (response.includes("timeout.htm")) {
            throw "Session timed out. Please refresh the current page.";
        }

        const examIds = [
            ...response
                .matchAll(
                    /GRADEOVERVIEW&amp;ARGUMENTS=-N\d+,-N\d+,-AEXEV,-N(\d+)/gm
                )
                .map((match) => match[1]),
        ];
        console.log(
            `Successfully grathered the following exam ids (${
                examIds.length
            }):\n${examIds.join("\n")}`
        );
    })
    .catch((error) => {
        console.error(`Failed to generate a list of exam ids:`);
        console.error(error);
    });
