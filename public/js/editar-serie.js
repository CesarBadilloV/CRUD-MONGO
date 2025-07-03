document.addEventListener('DOMContentLoaded', function() {
  // Obtener los datos de la serie a editar
  const showData = sessionStorage.getItem('showToEdit');
  
  if (!showData) {
    console.error('No se encontraron datos de serie en sessionStorage');
    alert('Error: No se encontraron datos de la serie para editar');
    window.location.href = 'http://localhost:3000';
    return;
  }

  try {
    const show = JSON.parse(showData);
    console.log('Datos de la serie cargados:', show);

    // Validar estructura básica del objeto show
    if (!show || typeof show !== 'object') {
      throw new Error('Formato de datos de serie inválido');
    }

    // Rellenar el formulario con los datos actuales
    fillFormData(show);
    
    // Configurar manejadores de eventos
    setupEventHandlers(show);

  } catch (error) {
    console.error('Error al cargar datos de edición:', error);
    alert('Error al cargar los datos de la serie: ' + error.message);
    window.location.href = 'http://localhost:3000';
  }
});

/**
 * Rellena el formulario con los datos de la serie
 * @param {Object} show - Objeto con los datos de la serie
 */
function fillFormData(show) {
  // Elementos del formulario
  const nameInput = document.getElementById('name');
  const seasonsInput = document.getElementById('seasons');
  const runningCheckbox = document.getElementById('running');
  const streamingInput = document.getElementById('streaming');
  const awardsContainer = document.getElementById('awardsContainer');

  if (!nameInput || !seasonsInput || !runningCheckbox || !streamingInput || !awardsContainer) {
    throw new Error('No se encontraron todos los elementos del formulario');
  }

  // Asignar valores
  nameInput.value = show.name || '';
  seasonsInput.value = show.seasons || 1;
  runningCheckbox.checked = !!show.running;
  
  // Manejar plataformas de streaming
  if (Array.isArray(show.streaming)) {
    streamingInput.value = show.streaming.join(', ');
  } else if (typeof show.streaming === 'string') {
    streamingInput.value = show.streaming;
  } else {
    streamingInput.value = '';
  }

  // Mostrar premios
  renderAwards(show.awards || {});
}

/**
 * Configura los manejadores de eventos del formulario
 * @param {Object} originalShow - Datos originales de la serie
 */
function setupEventHandlers(originalShow) {
  const editForm = document.getElementById('editShowForm');
  const cancelBtn = document.getElementById('cancelBtn');

  if (!editForm || !cancelBtn) {
    throw new Error('No se encontraron los elementos del formulario');
  }

  // Manejar envío del formulario
  editForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    try {
      await updateShow(originalShow);
    } catch (error) {
      console.error('Error al actualizar la serie:', error);
      alert('Error al actualizar: ' + error.message);
    }
  });

  // Botón cancelar
  cancelBtn.addEventListener('click', function() {
    if (confirm('¿Seguro que quieres cancelar los cambios?')) {
    window.location.href = 'http://localhost:3000';
    }
  });
}

/**
 * Renderiza los premios en el contenedor especificado
 * @param {Object} awards - Objeto con los premios de la serie
 */
function renderAwards(awards) {
  const awardsContainer = document.getElementById('awardsContainer');
  if (!awardsContainer) return;

  awardsContainer.innerHTML = '';

  if (!awards || typeof awards !== 'object' || Object.keys(awards).length === 0) {
    awardsContainer.innerHTML = '<p class="no-awards">No hay premios registrados</p>';
    return;
  }

  try {
    for (const [awardType, awardsList] of Object.entries(awards)) {
      if (Array.isArray(awardsList) && awardsList.length > 0) {
        const awardGroup = document.createElement('div');
        awardGroup.className = 'award-group';
        awardGroup.innerHTML = `<h4>${formatAwardType(awardType)}</h4>`;
        
        awardsList.forEach(award => {
          if (award && award.category && award.year) {
            const awardItem = document.createElement('div');
            awardItem.className = 'award-item';
            awardItem.innerHTML = `
              <p><strong>Categoría:</strong> ${award.category}</p>
              <p><strong>Año:</strong> ${award.year}</p>
            `;
            awardGroup.appendChild(awardItem);
          }
        });
        
        if (awardGroup.children.length > 1) {
          awardsContainer.appendChild(awardGroup);
        }
      }
    }

    if (awardsContainer.children.length === 0) {
      awardsContainer.innerHTML = '<p class="no-awards">No hay premios válidos para mostrar</p>';
    }
  } catch (error) {
    console.error('Error renderizando premios:', error);
    awardsContainer.innerHTML = '<p class="error-awards">Error al cargar los premios</p>';
  }
}

/**
 * Formatea el tipo de premio para mostrarlo correctamente
 * @param {string} type - Tipo de premio
 * @returns {string} Tipo formateado
 */
function formatAwardType(type) {
  if (!type) return 'Premios';
  return type
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace('Kids Choice Awards', 'Kids\' Choice Awards')
    .trim();
}

/**
 * Actualiza la serie en el servidor
 * @param {Object} originalShow - Datos originales de la serie
 */
async function updateShow(originalShow) {
  // Validar datos antes de enviar
  const name = document.getElementById('name').value.trim();
  if (!name) {
    throw new Error('El nombre de la serie es requerido');
  }

  const seasons = parseInt(document.getElementById('seasons').value);
  if (isNaN(seasons)) {
    throw new Error('El número de temporadas debe ser un valor numérico');
  }

  // Preparar datos actualizados
  const updatedShow = {
    name: name,
    seasons: seasons,
    running: document.getElementById('running').checked,
    streaming: document.getElementById('streaming').value
      .split(',')
      .map(item => item.trim())
      .filter(item => item),
    awards: originalShow.awards || {}
  };

  // Obtener ID de la serie
  const showId = originalShow._id?.$oid || originalShow._id;
  if (!showId) {
    throw new Error('No se pudo obtener el ID de la serie');
  }

  // Enviar datos al servidor
  const response = await fetch(`/api/shows/${showId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedShow)
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || 'Error al actualizar la serie');
  }

    window.location.href = 'http://localhost:3000';
}