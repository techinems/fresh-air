import "https://deno.land/x/dotenv@v2.0.0/load.ts";

function compareTime(hr: number, min: number, direction): boolean {

    let date = new Date();
    let current_hr = date.getHours();
    let current_min = date.getMinutes();

    if (direction == "lt") {
        return (current_hr < hr) || ((current_hr == hr) && (current_min < min));
    } else if (direction == "gt") {
        return (current_hr > hr) || ((current_hr == hr) && (current_min > min));
    }

}

function dayCall() : boolean {
    return compareTime(5, 55, "gt") && compareTime(18, 5, "lt");
}

async function scheduledDutyCrew(): Promise<boolean | string> {
    try {
        let response = await fetch(Deno.env.get("CREW_URL") + "?token=" + Deno.env.get("CREW_TOKEN"));
        let data = await response.text();
        if(data.trim() != "0" && data.trim() != "1")
            return "invalid authentication token";
        return data.trim() == "0" ? true : false;
    }
    catch (error){
        return error.message;
    }
}

export function toneTest(): boolean {
    let date = new Date();
    return (date.getDay() == 1 && date.getHours() == 18 && date.getMinutes() >= 0 && date.getMinutes() <= 10)
}

export function longtoneTest(): boolean {
    let date = new Date();
    return (date.getDay() == 6 && date.getHours() == 18 && date.getMinutes() >= 0 && date.getMinutes() <= 50)
}

export async function crewNeeded(): Promise<boolean | string> {
    if(dayCall())
        return true;

    let scheduledCrew = await scheduledDutyCrew();
    if(typeof scheduledCrew == "boolean")
        return !scheduledDutyCrew;

    console.log("Duty Crew Check Error: " + scheduledCrew);
    return "@devs - Unable to determine if there is a scheduled duty crew.";
}

export function makeDate(): string {
    var now = new Date();
    return [
        now.getFullYear(),
        "-",
        now.getMonth() + 1 < 10 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1),
        "-",
        now.getDate() < 10 ? "0" + (now.getDate()) : (now.getDate()),
        " at ",
        now.getHours() < 10 ? "0" + (now.getHours()) : (now.getHours()),
        ":",
        now.getMinutes() < 10 ? "0" + (now.getMinutes()) : (now.getMinutes()),
        ":",
        now.getSeconds() < 10 ? "0" + (now.getSeconds()) : (now.getSeconds())
    ].join("");
}