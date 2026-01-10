const sessionId = location.search.match(/-N(\d+)/)[1];
const sessionCookie = await cookieStore
    .get("cnsc")
    .then((cookie) => cookie.value);

console.log(
    [
        `Your session information:`,
        `  Session ID    : ${sessionId}`,
        `  Session Cookie: ${sessionCookie}`,
        ``,
        `Attention:`,
        `Do not share this information with anyone!`,
    ].join`\n`
);
