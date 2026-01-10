import { getInnerText, parseCampusnetArguments, throwCriticalParseError } from "./utils";
import { HTMLElement, parse as parseHtml } from "node-html-parser";

function parseActionLinkElement(xml: HTMLElement) {
    if (xml.tagName !== "A") {
        throwCriticalParseError(`expected an anchor but received ${xml.tagName}`);
    }

    const [
        actionPayload,
    ] = parseCampusnetArguments("url", xml.getAttribute("href") ?? throwCriticalParseError("missing href"));

    return {
        display: getInnerText(xml).replace(/[ >]+$/g, ""),
        action: actionPayload as string,
    }
}

function parseRibbon(xml: HTMLElement) {
    const ribbon = xml.querySelector("h2") ?? throwCriticalParseError("missing h2 element");
    return ribbon.children.map(parseActionLinkElement);
}

function parseEvents(xml: HTMLElement) {
    const xmlTable = xml.querySelector(".nb.eventTable");
    if (!xmlTable) {
        /* no events present */
        return [];
    }

    const events = [];
    for (const row of xmlTable.querySelectorAll(".tbdata")) {
        const [
            _logo,
            xmlDescription,
            _empty,
            xmlType
        ] = row.children;

        const xmlEventLink = xmlDescription.querySelector("[name='eventLink']") ?? throwCriticalParseError("missing event link");
        const [
            _sessionId,
            _menuId,
            _unknown,
            id1,
            id2,
        ] = parseCampusnetArguments("url", xmlEventLink.getAttribute("href") ?? throwCriticalParseError("missing href attribute"));

        const [
            name,
            lecturer,
            date,
            ...metadata
        ] = getInnerText(xmlDescription).split(/\t[\t ]+/);

        events.push({
            id1,
            id2,

            name,
            lecturers: lecturer?.split(";").map(textLecturers => textLecturers.trim()) ?? [],
            date,
            type: getInnerText(xmlType),

            metadata
        });
    }

    return events;
}

function parseSubnodes(xml: HTMLElement) {
    const xmlNodeList = xml.querySelector("#auditRegistration_list");
    if (!xmlNodeList) {
        /* no sub-nodes present */
        return [];
    }

    return xmlNodeList.querySelectorAll(".auditRegNodeLink").map(parseActionLinkElement);
}

export function parseRegistrationAuditor(xml: string) {
    if (xml.indexOf("registration_auditor.htm") === -1) {
        throwCriticalParseError("expected a registration auditor template");
    }

    const dom = parseHtml(xml);
    return {
        ribbon: parseRibbon(dom),
        events: parseEvents(dom),
        children: parseSubnodes(dom),
    };

}