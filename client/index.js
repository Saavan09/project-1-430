window.onload = () => {
    const viewForm = document.querySelector("#view-form");
    const resultsDiv = document.querySelector("#results");

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
};
