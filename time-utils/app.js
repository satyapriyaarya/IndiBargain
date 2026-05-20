const zones = [
    "UTC",
    "Asia/Kolkata",
    "Asia/Dubai",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Asia/Seoul",
    "Asia/Bangkok",
    "Europe/London",
    "Europe/Berlin",
    "Europe/Paris",
    "Europe/Moscow",
    "Africa/Johannesburg",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Toronto",
    "America/Sao_Paulo",
    "Australia/Sydney",
    "Pacific/Auckland"
];

const dom = {
    utilHint: document.getElementById("utilHint"),
    utilButtons: document.querySelectorAll(".util-chip"),
    utilPanels: document.querySelectorAll(".utility-panel"),
    clockGrid: document.getElementById("clockGrid"),
    clockStatus: document.getElementById("clockStatus"),
    convertDateTime: document.getElementById("convertDateTime"),
    fromZone: document.getElementById("fromZone"),
    toZone: document.getElementById("toZone"),
    convertZoneBtn: document.getElementById("convertZoneBtn"),
    zoneOutput: document.getElementById("zoneOutput"),
    timestampInput: document.getElementById("timestampInput"),
    timestampZone: document.getElementById("timestampZone"),
    timestampDateTime: document.getElementById("timestampDateTime"),
    timestampFromZone: document.getElementById("timestampFromZone"),
    tsToDateBtn: document.getElementById("tsToDateBtn"),
    dateToTsBtn: document.getElementById("dateToTsBtn"),
    timestampOutput: document.getElementById("timestampOutput")
};

function selectUtility(button) {
    const utility = button.dataset.util;
    dom.utilButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    dom.utilPanels.forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.utilPanel === utility);
    });

    dom.utilHint.textContent = `Selected: ${button.textContent.trim()}`;
}

function formatInZone(date, timeZone) {
    const datePart = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        year: "numeric",
        month: "short",
        day: "2-digit"
    }).format(date);

    const timePart = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
    }).format(date);

    return { datePart, timePart };
}

function getZoneOffsetLabel(date, timeZone) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "shortOffset"
    }).formatToParts(date);
    return parts.find((part) => part.type === "timeZoneName")?.value || "";
}

function getZonedDateParts(epochMs, timeZone) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
    }).formatToParts(new Date(epochMs));

    const map = {};
    parts.forEach((p) => {
        if (p.type !== "literal") map[p.type] = p.value;
    });

    return {
        year: Number(map.year),
        month: Number(map.month),
        day: Number(map.day),
        hour: Number(map.hour),
        minute: Number(map.minute),
        second: Number(map.second)
    };
}

function zonedDateTimeToEpoch(datetimeLocal, timeZone) {
    const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2})$/.exec(datetimeLocal || "");
    if (!match) {
        throw new Error("Please enter a valid datetime.");
    }

    const target = {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
        hour: Number(match[4]),
        minute: Number(match[5]),
        second: 0
    };

    const targetAsUtc = Date.UTC(
        target.year,
        target.month - 1,
        target.day,
        target.hour,
        target.minute,
        target.second
    );

    let guess = targetAsUtc;
    for (let i = 0; i < 6; i += 1) {
        const zoned = getZonedDateParts(guess, timeZone);
        const zonedAsUtc = Date.UTC(
            zoned.year,
            zoned.month - 1,
            zoned.day,
            zoned.hour,
            zoned.minute,
            zoned.second
        );

        const diff = targetAsUtc - zonedAsUtc;
        if (diff === 0) break;
        guess += diff;
    }

    return guess;
}

function renderWorldClock() {
    const now = new Date();
    dom.clockGrid.innerHTML = zones.map((zone) => {
        const city = zone.split("/").pop().replaceAll("_", " ");
        const { datePart, timePart } = formatInZone(now, zone);
        const offset = getZoneOffsetLabel(now, zone);
        return `
            <article class="clock-card">
                <p class="clock-city">${city}</p>
                <p class="clock-time">${timePart}</p>
                <p class="clock-date">${datePart} (${offset})</p>
            </article>
        `;
    }).join("");

    dom.clockStatus.textContent = `Updated ${now.toLocaleTimeString("en-GB", { hour12: false })}`;
}

function fillZoneSelect(select) {
    select.innerHTML = zones.map((zone) => `<option value="${zone}">${zone}</option>`).join("");
}

function convertZoneToZone() {
    try {
        const epoch = zonedDateTimeToEpoch(dom.convertDateTime.value, dom.fromZone.value);
        const date = new Date(epoch);
        const fromFormatted = formatInZone(date, dom.fromZone.value);
        const toFormatted = formatInZone(date, dom.toZone.value);

        dom.zoneOutput.textContent = [
            `Input: ${dom.convertDateTime.value} in ${dom.fromZone.value}`,
            `As ${dom.fromZone.value}: ${fromFormatted.datePart} ${fromFormatted.timePart}`,
            `As ${dom.toZone.value}: ${toFormatted.datePart} ${toFormatted.timePart}`,
            `Unix seconds: ${Math.floor(epoch / 1000)}`,
            `Unix milliseconds: ${epoch}`
        ].join("\n");
    } catch (error) {
        dom.zoneOutput.textContent = `Conversion error: ${error.message}`;
    }
}

function timestampToDate() {
    const raw = dom.timestampInput.value.trim();
    if (!raw || Number.isNaN(Number(raw))) {
        dom.timestampOutput.textContent = "Enter a valid timestamp number.";
        return;
    }

    const num = Number(raw);
    const epoch = raw.length > 10 ? num : num * 1000;
    const date = new Date(epoch);

    if (Number.isNaN(date.getTime())) {
        dom.timestampOutput.textContent = "Invalid timestamp.";
        return;
    }

    const utc = date.toISOString();
    const local = formatInZone(date, dom.timestampZone.value);

    dom.timestampOutput.textContent = [
        `UTC: ${utc}`,
        `${dom.timestampZone.value}: ${local.datePart} ${local.timePart}`,
        `Epoch ms: ${epoch}`,
        `Epoch sec: ${Math.floor(epoch / 1000)}`
    ].join("\n");
}

function dateToTimestamp() {
    try {
        const epoch = zonedDateTimeToEpoch(dom.timestampDateTime.value, dom.timestampFromZone.value);
        const date = new Date(epoch);
        const preview = formatInZone(date, dom.timestampFromZone.value);

        dom.timestampOutput.textContent = [
            `Input: ${dom.timestampDateTime.value} in ${dom.timestampFromZone.value}`,
            `Confirmed: ${preview.datePart} ${preview.timePart}`,
            `Epoch milliseconds: ${epoch}`,
            `Epoch seconds: ${Math.floor(epoch / 1000)}`,
            `ISO UTC: ${date.toISOString()}`
        ].join("\n");
    } catch (error) {
        dom.timestampOutput.textContent = `Timestamp error: ${error.message}`;
    }
}

function setDefaultDateTimes() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const localIso = now.toISOString().slice(0, 16);
    dom.convertDateTime.value = localIso;
    dom.timestampDateTime.value = localIso;
}

fillZoneSelect(dom.fromZone);
fillZoneSelect(dom.toZone);
fillZoneSelect(dom.timestampZone);
fillZoneSelect(dom.timestampFromZone);

dom.fromZone.value = "Asia/Kolkata";
dom.toZone.value = "UTC";
dom.timestampZone.value = "Asia/Kolkata";
dom.timestampFromZone.value = "Asia/Kolkata";

setDefaultDateTimes();
renderWorldClock();
setInterval(renderWorldClock, 1000);

dom.convertZoneBtn.addEventListener("click", convertZoneToZone);
dom.tsToDateBtn.addEventListener("click", timestampToDate);
dom.dateToTsBtn.addEventListener("click", dateToTimestamp);
dom.utilButtons.forEach((button) => {
    button.addEventListener("click", () => selectUtility(button));
});
