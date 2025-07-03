const list = document.getElementById("list");
const API_URL = "/api/shows";

// Función para cargar las series desde la API
async function loadShows() {
  try {
    const res = await fetch(API_URL);
    const shows = await res.json();
    displayShows(shows);
  } catch (error) {
    console.error("Error cargando las series:", error);
    list.innerHTML = "<p>Error al cargar las series. Intenta nuevamente.</p>";
  }
}

// Función para mostrar las series en tarjetas
function displayShows(shows) {
  list.innerHTML = "";

  shows.forEach(show => {
    // Extraer el ID correctamente (compatible con MongoDB)
    const showId = show._id?.$oid || show._id;
    
    const card = document.createElement("div");
    card.className = "tv-card";
    card.dataset.id = showId;
    
    // Contenido básico de la tarjeta
    card.innerHTML = `
      <div class="card-header">
        <h3>${show.name}</h3>
        <span class="status ${show.running ? 'on-air' : 'off-air'}">
          ${show.running ? "EN EMISIÓN" : "FINALIZADA"}
        </span>
      </div>
      <div class="card-body">
        <p><strong>Temporadas:</strong> ${show.seasons}</p>
        <p><strong>Plataformas:</strong> ${show.streaming.join(", ")}</p>
        ${show.awards && Object.values(show.awards).flat().length > 0 ? 
          `<p><strong>Premios:</strong> ${Object.values(show.awards).flat().length} premios</p>` : ''}
      </div>
      <div class="card-actions">
        <button class="btn-edit" data-id="${showId}">✏️ Editar</button>
        <button class="btn-delete" data-id="${showId}">🗑️ Eliminar</button>
      </div>
    `;

    // Configurar eventos de la tarjeta
    setupCardEvents(card, show);
    list.appendChild(card);
  });
}

function setupCardEvents(card, show) {
  const showId = show._id?.$oid || show._id;

  card.querySelector('.btn-edit').addEventListener('click', function(e) {
    e.stopPropagation();
    sessionStorage.setItem('showToEdit', JSON.stringify(show));
    window.location.href = 'editar-serie.html';
  });

  card.querySelector('.btn-delete').addEventListener('click', function(e) {
    e.stopPropagation();
    deleteShow(showId);
  });

  // Evento único para el click en la tarjeta
  card.addEventListener('click', function(e) {
    if (!e.target.classList.contains('btn-edit') && 
        !e.target.classList.contains('btn-delete')) {
      showDetailsModal(show);
    }
  });
}

// Mostrar modal con detalles completos
function showDetailsModal(show) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  const showId = show._id?.$oid || show._id;
  
  let awardsHTML = "";
  if (show.awards) {
    for (const [awardType, awards] of Object.entries(show.awards)) {
      if (awards.length > 0) {
        awardsHTML += `<h4>${awardType}</h4><ul>`;
        awards.forEach(award => {
          awardsHTML += `<li><strong>${award.category}</strong> (${award.year})</li>`;
        });
        awardsHTML += "</ul>";
      }
    }
  }

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <h2>${show.name}</h2>
      <div class="modal-body">
        
        <p><strong>Temporadas:</strong> ${show.seasons}</p>
        <p><strong>En emisión:</strong> ${show.running ? "Sí" : "No"}</p>
        <p><strong>Plataformas:</strong> ${show.streaming.join(", ")}</p>
        
        ${awardsHTML ? `<div class="awards-section"><h3>Premios</h3>${awardsHTML}</div>` : ''}
        
        <div class="modal-actions">
          <button class="modal-btn-edit" data-id="${showId}">✏️ Editar</button>
          <button class="modal-btn-delete" data-id="${showId}">🗑️ Eliminar</button>
        </div>
      </div>
    </div>
  `;

  // Eventos del modal
  modal.querySelector('.close-modal').addEventListener('click', () => {
    modal.remove();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  modal.querySelector('.modal-btn-edit').addEventListener('click', () => {
    sessionStorage.setItem('showToEdit', JSON.stringify(show));
    window.location.href = 'editar-serie.html';
  });

  modal.querySelector('.modal-btn-delete').addEventListener('click', () => {
    modal.remove();
    deleteShow(showId);
  });

  document.body.appendChild(modal);
}

async function deleteShow(id) {
  if (!id) {
    console.error('ID no proporcionado para eliminar');
    alert('Error: No se proporcionó un ID válido');
    return;
  }

  if (!confirm('¿Estás seguro de eliminar esta serie? Esta acción no se puede deshacer.')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar la serie');
    }

    const cardToRemove = document.querySelector(`.tv-card[data-id="${id}"]`);
    if (cardToRemove) {
      cardToRemove.remove();
      showNotification('Serie eliminada correctamente', 'success');
    } else {
      loadShows();
    }
  } catch (error) {
    console.error('Error al eliminar la serie:', error);
    showNotification(`No se pudo eliminar la serie: ${error.message}`, 'error');
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Iniciar la aplicación
document.addEventListener('DOMContentLoaded', loadShows);