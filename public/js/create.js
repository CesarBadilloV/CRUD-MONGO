document.getElementById("formSerie").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const showData = {
    name: document.getElementById("name").value,
    seasons: parseInt(document.getElementById("seasons").value),
    streaming: document.getElementById("streaming").value.split(",").map(s => s.trim()),
    running: document.getElementById("running").value === "true"
  };

  try {
    const response = await fetch("http://localhost:3000/api/shows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(showData)
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const result = await response.json();
    console.log("Serie creada:", result);
    alert("¡Serie creada exitosamente!");
    window.location.href = "http://localhost:3000"; // Redirige a la página principal

  } catch (error) {
    console.error("Error:", error);
    alert("Error al crear la serie: " + error.message);
  }
});