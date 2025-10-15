window.onload = () => {
    const viewForm = document.querySelector("#view-form");
    const resultsDiv = document.querySelector("#results");

    const addForm = document.querySelector("#add-form");
    const addName = document.querySelector("#add-name");
    const addCapital = document.querySelector("#add-capital");
    const addRegion = document.querySelector("#add-region");
    const addMessage = document.createElement("div"); // container for messages
    addForm.appendChild(addMessage);


    viewForm.addEventListener("submit", async (e) => {
        e.preventDefault(); //stop the page from refreshing

        const region = document.querySelector("#region").value;
        const subregion = document.querySelector("#subregion").value;
        const name = document.querySelector("#name").value;

        const query = new URLSearchParams({
            region,
            subregion,
            name
        });

        try {
            const response = await fetch(`/getCountries?${query.toString()}`, {
                headers: {
                    "Accept": "application/json"
                }
            });

            const data = await response.json();

            //clear previous results
            resultsDiv.innerHTML = "";

            //show new results
            if (!data.countries || data.countries.length === 0) {
                resultsDiv.textContent = "No countries found.";
            } else {
                data.countries.forEach(country => {
                    const p = document.createElement("p");
                    p.textContent = `${country.name} — ${country.capital} (${country.region})`;
                    resultsDiv.appendChild(p);
                });
            }

        } catch (err) {
            console.error("Error fetching countries:", err);
            resultsDiv.textContent = "Something went wrong!";
        }
    });


    addForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const newCountry = {
            name: addName.value,
            capital: addCapital.value,
            region: addRegion.value
        };

        const statusMessage = document.createElement("p");
        const countryInfo = document.createElement("p");
        countryInfo.style.fontWeight = "bold";
        countryInfo.textContent = `${newCountry.name} — ${newCountry.capital} (${newCountry.region})`;

        try {
            const response = await fetch('/addCountry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(newCountry)
            });

            const data = await response.json().catch(() => ({}));

            //clear results
            addMessage.innerHTML = "";

            if (response.status === 201) {
                statusMessage.textContent = `Country added successfully!`;
                addForm.reset(); //clear inputs
            } else if (response.status === 204) {
                statusMessage.textContent = `Country already exists. Updated info:`;
            } else {
                statusMessage.textContent = data.message || "Something went wrong.";
            }

            addMessage.appendChild(statusMessage);
            if (response.status === 201 || response.status === 204) {
                addMessage.appendChild(countryInfo);
            }

        } catch (err) {
            console.error("Error adding country:", err);
            statusMessage.textContent = "Error sending request!";
            addMessage.appendChild(statusMessage);
        }
    });
};
