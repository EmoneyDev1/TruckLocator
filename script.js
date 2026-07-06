// 1. PASTE YOUR GOOGLE SHEET LINK BETWEEN THE QUOTES BELOW:
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1D-NNIAcPQ4F2FxxtYKdrkV7ho9sZ2Zfy9phnPs6Tv5Y/edit?usp=sharing";

// This breaks down the URL and grabs the exact ID to pull clean data
const sheetId = GOOGLE_SHEET_URL.split("/d/")[1].split("/")[0];
const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

const button = document.querySelector("button");
button.addEventListener("click", searchTruck);

async function searchTruck() {
    const resultsDiv = document.getElementById("results");
    const truckID = document.getElementById("truckID").value.trim();

    if (!truckID) {
        resultsDiv.innerHTML = "<h2>Please enter a Truck ID</h2>";
        return;
    }

    resultsDiv.innerHTML = "<h2>Searching...</h2>";

    try {
        // Google Sheets allows direct fetching seamlessly
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error("Failed to fetch sheet data");
        
        const data = await response.text();
        const trucks = parseCSV(data);
        
        const result = trucks.find(truck => truck.id === truckID);

        if (result) {
            // Build the clean Google Maps link using your coordinates
            const mapsLink = `https://www.google.com/maps/search/?api=1&query=${result.latitude},${result.longitude}`;

            resultsDiv.innerHTML = `
                <h2>Truck Found</h2>
                <p><strong>Lot:</strong> ${result.lot}</p>
                <p>
                    <strong>Location:</strong> 
                    <a href="${mapsLink}" target="_blank" style="color: #0078d4; text-decoration: underline;">
                        View on Google Maps 📍
                    </a>
                </p>
            `;
        } else {
            resultsDiv.innerHTML = "<h2>Truck Not Found</h2>";
        }
    } catch (error) {
        console.error(error);
        resultsDiv.innerHTML = "<h2>Error loading spreadsheet data. Make sure your Google Sheet is shared to 'Anyone with the link'.</h2>";
    }
}

function parseCSV(text) {
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) return [];

    const headers = lines[0].split(",").map(header => header.trim().toLowerCase().replace(/["']/g, ""));
    
    return lines.slice(1).map(line => {
        const values = line.split(",").map(val => val.trim().replace(/["']/g, ""));
        const obj = {};
        headers.forEach((header, index) => {
            if (values[index] !== undefined) {
                obj[header] = values[index];
            }
        });
        return obj;
    });
}